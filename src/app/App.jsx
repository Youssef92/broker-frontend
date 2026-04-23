import { useEffect } from "react";
import { listenToForegroundMessages } from "../services/notificationService";
import {
  startConnection,
  onNotificationReceived,
  offNotificationReceived,
} from "../../services/signalRService";
import toast from "react-hot-toast";
import AppRoutes from "./routes";
// import useAuth from "../hooks/useAuth";

function App() {
  // const { user } = useAuth();

  // Firebase foreground messages
  useEffect(() => {
    const unsubscribe = listenToForegroundMessages((payload) => {
      const title = payload?.notification?.title || "New Notification";
      const body = payload?.notification?.body || "";
      toast(body ? `${title}: ${body}` : title, {
        icon: "🔔",
        style: {
          background: "var(--dark-2)",
          color: "var(--cream)",
          border: "1px solid rgba(193,170,119,0.2)",
          fontFamily: "Jost, sans-serif",
          fontSize: "13px",
        },
      });
    });

    return () => unsubscribe();
  }, []);

  // // SignalR connection
  // useEffect(() => {
  //   if (user) {
  //     startConnection();
  //   } else {
  //     stopConnection();
  //   }
  // }, [user]);

  useEffect(() => {
    const handleMessage = (message) => {
      console.log("📨 New message:", message);
    };

    startConnection();
    onNotificationReceived(handleMessage);

    return () => {
      offNotificationReceived(handleMessage);
    };
  }, []);

  // ... rest of your App

  return <AppRoutes />;
}

export default App;
