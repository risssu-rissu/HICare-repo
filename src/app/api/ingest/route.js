import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BpmReading from "@/models/BpmReading";

export async function POST(request) {
  try {
    const body = await request.json();
    const { device_id, avgBpm } = body;

    if (avgBpm === undefined) {
      return NextResponse.json({ error: "Missing avgBpm field" }, { status: 400 });
    }

    await dbConnect();

    // Insert into mongodb
    const newReading = await BpmReading.create({
      avgBpm: avgBpm,
      device_id: device_id || 'esp32-pulse-1',
    });

    return NextResponse.json({ success: true, data: newReading });
  } catch (err) {
    console.error("Ingest Error:", err);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
