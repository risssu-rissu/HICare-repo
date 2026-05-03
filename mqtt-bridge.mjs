// ============================================================
// MQTT Bridge — Connects HiveMQ Cloud → HiCare Next.js API
// ============================================================
// Run this script alongside your Next.js dev server:
//   node mqtt-bridge.mjs
//   (or: npm run bridge)
// ============================================================

import mqtt from "mqtt";

// ─── MQTT Configuration (must match your ESP32 code) ───
const MQTT_BROKER = "mqtts://8859982a2a634180bd5b422958b7bf51.s1.eu.hivemq.cloud:8883";
const MQTT_USER = "hicare-paris-ajri";
const MQTT_PASS = "HiCare-pajri95";
const MQTT_TOPIC = "sensor/bpm";

// ─── Next.js API endpoint ───
const API_URL = "http://localhost:3000/api/ingest";

// ─── Connect to HiveMQ Cloud ───
console.log("🔌 Connecting to HiveMQ Cloud...");

const client = mqtt.connect(MQTT_BROKER, {
  username: MQTT_USER,
  password: MQTT_PASS,
  rejectUnauthorized: false,
});

client.on("connect", () => {
  console.log("✅ Connected to HiveMQ Cloud!");
  console.log(`📡 Subscribing to topic: ${MQTT_TOPIC}`);

  client.subscribe(MQTT_TOPIC, (err) => {
    if (err) {
      console.error("❌ Subscribe error:", err);
    } else {
      console.log(`✅ Subscribed to "${MQTT_TOPIC}"`);
      console.log("⏳ Waiting for ESP32 BPM data...\n");
    }
  });
});

client.on("message", async (topic, message) => {
  const raw = message.toString().trim();
  const avgBpm = parseInt(raw, 10);

  console.log(`📩 Received on "${topic}": ${raw}`);

  if (isNaN(avgBpm) || avgBpm < 30 || avgBpm > 220) {
    console.log(`⚠️  Invalid BPM value: ${raw}, skipping.`);
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        avgBpm: avgBpm,
        device_id: "esp32-pulse-1",
      }),
    });

    const data = await res.json();

    if (data.success) {
      console.log(`✅ Saved to MongoDB: ${avgBpm} BPM`);
      console.log(`   ID: ${data.data._id}`);
      console.log(`   Time: ${data.data.timestamp}\n`);
    } else {
      console.error("❌ API Error:", data.error);
    }
  } catch (err) {
    console.error("❌ Failed to send to API:", err.message);
    console.log("   Make sure 'npm run dev' is running!\n");
  }
});

client.on("error", (err) => {
  console.error("❌ MQTT Error:", err.message);
});

client.on("close", () => {
  console.log("🔌 MQTT connection closed. Reconnecting...");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down bridge...");
  client.end();
  process.exit();
});
