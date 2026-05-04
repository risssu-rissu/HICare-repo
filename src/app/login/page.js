"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import "../auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error: authError } = await login(email, password);
      
      if (authError) {
        setError(authError.message);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper auth-page">
      <div className="auth-header">
        <Link href="/" className="auth-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Kembali ke Beranda
        </Link>
      </div>

      <div className="auth-container">
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <img src="/favicon.svg" alt="HiCare Logo" style={{ width: "48px", height: "48px", marginBottom: "1rem" }} />
          <h1 className="auth-title auth-title-gradient">Selamat Datang Kembali</h1>
          <p className="auth-subtitle">Masuk ke dashboard HiCare Anda</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Alamat Email</label>
            <input 
              type="email" 
              id="email" 
              className="form-input" 
              placeholder="anda@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Kata Sandi</label>
            <input 
              type="password" 
              id="password" 
              className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <div className="auth-footer">
          Belum punya akun? <Link href="/register" className="auth-link">Buat Akun</Link>
        </div>
      </div>
    </div>
  );
}
