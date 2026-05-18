import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/mysql";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const tahun = Number(searchParams.get("tahun")) || new Date().getFullYear();

    const [rows] = await pool.execute(`CALL sp_chart_hadir_tahunan(?)`, [
      tahun,
    ]);
    const rawData = (rows as any[])[0] || [];

    const bulanMap = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    const chartData = bulanMap.map((namaBulan, index) => {
      const found = rawData.find(
        (item: any) => Number(item.bulan) === index + 1,
      );
      return {
        bulan: namaBulan,
        hadir: Number(found?.hadir || 0),
        tidak_hadir: Number(found?.tidak_hadir || 0),
      };
    });

    return NextResponse.json({ success: true, data: chartData });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
