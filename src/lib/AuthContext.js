"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage for mock session on mount
    const storedUser = localStorage.getItem("hicare_session");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Mock login since we moved away from Supabase
      // In a real app, you would make a fetch request to /api/auth/login here
      if (!email || !password) {
        return { error: { message: "Please enter email and password" } };
      }

      const authUser = {
        email: email,
        name: email.split('@')[0],
        role: email === 'admin@hicare.com' ? "admin" : "user",
        id: "mock-user-id",
      };
      
      setUser(authUser);
      localStorage.setItem("hicare_session", JSON.stringify(authUser));
      return { error: null, user: authUser };
    } catch (err) {
      return { error: { message: "Network error" } };
    }
  };

  const register = async (name, email, password) => {
    try {
      // Mock register
      if (!email || !password || !name) {
        return { error: { message: "Please fill all fields" } };
      }

      const authUser = {
        email: email,
        name: name,
        role: "user",
        id: "mock-user-id",
      };
      
      setUser(authUser);
      localStorage.setItem("hicare_session", JSON.stringify(authUser));
      return { error: null, user: authUser };
    } catch (err) {
      return { error: { message: "Network error" } };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hicare_session");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
