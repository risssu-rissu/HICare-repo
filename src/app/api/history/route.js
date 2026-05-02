import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BpmReading from "@/models/BpmReading";

export async function GET(request) {
  try {
    // Get query params for pagination/limits
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    await dbConnect();

    // Fetch latest readings
    const readings = await BpmReading.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: readings });
  } catch (err) {
    console.error("History Error:", err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
