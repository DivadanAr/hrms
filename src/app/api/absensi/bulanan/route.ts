import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/mysql";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const bulan = Number(searchParams.get("bulan"));

    const tahun = Number(searchParams.get("tahun"));

    if (!bulan || !tahun) {
      return NextResponse.json(
        {
          success: false,
          message: "bulan dan tahun wajib diisi",
        },
        { status: 400 },
      );
    }

    const [rows] = await pool.execute(`CALL sp_rekap_absensi_bulanan(?, ?)`, [
      bulan,
      tahun,
    ]);

    const rawData = (rows as any[])[0];

    // FIX TYPE NUMBER
    const data = rawData.map((item: any) => ({
      id_karyawan: Number(item.id_karyawan),

      nama_karyawan: item.nama_karyawan,

      total_hadir: Number(item.total_hadir),

      total_tepat_waktu: Number(item.total_tepat_waktu),

      total_terlambat: Number(item.total_terlambat),

      total_tidak_hadir: Number(item.total_tidak_hadir),

      total_terlambat_menit: Number(item.total_terlambat_menit),
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal mengambil data absensi",
      },
      { status: 500 },
    );
  }
}
