"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import "./landing.css";
import "./landing-additions.css";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [heroBpm, setHeroBpm] = useState(72);
  const canvasRef = useRef(null);
  const { user } = useAuth();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hero BPM simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroBpm((prev) => {
        const delta = (Math.random() - 0.5) * 4 + (72 - prev) * 0.08;
        return Math.round(Math.max(60, Math.min(90, prev + delta)));
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Waveform canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener("resize", resize);
    resize();

    const ecgY = (t) => {
      t = t % 1;
      if (t < 0.05) return 0;
      if (t < 0.08) return Math.sin(((t - 0.05) / 0.03) * Math.PI) * 0.15;
      if (t < 0.15) return 0;
      if (t < 0.17) return -0.08;
      if (t < 0.22) return Math.sin(((t - 0.17) / 0.05) * Math.PI) * 0.85;
      if (t < 0.27) return -0.15;
      if (t < 0.4) return Math.sin(((t - 0.27) / 0.13) * Math.PI) * 0.12;
      return 0;
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const mid = h / 2;
      ctx.clearRect(0, 0, w, h);

      const now = performance.now() / 1000;

      const grd = ctx.createLinearGradient(0, 0, w, 0);
      grd.addColorStop(0, "rgba(66,165,245,.15)");
      grd.addColorStop(0.5, "#42A5F5");
      grd.addColorStop(1, "#26C6DA");

      ctx.strokeStyle = grd;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const t = (now * 1.2 + (x / w) * 2) % 2;
        const y = mid - ecgY(t / 2) * (h * 0.7);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Glow
      ctx.strokeStyle = "rgba(66,165,245,.1)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const t = (now * 1.2 + (x / w) * 2) % 2;
        const y = mid - ecgY(t / 2) * (h * 0.7);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Intersection observers and scroll links
  useEffect(() => {
    // Scroll reveal
    const revealElements = document.querySelectorAll(
      ".feature-card, .step-card, .stat-card, .product-preview, .cta-container"
    );
    revealElements.forEach((el) => el.classList.add("reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealElements.forEach((el) => observer.observe(el));

    // Stat counter animation
    const animateCounter = (el, target) => {
      const duration = 1500;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const statValues = document.querySelectorAll(".stat-value[data-target]");
    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target);
            animateCounter(el, target);
            statObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    statValues.forEach((el) => statObserver.observe(el));

    return () => {
      observer.disconnect();
      statObserver.disconnect();
    };
  }, []);

  const handleSmoothScroll = (e, id) => {
    e.preventDefault();
    if (id === "#") return;
    const target = document.querySelector(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="landing-page">
      <nav className={`nav ${isScrolled ? "scrolled" : ""}`} id="nav">
        <div className="nav-inner container">
          <Link href="#" className="nav-logo">
            <img src="/favicon.svg" alt="HiCare" />
            <span>HiCare</span>
          </Link>
          <ul
            className={`nav-menu ${isMenuOpen ? "nav-menu-open" : ""}`}
            id="nav-menu"
            style={
              isMenuOpen
                ? {
                  display: "flex",
                  flexDirection: "column",
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "rgba(255,255,255,.98)",
                  backdropFilter: "blur(16px)",
                  padding: "1rem 1.5rem",
                  gap: ".25rem",
                  borderBottom: "1px solid var(--border)",
                  borderRadius: "0 0 14px 14px",
                  boxShadow: "0 8px 32px rgba(0,0,0,.08)",
                }
                : {}
            }
          >
            <li>
              <a href="#features" onClick={(e) => handleSmoothScroll(e, "#features")}>
                Fitur
              </a>
            </li>
            <li>
              <a href="#how-it-works" onClick={(e) => handleSmoothScroll(e, "#how-it-works")}>
                Cara Kerja
              </a>
            </li>
            <li>
              <a href="#stats" onClick={(e) => handleSmoothScroll(e, "#stats")}>
                Dampak
              </a>
            </li>
            <li>
              <a href="#product" onClick={(e) => handleSmoothScroll(e, "#product")}>
                Produk
              </a>
            </li>
            {isMenuOpen && (
              <li style={{ marginTop: ".5rem" }}>
                <Link
                  href="/dashboard"
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Buka Dashboard
                </Link>
              </li>
            )}
          </ul>
          <div className="nav-actions">
            <Link href="/dashboard" className="btn btn-outline" id="btn-dashboard">
              Buka Dashboard
            </Link>
            <button
              className={`hamburger ${isMenuOpen ? "active" : ""}`}
              id="hamburger"
              aria-label="Toggle menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      <section className="hero" id="hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="hero-badge">&#9829; Teknologi kesehatan berbasis IoT</span>
            <h1 className="hero-title">
              Monitoring<br />
              <span className="gradient-text">Heart Rate</span><br />
              Secara Real-time
            </h1>
            <p className="hero-subtitle">
              Dengan pulse sensor amped HiCare memonitoring detak jantung secara real time. Rekam detak jantungmu, analisis, dan kontrol Kesehatan jantungmu semua hanya melalui website.
            </p>
            <div className="hero-cta">
              <Link href="/dashboard" className="btn btn-primary" id="hero-cta-dashboard">
                <span>Buka Dashboard</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <a href="#how-it-works" className="btn btn-ghost" id="hero-cta-learn" onClick={(e) => handleSmoothScroll(e, "#how-it-works")}>
                Lebih lanjut
              </a>
            </div>
            <div className="hero-stats-row">
              <div className="hero-stat">
                <strong>±1</strong>
                <span>Akurasi BPM</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <strong>24/7</strong>
                <span>Monitoring</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <strong>Real-Time</strong>
                <span>Sinkronasi Data</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="pulse-card">
              <div className="pulse-card-ring">
                <svg viewBox="0 0 120 120" className="ring-svg">
                  <circle cx="60" cy="60" r="54" stroke="rgba(66,165,245,.15)" strokeWidth="3" fill="none" />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="url(#ring-grad)"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="339.3"
                    strokeDashoffset="85"
                    strokeLinecap="round"
                    className="ring-progress"
                  />
                  <defs>
                    <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#42A5F5" />
                      <stop offset="100%" stopColor="#26C6DA" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="pulse-card-bpm">
                  <span className="bpm-num" id="hero-bpm">{heroBpm}</span>
                  <span className="bpm-unit">BPM</span>
                </div>
              </div>
              <canvas id="hero-waveform" ref={canvasRef} className="pulse-card-wave"></canvas>
              <div className="pulse-card-footer">
                <span className="pulse-status-dot"></span>
                <span>Live Monitoring</span>
              </div>
            </div>
            <div className="float-card float-card-1">
              <span className="fc-icon" style={{ color: "#66BB6A" }}>♥</span>
              <div>
                <strong>Normal</strong><br />
                <small>Status Kesehatan</small>
              </div>
            </div>
            <div className="float-card float-card-2">
              <span className="fc-icon" style={{ color: "#42A5F5" }}>⚡</span>
              <div>
                <strong>Terhubung</strong><br />
                <small>Perangkat Aktif</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section features" id="features">
        <div className="container">
          <div className="section-label">Fitur</div>
          <h2 className="section-heading">
            Semua Yang Dibutuhkan Untuk<br />
            <span className="gradient-text">Monitoring Detak Jantung</span>
          </h2>
          <p className="section-subheading">Kemampuan IoT canggih dalam antarmuka yang sederhana dan elegan</p>

          <div className="features-grid">
            <div className="feature-card" id="feature-realtime">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h3>BPM Real-Time</h3>
              <p>Dapatkan pembacaan detak jantung instan yang diperbarui setiap detik dengan akurasi tingkat klinis dari Pulse Sensor Amped.</p>
            </div>
            <div className="feature-card" id="feature-cloud">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                </svg>
              </div>
              <h3>Sinkronisasi Cloud</h3>
              <p>Semua pembacaan disinkronkan dengan aman. Akses data Anda dari mana saja, di perangkat apa pun, kapan saja.</p>
            </div>
            <div className="feature-card" id="feature-analytics">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <h3>Analitik Langsung</h3>
              <p>Grafik interaktif dan tampilan garis waktu memungkinkan Anda untuk melihat tren, melacak rata-rata, dan memahami kesehatan jantung Anda secara sekilas.</p>
            </div>
            <div className="feature-card" id="feature-alerts">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <h3>Peringatan Kesehatan</h3>
              <p>Klasifikasi status kesehatan otomatis Normal, Meningkat, atau Tinggi sehingga Anda selalu tahu kondisi kesehatan Anda.</p>
            </div>
            <div className="feature-card" id="feature-history">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3>Riwayat Sesi</h3>
              <p>Setiap sesi pemantauan dicatat dengan stempel waktu, nilai rata-rata, dan pembacaan minimum/maksimum untuk pelacakan jangka panjang.</p>
            </div>
            <div className="feature-card" id="feature-responsive">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <h3>Desain Responsif</h3>
              <p>Pantau detak jantung Anda dari layar apa pun desktop, tablet, atau ponsel. Dasbor ini beradaptasi dengan indah di setiap ukuran layar.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-label">Cara Kerja</div>
          <h2 className="section-heading">
            Pengaturan Simpel,<br />
            <span className="gradient-text">Monitoring Handal</span>
          </h2>

          <div className="steps-grid">
            <div className="step-card" id="step-1">
              <div className="step-number">01</div>
              <div className="step-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3>Pasang Sensor</h3>
              <p>Letakkan Pulse Sensor Amped di ujung jari Anda. Sensor ini mendeteksi perubahan volume darah untuk menghitung detak jantung Anda.</p>
            </div>
            <div className="step-connector">
              <svg width="40" height="2">
                <line x1="0" y1="1" x2="40" y2="1" stroke="rgba(66,165,245,.3)" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
            </div>
            <div className="step-card" id="step-2">
              <div className="step-number">02</div>
              <div className="step-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <h3>ESP32 Mengirim Data</h3>
              <p>Mikrokontroler ESP32 membaca data sensor dan mengirimkan pembacaan BPM ke backend melalui WiFi setiap detik.</p>
            </div>
            <div className="step-connector">
              <svg width="40" height="2">
                <line x1="0" y1="1" x2="40" y2="1" stroke="rgba(66,165,245,.3)" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
            </div>
            <div className="step-card" id="step-3">
              <div className="step-number">03</div>
              <div className="step-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h3>Monitor Langsung</h3>
              <p>Buka dasbor HiCare di browser apa pun. Detak jantung, tren, dan status kesehatan Anda diperbarui secara real-time.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section tech-stack" id="tech-stack">
        <div className="container">
          <div className="section-label">Didukung Oleh</div>
          <h2 className="section-heading">
            Dibuat Dengan <br />
            <span className="gradient-text">Teknologi Modern</span>
          </h2>
          <p className="section-subheading">Arsitektur ringan, serverless, dan andal untuk monitoring real-time</p>

          <div className="stack-grid">
            <div className="stack-card">
              <div className="stack-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3>Pulse Sensor Amped</h3>
              <p>Dengan metode PPG memberikan data BPM secara real time.</p>
            </div>
            <div className="stack-card">
              <div className="stack-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2A10 10 0 1 0 22 12 10 10 0 0 0 12 2zM12 18V12l-5-2V7" />
                </svg>
              </div>
              <h3>ESP32</h3>
              <p>Seri mikrokontroler 32-bit low-cost </p>
            </div>
            <div className="stack-card">
              <div className="stack-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3>Next.js</h3>
              <p>Framework React open-source, SEO-friendly, dan siap produksi.</p>
            </div>
            <div className="stack-card">
              <div className="stack-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3v18h18M18 9l-5-5-5 5-5-5" />
                </svg>
              </div>
              <h3>MongoDB</h3>
              <p>Database NoSQL berbasis dokumen binary JSON.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section stats-section" id="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card" id="stat-bpm">
              <div className="stat-value" data-target="1000">0</div>
              <div className="stat-suffix">+</div>
              <div className="stat-label">Pembacaan BPM/Hari</div>
            </div>
            <div className="stat-card" id="stat-accuracy">
              <div className="stat-value" data-target="99">0</div>
              <div className="stat-suffix">%</div>
              <div className="stat-label">Tingkat Akurasi</div>
            </div>
            <div className="stat-card" id="stat-latency">
              <div className="stat-value" data-target="1">0</div>
              <div className="stat-suffix">s</div>
              <div className="stat-label">Latensi Update</div>
            </div>
            <div className="stat-card" id="stat-uptime">
              <div className="stat-value" data-target="24">0</div>
              <div className="stat-suffix">/7</div>
              <div className="stat-label">Waktu Aktif Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section product-section" id="product">
        <div className="container">
          <div className="section-label">Produk</div>
          <h2 className="section-heading">
            Dashboard Dirancang untuk<br />
            <span className="gradient-text">Profesional Kesehatan</span>
          </h2>

          <div className="product-preview">
            <div className="browser-frame">
              <div className="browser-dots">
                <span></span><span></span><span></span>
              </div>
              <div className="browser-url">localhost:3000/dashboard</div>
            </div>
            <img src="/product-hero.png" alt="HiCare Dashboard Preview" className="product-screenshot" id="product-img" />
          </div>
        </div>
      </section>

      <section className="section team-section" id="team">
        <div className="container">
          <div className="section-label">Tim Kami</div>
          <h2 className="section-heading">
            Kenali<br />
            <span className="gradient-text">Pengembang</span>
          </h2>

          <div className="team-grid">
            {/* Team Member 1 */}
            <div className="team-card">
              <div className="team-photo-wrap">
                <img src="/paris.png" alt="Developer 1" className="team-photo" />
                <div className="team-socials">
                  <a href="#" aria-label="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                  <a href="#" aria-label="LinkedIn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                </div>
              </div>
              <h3 className="team-name">Faris Hawari</h3>
              <p className="team-role">Web & IoT Developer</p>
            </div>

            {/* Team Member 2 */}
            <div className="team-card">
              <div className="team-photo-wrap">
                <img src="/ajri.png" alt="Developer 2" className="team-photo" />
                <div className="team-socials">
                  <a href="#" aria-label="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                  <a href="#" aria-label="LinkedIn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                </div>
              </div>
              <h3 className="team-name">Azri Azwa Putra</h3>
              <p className="team-role">Hardware Engineer / IoT</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section cta-section" id="cta">
        <div className="container cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Siap Memantau Jantungmu?</h2>
            <p className="cta-subtitle">Buka dashboard langsung dan mulai pantau detak jantung secara real-time. Tanpa perlu instalasi.</p>
            <div className="hero-cta">
              <Link href="/dashboard" className="btn btn-primary btn-lg" id="cta-btn-dashboard">
                <span>Buka Dashboard</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="cta-decoration">
            <div className="cta-ring"></div>
            <div className="cta-ring cta-ring-2"></div>
          </div>
        </div>
      </section>

      <footer className="footer" id="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <Link href="#" className="nav-logo">
              <img src="/favicon.svg" alt="HiCare" />
              <span>HiCare</span>
            </Link>
            <p>Monitoring detak jantung IoT cerdas<br />didukung oleh Pulse Sensor Amped.</p>
          </div>
          <div className="footer-links">
            <h4>Navigasi</h4>
            <a href="#features" onClick={(e) => handleSmoothScroll(e, "#features")}>Fitur</a>
            <a href="#how-it-works" onClick={(e) => handleSmoothScroll(e, "#how-it-works")}>Cara Kerja</a>
            <a href="#product" onClick={(e) => handleSmoothScroll(e, "#product")}>Produk</a>
            <Link href="/dashboard">Dashboard</Link>
          </div>
          <div className="footer-links">
            <h4>Teknologi</h4>
            <a href="#">Pulse Sensor Amped</a>
            <a href="#">ESP32</a>
            <a href="#">MongoDB</a>
            <a href="#">Next.js</a>
          </div>
          <div className="footer-links">
            <h4>Hubungi Kami</h4>
            <p style={{ color: "var(--text-muted)", fontSize: ".85rem", marginBottom: "1rem", lineHeight: 1.6 }}>
              Punya pertanyaan tentang HiCare? Kami senang mendengar dari Anda!
            </p>
            <a href="mailto:hello@hicare.example.com" style={{ display: "inline-flex", alignItems: "center", gap: ".5rem" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Kirim Email
            </a>
            <div className="social-links" style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <a href="#" aria-label="Instagram" style={{ color: "var(--text-secondary)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" aria-label="TikTok" style={{ color: "var(--text-secondary)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a8 8 0 0 1-8-8H7v11a4 4 0 0 0 2 0z" />
                </svg>
              </a>
              <a href="#" aria-label="GitHub" style={{ color: "var(--text-secondary)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom container">
          <p>&copy; 2026 HiCare. All rights reserved. Built for PKK.</p>
        </div>
      </footer>
    </div>
  );
}
