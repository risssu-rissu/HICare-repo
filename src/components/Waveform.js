"use client";

import { useEffect, useRef } from "react";

export default function Waveform({ isConnected }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener("resize", resize);
    resize();

    // Simulating ECG/PPG wave function
    const ecgY = (t) => {
      t = t % 1;
      if (t < 0.05) return 0;
      if (t < 0.08) return Math.sin(((t - 0.05) / 0.03) * Math.PI) * 0.15;
      if (t < 0.15) return 0;
      if (t < 0.17) return -0.08;
      if (t < 0.22) return Math.sin(((t - 0.17) / 0.05) * Math.PI) * 0.85;
      if (t < 0.27) return -0.15;
      if (t < 0.40) return Math.sin(((t - 0.27) / 0.13) * Math.PI) * 0.12;
      return 0;
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const mid = h / 2;
      ctx.clearRect(0, 0, w, h);

      if (!isConnected) {
        // Draw flatline if disconnected
        ctx.strokeStyle = "rgba(107,124,147,.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, mid);
        ctx.lineTo(w, mid);
        ctx.stroke();
        animationId = requestAnimationFrame(draw);
        return;
      }

      const now = performance.now() / 1000;
      
      const grd = ctx.createLinearGradient(0, 0, w, 0);
      grd.addColorStop(0, "rgba(239,83,80,.15)");
      grd.addColorStop(0.5, "#EF5350");
      grd.addColorStop(1, "#FF5252");

      ctx.strokeStyle = grd;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.beginPath();

      for (let x = 0; x < w; x++) {
        // speed scaling based on "heartbeat"
        const t = (now * 1.2 + (x / w) * 2) % 2;
        const y = mid - ecgY(t / 2) * (h * 0.7);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Glow 
      ctx.strokeStyle = "rgba(239,83,80,.15)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const t = (now * 1.2 + (x / w) * 2) % 2;
        const y = mid - ecgY(t / 2) * (h * 0.7);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [isConnected]);

  return <canvas ref={canvasRef} className="waveform-canvas" id="waveform-canvas"></canvas>;
}
