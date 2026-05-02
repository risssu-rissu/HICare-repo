# HiCare — Smart IoT Heart Rate Monitor 

HiCare is a modern web application paired with an IoT device to provide real-time, accurate heart rate monitoring. This project aims to bring clinical-grade insights to a fast, responsive, and beautifully designed browser dashboard.

## 🚀 Tech Stack

The platform has been migrated from a legacy HTML/Firebase architecture to a modern serverless stack:

- **Frontend Framework**: [Next.js (App Router)](https://nextjs.org) for robust routing, server-side rendering, and seamless API integration.
- **Backend & Database**: [Supabase](https://supabase.com/) providing secure authentication and an open-source PostgreSQL database.
- **Data Visualization**: [Chart.js](https://www.chartjs.org/) for rendering the live interactive BPM timeline.
- **IoT Hardware**: Pulse Sensor Amped coupled with an ESP32 microcontroller, transmitting BPM data over WiFi.
- **Styling**: Modern CSS with glassmorphism, fluid animations, and a rich "Medical Blue + White" theme tailored for health professionals.

## 🔒 Authentication (User & Admin)

The dashboard is secured. Users must create an account or sign in to monitor their heart vitals.
- **Mock / Development Mode**: By default, the app uses a simulated local auth context if Supabase is not fully configured yet. 
- **Admin Access**: Logging in with the email `admin@hicare.com` grants Admin privileges, unlocking the System Administration panel on the dashboard (showing active devices, total users, and alerts).

## 🛠️ Getting Started

First, install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ⚙️ Environment Variables

To connect to your real Supabase instance, create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

If these are not provided, the app will gracefully fall back to a mock data and simulated authentication mode for demonstration purposes.

## 📡 Hardware Setup

The accompanying ESP32 code is located in `esp32-hicare-nextjs.ino`. Flash it onto your ESP32 microcontroller and update the WiFi credentials and API endpoints inside the sketch to point to your Next.js API routes or Supabase REST endpoints.

---
*Built for the PKK Project*
