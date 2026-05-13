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
    return NextResponse.json({ error: "Failed to fetch data", details: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await dbConnect();

    const result = await BpmReading.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} data sesi berhasil dihapus.`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Delete History Error:", err);
    return NextResponse.json({ error: "Failed to delete data", details: err.message }, { status: 500 });
  }
}
