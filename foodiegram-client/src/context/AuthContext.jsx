// Global auth state: current user, token, and login/signup/logout actions.
// Persists token + user to localStorage so refreshing the page keeps you logged in.

import { createContext, useContext, useEffect, useState } from "react";
import { loginApi, signupApi, getMeApi } from "../api/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("foodiegram-user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // On first load, if a token exists, verify it's still valid by
  // fetching the current user. Keeps stale localStorage data from
  // silently persisting a logged-out session.
  useEffect(() => {
    const token = localStorage.getItem("foodiegram-token");
    if (!token) {
      setLoading(false);
      return;
    }
    getMeApi()
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("foodiegram-user", JSON.stringify(data.user));
      })
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for the axios interceptor's "session expired" event
  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener("foodiegram-unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("foodiegram-unauthorized", handleUnauthorized);
  }, []);

  const persistSession = (token, userData) => {
    localStorage.setItem("foodiegram-token", token);
    localStorage.setItem("foodiegram-user", JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (emailOrUsername, password) => {
    const { data } = await loginApi({ emailOrUsername, password });
    persistSession(data.token, data.user);
    return data.user;
  };

  const signup = async ({ name, username, email, password }) => {
    const { data } = await signupApi({ name, username, email, password });
    persistSession(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("foodiegram-token");
    localStorage.removeItem("foodiegram-user");
    setUser(null);
  };

  const updateLocalUser = (updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem("foodiegram-user", JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateLocalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
