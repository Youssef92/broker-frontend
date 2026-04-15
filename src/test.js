import * as signalR from "@microsoft/signalr";

// The Proxy URL on Railway that connects to your Backend
const PROXY_URL =
  "https://proxy-server-production-3f3a.up.railway.app/hubs/notifications";

// Create the SignalR connection
var connection = new signalR.HubConnectionBuilder()
  .withUrl(PROXY_URL, {
    // skipNegotiation: false ensures compatibility with the proxy
    skipNegotiation: false,
    // Allowing both WebSockets and Long Polling for better stability
    transport:
      signalR.HttpTransportType.WebSockets |
      signalR.HttpTransportType.LongPolling,
  })
  .configureLogging(signalR.LogLevel.Information)
  .withAutomaticReconnect({
    nextRetryDelayInMilliseconds: (retryContext) => {
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s, then max 30s
      return Math.min(
        Math.pow(2, retryContext.previousRetryCount) * 1000,
        30000,
      );
    },
  })
  .build();

// Event handler for receiving notifications from the server
connection.on("ReceiveNotification", function (Data) {
  console.log("Notification received:", Data);
});

// Connection status monitoring
connection.onreconnecting((error) => {
  console.log("Connection lost. Attempting to reconnect...", error);
});

connection.onreconnected((connectionId) => {
  console.log("Connection reestablished. New connection ID:", connectionId);
});

connection.onclose((error) => {
  console.log("Connection closed.", error);
  // Manual restart if the connection closed unexpectedly
  if (error) {
    startConnection();
  }
});

let retryCount = 0;

// Function to start the connection with custom retry logic
async function startConnection() {
  try {
    await connection.start();
    console.log("SignalR Connected. Connection ID:", connection.connectionId);
    retryCount = 0; // Reset retry counter on successful connection
  } catch (err) {
    console.error("Connection failed:", err);

    // Calculate delay before next attempt
    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
    retryCount++;

    console.log(`Retrying in ${delay / 1000} seconds...`);
    setTimeout(startConnection, delay);
  }
}

// Initial call to start the connection
startConnection();
