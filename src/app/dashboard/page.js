"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import HeartChart from "@/components/HeartChart";
import Waveform from "@/components/Waveform";
import "../style.css";

// Inline confirm dialog styles
const modalOverlayStyle = {
  position: "fixed", inset: 0, zIndex: 9999,
  background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const modalBoxStyle = {
  background: "#fff", borderRadius: "16px", padding: "2rem",
  maxWidth: "400px", width: "90%", textAlign: "center",
  boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
};

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [history, setHistory] = useState([]);
  const [chartRange, setChartRange] = useState(30);

  const [currentAvgBPM, setCurrentAvgBPM] = useState(0);
  const [prevAvgBPM, setPrevAvgBPM] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Health classify
  const classifyHealth = (bpm) => {
    if (bpm < 60) return { label: "Low", cls: "text-blue", pill: "elevated" };
    if (bpm <= 100) return { label: "Normal", cls: "text-green", pill: "normal" };
    if (bpm <= 120) return { label: "Elevated", cls: "text-yellow", pill: "elevated" };
    return { label: "High", cls: "text-red", pill: "high" };
  };
  const health = currentAvgBPM > 0 ? classifyHealth(currentAvgBPM) : { label: "—", cls: "" };

  // Trend
  const getTrend = (current, prev) => {
    if (!prev || !current) return { text: "—", cls: "stable" };
    const diff = current - prev;
    if (Math.abs(diff) <= 2) return { text: "● Stable", cls: "stable" };
    if (diff > 0) return { text: `▲ +${diff}`, cls: "up" };
    return { text: `▼ ${Math.abs(diff)}`, cls: "down" };
  };
  const trend = getTrend(currentAvgBPM, prevAvgBPM);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/history?limit=30");
      const result = await res.json();

      if (result.success && result.data.length > 0) {
        setIsConnected(true);
        const data = result.data.reverse(); // oldest first for charts

        setHistory(data);

        const latest = data[data.length - 1];
        setCurrentAvgBPM((prev) => {
          if (prev !== latest.avgBpm) {
            setPrevAvgBPM(prev);
          }
          return latest.avgBpm;
        });
      } else {
        // No data or error
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  }, []);

  // Delete all history
  const handleDeleteHistory = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        setHistory([]);
        setCurrentAvgBPM(0);
        setPrevAvgBPM(0);
        setIsConnected(false);
      } else {
        alert("Gagal menghapus data: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Gagal menghapus data.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Polling data
  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [fetchHistory]);

  // Auth protection check
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const chartDataBPM = useMemo(() => {
    return history.slice(-chartRange).map(d => d.avgBpm);
  }, [history, chartRange]);

  const chartDataTimestamps = useMemo(() => {
    return history.slice(-chartRange).map(d => {
      return new Date(d.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    });
  }, [history, chartRange]);

  const ringStyle = currentAvgBPM > 0 ? { "--pulse-dur": `${60 / currentAvgBPM}s` } : {};

  // Aggregate stats from history array
  const sum = history.reduce((acc, curr) => acc + curr.avgBpm, 0);
  const avgOverall = history.length > 0 ? Math.round(sum / history.length) : "--";
  const maxBpm = history.length > 0 ? Math.max(...history.map(d => d.avgBpm)) : "--";
  const minBpm = history.length > 0 ? Math.min(...history.map(d => d.avgBpm)) : "--";

  if (loading || !user) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--text-light)" }}>Loading dashboard secure area...</div>;
  }

  return (
    <div className="dashboard-page-wrapper dashboard-page">
      <header className="header" id="header">
        <div className="logo">
          <img src="/logo.png" alt="HiCare logo" />
          <span>HiCare</span>
        </div>

        <div className="dashboard-title">HiCare Dashboard</div>

        <div className="header-actions">
          <Link href="/" className="header-btn-home">
            <span>Home</span>
          </Link>

          <div className="user-profile">
            {user.role === "admin" && <span className="admin-badge">ADMIN</span>}
            <span className="user-name">{user.name}</span>
          </div>

          <button onClick={logout} className="btn-logout">
            Keluar
          </button>

          <div className="connection-badge">
            <span className={`connection-dot ${isConnected ? "" : "offline"}`}></span>
            <span>{isConnected ? "Terhubung" : "Menunggu Data..."}</span>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="hero fade-in" id="hero-section">
          <div className="bpm-display">
            <div className="bpm-ring" id="bpm-ring" style={ringStyle}>
              <span className="bpm-value">{currentAvgBPM || "--"}</span>
              <span className="bpm-label"><span className="heart-icon">&#9829;</span> AVG BPM</span>
            </div>
            <span className={`health-status-label ${health.cls}`} style={{ marginTop: ".75rem", fontSize: ".85rem", fontWeight: 700 }}>
              {health.label}
            </span>
            <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Data terupdate setiap sesi scanning (15s)
            </div>
          </div>
          <div className="waveform-container">
            <Waveform isConnected={isConnected} />
          </div>
        </section>

        <section className="metrics-grid" id="metrics-grid">
          <div className="metric-card fade-in">
            <div className="metric-header">
              <div className="metric-icon blue">&#9829;</div>
              <span className={`metric-trend ${trend.cls}`}>{trend.text}</span>
            </div>
            <div className="metric-value">{currentAvgBPM || "--"}</div>
            <div className="metric-name">BPM Rata-rata Terbaru</div>
          </div>
          <div className="metric-card fade-in">
            <div className="metric-header">
              <div className="metric-icon teal">&#8853;</div>
              <span className="metric-trend stable">—</span>
            </div>
            <div className="metric-value">{avgOverall}</div>
            <div className="metric-name">Rata-rata Keseluruhan</div>
          </div>
          <div className="metric-card fade-in">
            <div className="metric-header">
              <div className="metric-icon green">&#9660;</div>
              <span className="metric-trend stable">—</span>
            </div>
            <div className="metric-value">{minBpm}</div>
            <div className="metric-name">Sesi Terendah</div>
          </div>
          <div className="metric-card fade-in">
            <div className="metric-header">
              <div className="metric-icon yellow">&#9650;</div>
              <span className="metric-trend stable">—</span>
            </div>
            <div className="metric-value">{maxBpm}</div>
            <div className="metric-name">Sesi Tertinggi</div>
          </div>
        </section>

        <section className="chart-section fade-in" id="chart-section">
          <div className="section-header">
            <h2 className="section-title">Tren Sesi</h2>
          </div>
          <div className="chart-container">
            <HeartChart timestamps={chartDataTimestamps} bpmHistory={chartDataBPM} />
          </div>
        </section>

        <div className="bottom-grid">
          <div className="panel fade-in" id="history-panel">
            <div className="section-header">
              <h2 className="section-title">Sesi Scanning Terbaru</h2>
              {history.length > 0 && (
                <button
                  className="btn-delete-history"
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Hapus semua riwayat"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                  <span>Hapus Riwayat</span>
                </button>
              )}
            </div>
            <div style={{ maxHeight: "360px", overflowY: "auto", paddingRight: "5px" }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Tanggal & Waktu</th>
                    <th>Avg BPM</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...history].reverse().map((ses, i) => (
                    <tr key={ses._id || i}>
                      <td>
                        <div>{new Date(ses.timestamp).toLocaleDateString()}</div>
                        <div className="history-sub">
                          {new Date(ses.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </div>
                      </td>
                      <td><strong>{ses.avgBpm}</strong> BPM</td>
                      <td><span className={`status-pill ${classifyHealth(ses.avgBpm).pill}`}>{classifyHealth(ses.avgBpm).label}</span></td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center", padding: "2rem", color: "var(--text-light)" }}>Belum ada sesi pemindaian</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div style={modalOverlayStyle} onClick={() => setShowDeleteConfirm(false)}>
            <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🗑️</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Hapus Semua Riwayat?</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                Semua data sesi scanning akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{ padding: "0.6rem 1.5rem", borderRadius: "8px", border: "1px solid var(--border)", background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", color: "var(--text-secondary)" }}
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteHistory}
                  disabled={isDeleting}
                  style={{ padding: "0.6rem 1.5rem", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #C62828, #E53935)", color: "#fff", cursor: isDeleting ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "0.9rem", opacity: isDeleting ? 0.7 : 1 }}
                >
                  {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2026 <strong>HiCare</strong> — IoT Heart Rate Monitor &middot; Mongoose Edition &middot; v2.0.0</p>
      </footer>
    </div>
  );
}
