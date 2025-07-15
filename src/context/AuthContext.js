// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load from localStorage and check token expiry
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      try {
        const decoded = jwtDecode(token);
        const expiresAt = decoded.exp * 1000;
        const isExpired = Date.now() > expiresAt;

        if (isExpired) {
          logout(); // Token expired
        } else {
          setUser(JSON.parse(savedUser));

          // ⏳ Optional: Auto logout before token expires
          const timeout = setTimeout(() => {
            logout();
          }, expiresAt - Date.now());

          return () => clearTimeout(timeout);
        }
      } catch (error) {
        console.warn("Invalid token:", error);
        logout(); // Invalid token
      }
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
