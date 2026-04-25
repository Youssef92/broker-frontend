import axiosInstance from "./axiosInstance";

export const getMessages = async (bookingId, params = {}) => {
  const response = await axiosInstance.get(
    `/api/v1/Chat/conversations/${bookingId}/messages`,
    { params }
  );
  return response.data;
};

export const sendMessage = async (bookingId, content) => {
  const response = await axiosInstance.post(
    `/api/v1/Chat/conversations/${bookingId}/messages`,
    { content, bookingId }
  );
  return response.data;
};

export const markConversationAsRead = async (bookingId) => {
  const response = await axiosInstance.patch(
    `/api/v1/Chat/conversations/${bookingId}/messages/read`
  );
  return response.data;
};

export const getConversationUnreadCount = async (bookingId) => {
  const response = await axiosInstance.get(
    `/api/v1/Chat/conversations/${bookingId}/unread-count`
  );
  return response.data;
};

export const getTotalUnreadCount = async () => {
  const response = await axiosInstance.get(`/api/v1/Chat/unread-count`);
  return response.data;
};

export const getConversationPresence = async (bookingId) => {
  const response = await axiosInstance.get(
    `/api/v1/Chat/conversations/${bookingId}/presence`
  );
  return response.data;
};

export const deleteMessage = async (bookingId, messageId) => {
  const response = await axiosInstance.delete(
    `/api/v1/Chat/conversations/${bookingId}/messages/${messageId}`
  );
  return response.data;
};