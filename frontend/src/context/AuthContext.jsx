/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from "react";

const AuthContext = createContext(null);

function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null; // ms
  } catch {
    return null;
  }
}

function isExpired(token) {
  const expiry = getTokenExpiry(token);
  return expiry !== null && Date.now() >= expiry;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem("rg_admin_token");
    if (stored && isExpired(stored)) {
      localStorage.removeItem("rg_admin_token");
      localStorage.removeItem("rg_admin_user");
      return null;
    }
    return stored;
  });
  const [admin, setAdmin] = useState(() => {
    const raw = localStorage.getItem("rg_admin_user");
    return raw ? JSON.parse(raw) : null;
  });

  const login = useCallback(async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    localStorage.setItem("rg_admin_token", data.token);
    localStorage.setItem("rg_admin_user", JSON.stringify(data.admin));
    setToken(data.token);
    setAdmin(data.admin);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("rg_admin_token");
    localStorage.removeItem("rg_admin_user");
    setToken(null);
    setAdmin(null);
  }, []);

  // Auto-logout exactly when the token expires, even with no API calls
  useEffect(() => {
    if (!token) return;
    const expiry = getTokenExpiry(token);
    if (!expiry) return;
    const msLeft = expiry - Date.now();
    if (msLeft <= 0) {

      // eslint-disable-next-line react-hooks/set-state-in-effect
      logout();
      return;
    }
    const timer = setTimeout(logout, msLeft);
    return () => clearTimeout(timer);
  }, [token, logout]);

  const value = { token, admin, isAuthenticated: Boolean(token), login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}