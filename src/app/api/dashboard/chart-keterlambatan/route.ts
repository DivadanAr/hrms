import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/mysql";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const tahun = Number(searchParams.get("tahun")) || new Date().getFullYear();

    const [rows] = await pool.execute(
      `CALL sp_chart_keterlambatan_tahunan(?)`,
      [tahun],
    );
    const raw = ((rows as any[])[0] || [])[0];

    return NextResponse.json({
      success: true,
      data: {
        tepat_waktu: Number(raw?.tepat_waktu || 0),
        terlambat: Number(raw?.terlambat || 0),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
