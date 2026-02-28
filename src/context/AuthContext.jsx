import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { refreshTokenRequest } from "../services/authService";
import { setAccessToken, clearAccessToken } from "../utils/tokenManager";
import { AuthContext } from "./authContextValue";

const REFRESH_TOKEN_KEY = "refreshToken";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    clearAccessToken();
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setUser(null);
    navigate("/login");
  }, [navigate]);

  // On app start — check if user was already logged in
  useEffect(() => {
    const restoreSession = async () => {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!storedRefreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await refreshTokenRequest(storedRefreshToken);

        if (result.succeeded) {
          setAccessToken(result.data.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, result.data.refreshToken);
          setUser(result.data.user);
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [logout]);

  const login = (data) => {
    setAccessToken(data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    setUser(data.user);
    navigate("/home");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
