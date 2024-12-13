// context/AuthContext.js
import React, { createContext, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [auth, setAuth] = useState({ token: null, user: null });

  const login = async (username, password) => {
    const res = await axios.post("/api/auth/login", { username, password });
    setAuth({ token: res.data.token, user: res.data.user });
    localStorage.setItem("token", res.data.token);
  };

  const logout = () => {
    setAuth({ token: null, user: null });
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;