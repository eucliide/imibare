import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "edge";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
      },
      { status: 503 }
    );
  }
}
