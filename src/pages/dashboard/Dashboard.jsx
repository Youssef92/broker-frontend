import useAuth from "../../hooks/useAuth";
import LandlordDashboard from "./LandlordDashboard";
import ClientDashboard from "./ClientDashboard";
import AdminDashboard from "./AdminDashboard";

function Dashboard() {
  const { user } = useAuth();
  const roles = user?.roles || [];

  if (roles.includes("Landlord")) return <LandlordDashboard />;
  if (roles.includes("Admin") || roles.includes("SuperAdmin"))
    return <AdminDashboard />;
  return <ClientDashboard />;
}

export default Dashboard;
