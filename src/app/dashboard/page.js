"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import HeartChart from "@/components/HeartChart";
import Waveform from "@/components/Waveform";
import "../style.css";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [history, setHistory] = useState([]);
  const [chartRange, setChartRange] = useState(30);

  const [currentAvgBPM, setCurrentAvgBPM] = useState(0);
  const [prevAvgBPM, setPrevAvgBPM] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

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

        <div style={{ fontWeight: "600", fontSize: "1.1rem", color: "rgba(255, 255, 255, 0.9)", letterSpacing: "0.5px" }}>
          HiCare Dashboard
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/" className="nav-back" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.8rem", background: "var(--blue-50)", color: "var(--blue-700)", border: "1px solid var(--blue-100)", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "600" }}>
            <span>Home</span>
          </Link>

          <div className="user-profile" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-light)", fontSize: "0.9rem" }}>
            {user.role === "admin" && <span style={{ background: "var(--primary)", color: "#fff", padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "bold" }}>ADMIN</span>}
            <span style={{ fontWeight: 500 }}>{user.name}</span>
          </div>

          <button onClick={logout} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "var(--text-light)", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", transition: "all 0.2s" }}>
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
      </main>

      <footer className="footer">
        <p>&copy; 2026 <strong>HiCare</strong> — IoT Heart Rate Monitor &middot; Mongoose Edition &middot; v2.0.0</p>
      </footer>
    </div>
  );
}
