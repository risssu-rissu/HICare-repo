"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage for session on mount
    const storedUser = localStorage.getItem("hicare_session");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      if (!email || !password) {
        return { error: { message: "Masukkan email dan password" } };
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        return { error: { message: data.error || "Login gagal" } };
      }

      const authUser = data.user;
      setUser(authUser);
      localStorage.setItem("hicare_session", JSON.stringify(authUser));
      return { error: null, user: authUser };
    } catch (err) {
      return { error: { message: "Kesalahan jaringan. Coba lagi." } };
    }
  };

  const register = async (name, email, password) => {
    try {
      if (!email || !password || !name) {
        return { error: { message: "Semua field harus diisi" } };
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        return { error: { message: data.error || "Pendaftaran gagal" } };
      }

      const authUser = data.user;
      setUser(authUser);
      localStorage.setItem("hicare_session", JSON.stringify(authUser));
      return { error: null, user: authUser };
    } catch (err) {
      return { error: { message: "Kesalahan jaringan. Coba lagi." } };
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
