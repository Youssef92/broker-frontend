import * as signalR from "@microsoft/signalr";

const HUB_URL =
  "https://broker-system-dwarekbaebcdgac9.spaincentral-01.azurewebsites.net/hubs/notifications";

let connection = null;

export const startConnection = async (token) => {
  if (connection) return;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  try {
    await connection.start();
    console.log("SignalR connected ✓");
  } catch (err) {
    console.error("SignalR connection failed:", err);
    connection = null;
  }
};

export const onNotificationReceived = (callback) => {
  if (!connection) return;
  connection.on("ReceiveNotification", callback);
  console.log(callback);
};

export const offNotificationReceived = () => {
  if (!connection) return;
  connection.off("ReceiveNotification");
};

export const stopConnection = async () => {
  if (!connection) return;
  await connection.stop();
  connection = null;
  console.log("SignalR disconnected");
};
