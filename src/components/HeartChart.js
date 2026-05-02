"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function HeartChart({ timestamps, bpmHistory }) {
  const data = {
    labels: timestamps,
    datasets: [
      {
        label: "BPM",
        data: bpmHistory,
        borderColor: "#1565C0",
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, 0, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(21,101,192,.25)");
          gradient.addColorStop(1, "rgba(21,101,192,.0)");
          return gradient;
        },
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "#1565C0",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    scales: {
      x: {
        display: true,
        grid: { color: "rgba(0,0,0,.05)" },
        ticks: {
          color: "#6B7C93",
          font: { family: "'Plus Jakarta Sans','Inter',sans-serif", size: 11 },
          maxTicksLimit: 8,
        },
      },
      y: {
        min: 40,
        max: 140,
        grid: { color: "rgba(0,0,0,.05)" },
        ticks: {
          color: "#6B7C93",
          font: { family: "'Plus Jakarta Sans','Inter',sans-serif", size: 11 },
          stepSize: 20,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#1A2B42",
        bodyColor: "#3A4F6A",
        titleFont: { family: "'Plus Jakarta Sans'" },
        bodyFont: { family: "'Plus Jakarta Sans'" },
        borderColor: "rgba(21,101,192,.15)",
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} BPM`,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}
