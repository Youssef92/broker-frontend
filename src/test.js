import * as signalR from "@microsoft/signalr";

const PROXY_URL =
  "https://proxy-server-production-3f3a.up.railway.app/hubs/notifications";

const getAccessToken = () => {
  return localStorage.getItem("token");
};

var connection = new signalR.HubConnectionBuilder()
  .withUrl(PROXY_URL, {
    skipNegotiation: false,
    transport:
      signalR.HttpTransportType.WebSockets |
      signalR.HttpTransportType.LongPolling,
    accessTokenFactory: () => getAccessToken(),
  })
  .configureLogging(signalR.LogLevel.Information)
  .withAutomaticReconnect()
  .build();

export const startSignalR = (onMessageReceived) => {
  connection.off("ReceiveNotification");

  connection.on("ReceiveNotification", (Data) => {
    console.log("Notification received:", Data);
    if (onMessageReceived) onMessageReceived(Data);
  });

  if (connection.state === signalR.HubConnectionState.Disconnected) {
    connection
      .start()
      .then(() =>
        console.log("SignalR Connected! ID:", connection.connectionId),
      )
      .catch((err) => console.error("SignalR Connection Error: ", err));
  }

  return connection;
};
