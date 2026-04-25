import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, Loader2, Trash2 } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import useAuth from "../../hooks/useAuth";
import {
  getMessages,
  sendMessage,
  markConversationAsRead,
  getConversationPresence,
  deleteMessage,
} from "../../services/chatService";
import { onChatEvent, offChatEvent } from "../../services/signalRChatService";
import toast from "react-hot-toast";

const FloatingChat = ({ bookingId, otherUserName, propertyTitle, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [presence, setPresence] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isFirstLoad = useRef(true);
  const messagesContainerRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Format last seen
  const formatLastSeen = (dateStr) => {
    if (!dateStr) return "Offline";
    return `Last seen ${formatDistanceToNow(new Date(dateStr), { addSuffix: true })}`;
  };

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    setIsLoadingMessages(true);
    try {
      const result = await getMessages(bookingId, { limit: 20 });
      if (result.succeeded) {
        setMessages([...(result.data || [])].reverse());
        setNextCursor(result.nextCursor || null);
        setHasMore(result.hasMore || false);
      }
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  }, [bookingId]);

  // Load older messages on scroll up
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || !nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);

    // Save current scroll height before adding messages
    const container = messagesContainerRef.current;
    const prevScrollHeight = container?.scrollHeight || 0;

    try {
      const result = await getMessages(bookingId, {
        cursor: nextCursor,
        limit: 20,
      });
      if (result.succeeded) {
        setMessages((prev) => [...(result.data || []).reverse(), ...prev]);
        setNextCursor(result.nextCursor || null);
        setHasMore(result.hasMore || false);

        // Restore scroll position after prepending messages
        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - prevScrollHeight;
          }
        });
      }
    } catch {
      toast.error("Failed to load older messages");
    } finally {
      setIsLoadingMore(false);
    }
  }, [bookingId, hasMore, nextCursor, isLoadingMore]);

  // Fetch presence
  const fetchPresence = useCallback(async () => {
    try {
      const result = await getConversationPresence(bookingId);
      if (result.succeeded) {
        setPresence(result.data);
      }
    } catch {
      // Presence is non-critical, fail silently
    }
  }, [bookingId]);

  // Notify navbar which chat is currently open
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("chatOpened", { detail: { bookingId } }),
    );
    return () => {
      window.dispatchEvent(new CustomEvent("chatClosed"));
    };
  }, [bookingId]);

  // On mount
  useEffect(() => {
    fetchMessages();
    fetchPresence();
    markConversationAsRead(bookingId).catch(() => {});
  }, [bookingId, fetchMessages, fetchPresence]);

  // Scroll to bottom after first load
  useEffect(() => {
    if (!isLoadingMessages && isFirstLoad.current) {
      scrollToBottom();
      isFirstLoad.current = false;
    }
  }, [isLoadingMessages]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (!isFirstLoad.current) {
      scrollToBottom();
    }
  }, [messages]);

  // Scroll listener for loading more
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (container.scrollTop === 0 && hasMore && !isLoadingMore) {
      loadMoreMessages();
    }
  }, [hasMore, isLoadingMore, loadMoreMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const handleClickOutside = () => setSelectedMessageId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // SignalR events
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      console.log("🔵 Raw SignalR message:", message);
      const normalized = {
        id: message.id ?? message.Id,
        senderId: message.senderId ?? message.SenderId,
        receiverId: message.receiverId ?? message.ReceiverId,
        content: message.content ?? message.Content,
        sentAt: message.sentAt ?? message.SentAt,
        isRead: message.isRead ?? message.IsRead ?? false,
        readAt: message.readAt ?? message.ReadAt ?? null,
      };
      setMessages((prev) => [...prev, normalized]);
      if (normalized.senderId !== user?.id) {
        markConversationAsRead(bookingId).catch(() => {});
      }
    };

    const handleMessageDeleted = (messageId) => {
      console.log("🗑️ MessageDeleted fired:", messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    };

    const handleUserTyping = ({ senderId, isTyping: typing }) => {
      if (senderId === user?.id) return;
      setIsTyping(typing);
      if (typing) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    };

    const handleUserStatusChanged = ({ userId, isOnline, lastSeenAt }) => {
      setPresence((prev) =>
        prev?.userId === userId ? { ...prev, isOnline, lastSeenAt } : prev,
      );
    };

    const handleMessageRead = ({ bookingId: bid }) => {
      if (bid !== bookingId) return;
      setMessages((prev) =>
        prev.map((m) => (m.senderId === user?.id ? { ...m, isRead: true } : m)),
      );
    };

    onChatEvent("ReceiveMessage", handleReceiveMessage);
    onChatEvent("MessageDeleted", handleMessageDeleted);
    onChatEvent("UserTyping", handleUserTyping);
    onChatEvent("UserStatusChanged", handleUserStatusChanged);
    onChatEvent("MessageRead", handleMessageRead);

    return () => {
      offChatEvent("ReceiveMessage", handleReceiveMessage);
      offChatEvent("MessageDeleted", handleMessageDeleted);
      offChatEvent("UserTyping", handleUserTyping);
      offChatEvent("UserStatusChanged", handleUserStatusChanged);
      offChatEvent("MessageRead", handleMessageRead);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [bookingId, user?.id]);

  const handleDeleteMessage = async (messageId) => {
    setSelectedMessageId(null);
    try {
      await deleteMessage(bookingId, messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch {
      toast.error("Failed to delete message");
    }
  };

  // Send message
  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setInputValue("");
    try {
      const result = await sendMessage(bookingId, trimmed);
      if (result.succeeded && result.data) {
        // Optimistically add our own message immediately
        const normalized = {
          id: result.data.id,
          senderId: result.data.senderId ?? result.data.SenderId,
          receiverId: result.data.receiverId ?? result.data.ReceiverId,
          content: result.data.content ?? result.data.Content,
          sentAt: result.data.sentAt ?? result.data.SentAt,
          isRead: false,
          readAt: null,
        };
        setMessages((prev) => [...prev, normalized]);
      }
    } catch {
      toast.error("Failed to send message");
      setInputValue(trimmed);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-6 right-6 z-50 flex flex-col"
      style={{
        width: "380px",
        height: "520px",
        background: "var(--dark-2)",
        border: "1px solid rgba(193,170,119,0.2)",
        borderRadius: "16px",
        boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        fontFamily: "'Jost', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(193,170,119,0.15)",
          background: "var(--dark-3)",
          borderRadius: "16px 16px 0 0",
        }}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div
            className="relative flex-shrink-0 flex items-center justify-center rounded-full"
            style={{
              width: 40,
              height: 40,
              background: "rgba(193,170,119,0.15)",
              border: "1px solid rgba(193,170,119,0.3)",
            }}
          >
            <span
              style={{ color: "var(--gold)", fontSize: 16, fontWeight: 600 }}
            >
              {otherUserName?.charAt(0)?.toUpperCase() || "?"}
            </span>
            {/* Online dot */}
            {presence?.isOnline && (
              <span
                className="absolute bottom-0 right-0 rounded-full"
                style={{
                  width: 10,
                  height: 10,
                  background: "#22c55e",
                  border: "2px solid var(--dark-3)",
                }}
              />
            )}
          </div>

          {/* Name + status */}
          <div className="min-w-0">
            <p
              className="truncate"
              style={{ color: "var(--cream)", fontSize: 14, fontWeight: 600 }}
            >
              {otherUserName}
            </p>
            <p
              className="truncate"
              style={{
                color: presence?.isOnline ? "#22c55e" : "rgba(245,240,232,0.4)",
                fontSize: 11,
              }}
            >
              {presence?.isOnline
                ? "Online"
                : presence?.lastSeenAt
                  ? formatLastSeen(presence.lastSeenAt)
                  : "Offline"}
            </p>
            <p
              className="truncate"
              style={{ color: "rgba(193,170,119,0.6)", fontSize: 11 }}
            >
              {propertyTitle}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 flex items-center justify-center rounded-full transition-colors"
          style={{
            width: 32,
            height: 32,
            background: "rgba(255,255,255,0.05)",
            color: "rgba(245,240,232,0.5)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
          }
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto"
        style={{
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* Load more spinner */}
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <Loader2
              size={18}
              className="animate-spin"
              style={{ color: "var(--gold)" }}
            />
          </div>
        )}

        {/* Initial loading */}
        {isLoadingMessages ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2
              size={24}
              className="animate-spin"
              style={{ color: "var(--gold)" }}
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p style={{ color: "rgba(245,240,232,0.3)", fontSize: 13 }}>
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            const isSelected = selectedMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className="flex relative"
                style={{ justifyContent: isMe ? "flex-end" : "flex-start" }}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isMe) {
                      setSelectedMessageId(isSelected ? null : msg.id);
                    }
                  }}
                  style={{
                    maxWidth: "72%",
                    padding: "10px 14px",
                    borderRadius: isMe
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    background: isMe
                      ? "rgba(34,197,94,0.2)"
                      : "rgba(245,240,232,0.08)",
                    border: isMe
                      ? "1px solid rgba(34,197,94,0.3)"
                      : "1px solid rgba(245,240,232,0.1)",
                    cursor: isMe ? "pointer" : "default",
                  }}
                >
                  <p
                    style={{
                      color: "var(--cream)",
                      fontSize: 13,
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.content}
                  </p>
                  <p
                    style={{
                      color: "rgba(245,240,232,0.3)",
                      fontSize: 10,
                      marginTop: 4,
                      textAlign: isMe ? "right" : "left",
                    }}
                  >
                    {new Date(msg.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {isMe && (
                      <span
                        style={{
                          marginLeft: 4,
                          color: msg.isRead
                            ? "#22c55e"
                            : "rgba(245,240,232,0.3)",
                        }}
                      >
                        {msg.isRead ? "✓✓" : "✓"}
                      </span>
                    )}
                  </p>

                  {/* Delete menu */}
                  {isMe && isSelected && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: "absolute",
                        bottom: "100%",
                        right: 0,
                        marginBottom: 4,
                        background: "var(--dark-3)",
                        border: "1px solid rgba(193,170,119,0.2)",
                        borderRadius: 8,
                        overflow: "hidden",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                        zIndex: 10,
                      }}
                    >
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 16px",
                          color: "#ef4444",
                          fontSize: 12,
                          fontFamily: "Jost, sans-serif",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          width: "100%",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(239,68,68,0.1)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <Trash2 size={13} />
                        Delete Message
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex"
            >
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "16px 16px 16px 4px",
                  background: "rgba(245,240,232,0.08)",
                  border: "1px solid rgba(245,240,232,0.1)",
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "rgba(245,240,232,0.4)",
                      display: "block",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(193,170,119,0.15)",
          background: "var(--dark-3)",
          borderRadius: "0 0 16px 16px",
          display: "flex",
          gap: "10px",
          alignItems: "flex-end",
        }}
      >
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(193,170,119,0.2)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "var(--cream)",
            fontSize: 13,
            resize: "none",
            outline: "none",
            fontFamily: "'Jost', sans-serif",
            lineHeight: 1.5,
            maxHeight: 100,
            overflowY: "auto",
          }}
          onFocus={(e) =>
            (e.target.style.borderColor = "rgba(193,170,119,0.5)")
          }
          onBlur={(e) => (e.target.style.borderColor = "rgba(193,170,119,0.2)")}
        />

        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isSending}
          className="flex-shrink-0 flex items-center justify-center rounded-full transition-all"
          style={{
            width: 40,
            height: 40,
            background: inputValue.trim()
              ? "var(--gold)"
              : "rgba(193,170,119,0.2)",
            color: inputValue.trim() ? "var(--dark)" : "rgba(193,170,119,0.4)",
            cursor: inputValue.trim() ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          {isSending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default FloatingChat;
