import * as signalR from "@microsoft/signalr";

let connection = null;
let retryCount = 0;

export async function startConnection(token) {
  // ✅ Build the connection HERE so token is available
  connection = new signalR.HubConnectionBuilder()
    .withUrl(
      "https://broker-system-dwarekbaebcdgac9.spaincentral-01.azurewebsites.net/hubs/notifications",
      {
        accessTokenFactory: () => token, // ✅ Token passed here
      },
    )
    .configureLogging(signalR.LogLevel.Information)
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) =>
        Math.min(Math.pow(2, retryContext.previousRetryCount) * 1000, 30000),
    })
    .build();

  // Register handlers after building
  connection.on("ReceiveNotification", function (Data) {
    console.log("ReceiveNewMessage data:", Data);
  });

  connection.onreconnecting((error) => {
    console.log("Connection lost. Attempting to reconnect...", error);
  });

  connection.onreconnected((connectionId) => {
    console.log("Connection reestablished. New connection ID:", connectionId);
  });

  connection.onclose((error) => {
    console.log("Connection closed.", error);
    if (error) startConnection(token); // ✅ Pass token on reconnect too
  });

  try {
    await connection.start();
    console.log("SignalR Connected. Connection ID:", connection.connectionId);
    retryCount = 0;
  } catch (err) {
    console.error("Connection failed:", err);
    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
    retryCount++;
    console.log(`Retrying in ${delay / 1000} seconds...`);
    setTimeout(() => startConnection(token), delay); // ✅ Pass token on retry
  }
}

export function onNotificationReceived(callback) {
  if (!connection) return;
  connection.on("ReceiveNotification", callback);
}

export function offNotificationReceived() {
  if (!connection) return;
  connection.off("ReceiveNotification");
}

export async function stopConnection() {
  if (connection) {
    await connection.stop();
    connection = null;
  }
}
