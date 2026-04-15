import * as signalR from "@microsoft/signalr";

// const PROXY_URL =
//   "https://proxy-server-production-3f3a.up.railway.app/hubs/notifications";

// const getAccessToken = () => {
//   return localStorage.getItem("token");
// };

// var connection = new signalR.HubConnectionBuilder()
//   .withUrl(PROXY_URL, {
//     skipNegotiation: false,
//     transport: signalR.HttpTransportType.WebSockets,
//     accessTokenFactory: () => getAccessToken(),
//   })
//   .configureLogging(signalR.LogLevel.Information)
//   .withAutomaticReconnect()
//   .build();

// export const startSignalR = (onMessageReceived) => {
//   connection.off("ReceiveNotification");

//   connection.on("ReceiveNotification", (Data) => {
//     console.log("Notification received:", Data);
//     if (onMessageReceived) onMessageReceived(Data);
//   });

//   if (connection.state === signalR.HubConnectionState.Disconnected) {
//     connection
//       .start()
//       .then(() =>
//         console.log("SignalR Connected! ID:", connection.connectionId),
//       )
//       .catch((err) => console.error("SignalR Connection Error: ", err));
//   }

//   return connection;
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

// var connection = new signalR.HubConnectionBuilder()
//     .withUrl("http://localhost:7070/hubs/notifications"),
//     {
//         // 🚀 FRONTEND REQUIREMENT: Send the token here
//         accessTokenFactory: () => localStorage.getItem("jwt_token")
//     }
//     .configureLogging(signalR.LogLevel.Information)
//     .withAutomaticReconnect({
//         nextRetryDelayInMilliseconds: retryContext => {
//             // Exponential backoff: 1s, 2s, 4s, 8s, 16s, then max 30s
//             return Math.min(Math.pow(2, retryContext.previousRetryCount) * 1000, 30000);
//         }
//     })
//     .build();

const accesstoken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJiNWQwMGU3ZS0wMWE0LTQ2NWEtOTVlNS05ZGYzMzYzNTFhNTkiLCJ1bmlxdWVfbmFtZSI6IllvdXNzZWYgSGFzc2FuIiwiZW1haWwiOiJ5b3Vzc2VmaGFzc2FuMTQxOUBnbWFpbC5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9tb2JpbGVwaG9uZSI6IisyMDEwNjA4NjE2NDciLCJqdGkiOiIxZTEwN2VlZS04Yzg1LTQ1ZmQtYjRlZS0yMzg4YTNmZThlODUiLCJyb2xlIjpbIkNsaWVudCIsIkxhbmRsb3JkIl0sIm5iZiI6MTc3NjI4NDA3NCwiZXhwIjoxNzc2Mjg0OTc0LCJpYXQiOjE3NzYyODQwNzQsImlzcyI6IkJyb2tlclN5c3RlbV9BcGlfVjEiLCJhdWQiOiJCcm9rZXJTeXN0ZW1fQ2xpZW50cyJ9.7HtwX_b518RVGnd7SsBSGA-4K8jUebhW8LZDZQf4f4Y";

var connection = new signalR.HubConnectionBuilder()
  // 🚀 FIX: The options object must be inside the withUrl parenthesis as the second parameter
  .withUrl(
    "https://proxy-server-production-3f3a.up.railway.app/hubs/notifications",
    {
      // 🚀 FRONTEND REQUIREMENT: Send the token here
      accessTokenFactory: () => accesstoken,
    },
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
  console.log("ReceiveNewMessage Data:", Data);
  // Add your logic to handle the incoming post data
});

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
