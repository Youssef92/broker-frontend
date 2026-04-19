import * as signalR from "@microsoft/signalr";
import { getAccessToken } from "../utils/tokenManager";

const HUB_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/hubs/notifications`
  : "/hubs/notifications";

// "https://broker-system-dwarekbaebcdgac9.spaincentral-01.azurewebsites.net/hubs/notifications";

let connection = null;
let retryCount = 0;

export const startConnection = async () => {
  // Prevent duplicate connections
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    console.log("SignalR already connected, skipping...");
    return;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => getAccessToken(), // ✅ always reads fresh token
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
  } catch (err) {
    console.error("SignalR connection failed:", err);
    const isUnauthorized =
      err?.message?.includes("401") || err?.message?.includes("Unauthorized");
    if (isUnauthorized) {
      console.warn("SignalR: Unauthorized — will retry after token refresh.");
      connection = null;
      retryCount = 0;
      // Wait 3 seconds for axios interceptor to refresh the token, then retry
      setTimeout(() => startConnection(), 3000);
      return;
    }
    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
    retryCount++;
    console.log(`Retrying in ${delay / 1000}s...`);
    setTimeout(() => startConnection(), delay);
  }
};

export const onNotificationReceived = (callback) => {
  if (!connection) return;
  connection.on("ReceiveNotification", callback);
};

export const offNotificationReceived = () => {
  if (!connection) return;
  connection.off("ReceiveNotification");
};

export const stopConnection = async () => {
  if (!connection) return;
  await connection.stop();
  connection = null;
  retryCount = 0;
  console.log("SignalR disconnected");
};
