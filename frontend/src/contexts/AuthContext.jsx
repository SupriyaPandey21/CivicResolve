import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("cr_token");

    if (!token) {
      setUser(false);
      setReady(true);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem("cr_token");
        setUser(false);
      })
      .finally(() => {
        setReady(true);
      });
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem("cr_token", res.data.token);

    setUser(res.data.user);

    return res.data.user;
  };

  const register = async (email, password, name) => {
    const res = await api.post("/auth/register", {
      email,
      password,
      name,
    });

    localStorage.setItem("cr_token", res.data.token);

    setUser(res.data.user);

    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("cr_token");
    setUser(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);