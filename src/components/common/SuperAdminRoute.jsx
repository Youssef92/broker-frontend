import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

/**
 * Allows access only to users whose role is "SuperAdmin".
 * Redirects unauthenticated users to /login and unauthorised users to /.
 */
function SuperAdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isSuperAdmin =
    user.role === "SuperAdmin" ||
    user.roles?.includes("SuperAdmin") ||
    user.roleName === "SuperAdmin";

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default SuperAdminRoute;
