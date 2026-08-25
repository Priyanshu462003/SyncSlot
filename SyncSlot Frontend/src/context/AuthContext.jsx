import { createContext, useContext, useMemo, useState } from "react";
import { login as loginRequest, register as registerRequest } from "../services/authService";

const AuthContext = createContext(null);

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("syncslot_user") || "null");
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);
  const [token, setToken] = useState(() => localStorage.getItem("syncslot_token"));

  const saveSession = (data) => {
    localStorage.setItem("syncslot_token", data.token);
    localStorage.setItem(
      "syncslot_user",
      JSON.stringify({
        userId: data.userId,
        name: data.name,
        role: data.role
      })
    );
    setToken(data.token);
    setUser({ userId: data.userId, name: data.name, role: data.role });
  };

  const login = async (credentials) => {
    const { data } = await loginRequest(credentials);
    saveSession(data);
    return data;
  };

  const register = async (payload) => {
    const { data } = await registerRequest(payload);
    saveSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("syncslot_token");
    localStorage.removeItem("syncslot_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);