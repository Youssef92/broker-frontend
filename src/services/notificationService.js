import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase";
import axiosInstance from "./axiosInstance";

const VAPID_KEY =
  "BFcIpr07qGAp63H-zYow46r4-Vpd-X8RInSJdXHKPTqaROrzQI5JFTKPpgDRAX52dfja0cXWUiSHjIvGXqeS5f0";

export async function registerDeviceForNotifications() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    console.log("FCM Token:", token);
    if (!token) return;

    await axiosInstance.post("/api/v1/Notifications/register-device", {
      token,
      provider: 1,
      deviceName: navigator.userAgent,
    });
  } catch (error) {
    console.error("Failed to register device for notifications:", error);
  }
}

export async function unregisterDeviceForNotifications() {
  try {
    const deviceId = localStorage.getItem("deviceId");
    await axiosInstance.post("/api/v1/Notifications/unregister-device", {
      deviceId,
    });
  } catch (error) {
    console.error("Failed to unregister device:", error);
  }
}

export function listenToForegroundMessages(callback) {
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
}
