import * as signalR from "@microsoft/signalr";
import { getAccessToken } from "../utils/tokenManager";

let connection = null;
let retryCount = 0;
const handlers = new Set(); // ✅ store all callbacks so they survive reconnects

// ─── Internal: register all stored handlers on the connection ───
const registerHandlers = () => {
  handlers.forEach((callback) => {
    connection.on("ReceiveMessage", callback);
  });
};

// ─── Start Connection ───────────────────────────────────────────
export const startConnection = async () => {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    console.log("SignalR already connected, skipping...");
    return;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl("https://5cc7-197-43-185-226.ngrok-free.app/hubs/chat", {
      accessTokenFactory: () => getAccessToken(),
    })
    .configureLogging(signalR.LogLevel.Information)
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) =>
        Math.min(Math.pow(2, retryContext.previousRetryCount) * 1000, 30000),
    })
    .build();

  connection.onreconnecting((error) => {
    console.log("SignalR reconnecting...", error);
  });

  connection.onreconnected((connectionId) => {
    console.log("SignalR reconnected. ID:", connectionId);
    retryCount = 0;
    registerHandlers(); // ✅ re-register after reconnect
  });

  connection.onclose((error) => {
    console.log("SignalR connection closed.", error);
    if (error) {
      const isUnauthorized =
        error?.message?.includes("401") ||
        error?.message?.includes("Unauthorized");
      if (isUnauthorized) {
        console.warn("SignalR: Unauthorized — stopping retry.");
        connection = null;
        retryCount = 0;
        return;
      }
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
      retryCount++;
      console.log(`Retrying in ${delay / 1000}s...`);
      setTimeout(() => startConnection(), delay);
    }
  });

  try {
    await connection.start();
    console.log("SignalR connected ✓ ID:", connection.connectionId);
    retryCount = 0;
    registerHandlers(); // ✅ register handlers right after connection is ready
  } catch (err) {
    console.error("SignalR connection failed:", err);
    const isUnauthorized =
      err?.message?.includes("401") || err?.message?.includes("Unauthorized");
    if (isUnauthorized) {
      console.warn("SignalR: Unauthorized — will retry after token refresh.");
      connection = null;
      retryCount = 0;
      setTimeout(() => startConnection(), 3000);
      return;
    }
    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
    retryCount++;
    console.log(`Retrying in ${delay / 1000}s...`);
    setTimeout(() => startConnection(), delay);
  }
};

// ─── Subscribe ──────────────────────────────────────────────────
export const onNotificationReceived = (callback) => {
  handlers.add(callback); // ✅ always store it

  // If already connected, register immediately
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    connection.on("ReceiveMessage", callback);
  }
};

// ─── Unsubscribe ────────────────────────────────────────────────
export const offNotificationReceived = (callback) => {
  if (callback) {
    handlers.delete(callback); // ✅ remove specific callback
    connection?.off("ReceiveMessage", callback);
  } else {
    handlers.clear(); // ✅ remove all if no callback passed
    connection?.off("ReceiveMessage");
  }
};

// ─── Stop ───────────────────────────────────────────────────────
export const stopConnection = async () => {
  if (!connection) return;
  handlers.clear();
  await connection.stop();
  connection = null;
  retryCount = 0;
  console.log("SignalR disconnected");
};
