// context/AuthContext.js
import React, { createContext, useState } from "react";
import axios from "./axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [auth, setAuth] = useState({ token: null, user: null });
  const [userData, setUserData] = useState(null); // New state for user data

  const login = async (username, password) => {
    const res = await axios.post("/auth/login", { username, password });
    setAuth({ token: res.data.token, user: res.data.user });
    localStorage.setItem("token", res.data.token);
  };

  const fetchUserData = async () => {
    console.log("Fetching user data");
    const token = localStorage.getItem("token"); // Retrieve the token from localStorage
    const res = await axios.get("/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`, // Add the token as a Bearer token in the header
      },
    });
    console.log(res.data);
    setUserData(res.data); // Set user data from the server
  };

  const logout = () => {
    setAuth({ token: null, user: null });
    setUserData(null); // Clear user data on logout
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, isAuthenticated, setIsAuthenticated, userData, fetchUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;