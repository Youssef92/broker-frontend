import * as signalR from "@microsoft/signalr";

// const HUB_URL =
//   "https://broker-system-dwarekbaebcdgac9.spaincentral-01.azurewebsites.net/hubs/notifications";

// let connection = null;

// export const startConnection = async (token) => {
//   if (connection) return;

//   connection = new signalR.HubConnectionBuilder()
//     .withUrl(HUB_URL, {
//       accessTokenFactory: () => token,
//     })
//     .withAutomaticReconnect()
//     .configureLogging(signalR.LogLevel.Information)
//     .build();

//   try {
//     await connection.start();
//     console.log("SignalR connected ✓");
//   } catch (err) {
//     console.error("SignalR connection failed:", err);
//     connection = null;
//   }
// };

// export const onNotificationReceived = (callback) => {
//   console.log(callback);
//   console.log("Test");
//   if (!connection) return;
//   connection.on("ReceiveNotification", callback);
//   console.log(callback);
// };

// export const offNotificationReceived = () => {
//   if (!connection) return;
//   connection.off("ReceiveNotification");
// };

// export const stopConnection = async () => {
//   if (!connection) return;
//   await connection.stop();
//   connection = null;
//   console.log("SignalR disconnected");
// };

// var connection = new signalR.HubConnectionBuilder()
//     .withUrl("https://localhost:7296/DisplayPosts")
//     .configureLogging(signalR.LogLevel.Information) // Enable detailed logging
//     .build();

// async function startConnection() {
//     try {
//         await connection.start();
//         console.log("SignalR Connected.");
//     } catch (err) {
//         console.log("Connection error: ", err);
//         // Try again after 5 seconds
//         setTimeout(startConnection, 5000);
//     }
// }

//     Connection.on("ReceivePost", function (Data) {
//         console.log(Data)
// })
// // Add connection status handlers
// connection.onclose(async () => {
//     console.log("Connection closed. Attempting to reconnect...");
//     await startConnection();
// });

// // Start the connection
// startConnection();

// Create the connection
// var connection2 = new signalR.HubConnectionBuilder()
//     .withUrl("https://localhost:7296/DisplayNewCommentNotification")
//     .configureLogging(signalR.LogLevel.Information)
//     .withAutomaticReconnect({
//         nextRetryDelayInMilliseconds: retryContext => {
//             // Exponential backoff: 1s, 2s, 4s, 8s, 16s, then max 30s
//             return Math.min(Math.pow(2, retryContext.previousRetryCount) * 1000, 30000);
//         }
//     })
//     .build();

var connection = new signalR.HubConnectionBuilder()
  .withUrl(
    "https://broker-system-dwarekbaebcdgac9.spaincentral-01.azurewebsites.net/hubs/notifications",
  )
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

// Define your handler for receiving posts
connection.on("ReceiveNotification", function (Data) {
  console.log("ReceiveNewMessage data:", Data);
  // Add your logic to handle the incoming post data
});

// connection2.on("ReceiveNewCommentInPost", function(Data) {
//     console.log("Received Notification Add Comment:",Data);
//     // Add your logic to handle the incoming post data
// });

// Connection status handlers
connection.onreconnecting((error) => {
  console.log("Connection lost. Attempting to reconnect...", error);
});

connection.onreconnected((connectionId) => {
  console.log("Connection reestablished. New connection ID:", connectionId);
});

connection.onclose((error) => {
  console.log("Connection closed.", error);
  // Only attempt manual reconnect if it wasn't an intentional close
  if (error) {
    startConnection();
  }
});

// Start the connection with retry logic
async function startConnection() {
  try {
    await connection.start();
    console.log("SignalR Connected. Connection ID:", connection.connectionId);

    // Optional: Call server methods after connection is established
    // await connection.invoke("SomeServerMethod");
  } catch (err) {
    console.error("Connection failed:", err);

    // Exponential backoff for retry (1s, 2s, 4s, 8s, etc.)
    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30s delay
    retryCount++;

    console.log(`Retrying in ${delay / 1000} seconds...`);
    setTimeout(startConnection, delay);
  }
}
// async function startConnection2() {
//     try {
//         await connection2.start();
//         console.log("SignalR Connected. Connection ID:", connection2.connectionId);

//         // Optional: Call server methods after connection is established
//         // await connection.invoke("SomeServerMethod");

//     } catch (err) {
//         console.error("Connection failed:", err);

//         // Exponential backoff for retry (1s, 2s, 4s, 8s, etc.)
//         const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30s delay
//         retryCount++;

//         console.log(`Retrying in ${delay/1000} seconds...`);
//         setTimeout(startConnection2, delay);
//     }
// }
let retryCount = 0;
startConnection();
//startConnection2();
// Optional: Add this to your window object for debugging
window.signalRConnection = connection;
