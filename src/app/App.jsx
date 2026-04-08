import { useEffect } from "react";
import { listenToForegroundMessages } from "../services/notificationService";
import toast from "react-hot-toast";
import AppRoutes from "./routes";

function App() {
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

  return <AppRoutes />;
}

export default App;
