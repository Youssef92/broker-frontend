// src/services/signalRChatService.js
import * as signalR from "@microsoft/signalr";
import { getAccessToken } from "../utils/tokenManager";

const HUB_URL = "https://broker.runasp.net/hubs/chat";

let connection = null;
let retryCount = 0;
const handlers = {};

const registerHandlers = () => {
  Object.entries(handlers).forEach(([event, callbacks]) => {
    callbacks.forEach((callback) => {
      connection.on(event, callback);
    });
  });
};

export const startChatConnection = async () => {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    return;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => getAccessToken(),
    })
    .configureLogging(signalR.LogLevel.Information)
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) =>
        Math.min(Math.pow(2, retryContext.previousRetryCount) * 1000, 30000),
    })
    .build();

  connection.onreconnecting(() => {
    console.log("Chat: reconnecting...");
  });

  connection.onreconnected(() => {
    console.log("Chat: reconnected.");
    retryCount = 0;
    registerHandlers();
  });

  connection.onclose((error) => {
    if (error) {
      const isUnauthorized =
        error?.message?.includes("401") ||
        error?.message?.includes("Unauthorized");
      if (isUnauthorized) {
        connection = null;
        retryCount = 0;
        return;
      }
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
      retryCount++;
      setTimeout(() => startChatConnection(), delay);
    }
  });

  try {
    await connection.start();
    console.log("Chat: connected ✓");
    retryCount = 0;
    registerHandlers();
  } catch (err) {
    const isUnauthorized =
      err?.message?.includes("401") || err?.message?.includes("Unauthorized");
    if (isUnauthorized) {
      connection = null;
      retryCount = 0;
      setTimeout(() => startChatConnection(), 3000);
      return;
    }
    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
    retryCount++;
    setTimeout(() => startChatConnection(), delay);
  }
};

export const onChatEvent = (event, callback) => {
  if (!handlers[event]) handlers[event] = new Set();
  handlers[event].add(callback);
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    connection.on(event, callback);
  }
};

export const offChatEvent = (event, callback) => {
  if (callback) {
    handlers[event]?.delete(callback);
    connection?.off(event, callback);
  } else {
    delete handlers[event];
    connection?.off(event);
  }
};

export const stopChatConnection = async () => {
  if (!connection) return;
  Object.keys(handlers).forEach((k) => delete handlers[k]);
  await connection.stop();
  connection = null;
  retryCount = 0;
  console.log("Chat: disconnected");
};
