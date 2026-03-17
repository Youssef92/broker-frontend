import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !user.roles?.includes(requiredRole)) {
    return <Navigate to="/upgrade-to-landlord" replace />;
  }

  return children;
}

export default ProtectedRoute;
