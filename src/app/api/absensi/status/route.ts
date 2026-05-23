import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/absensi/status?tanggal=YYYY-MM-DD&id_karyawan=123
 * Cek status absensi karyawan hari ini
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tanggal = searchParams.get("tanggal");
    const id_karyawan = searchParams.get("id_karyawan");

    if (!tanggal || !id_karyawan) {
      return NextResponse.json(
        { success: false, message: "tanggal dan id_karyawan wajib diisi" },
        { status: 400 },
      );
    }

    const rows: any[] = await prisma.$queryRawUnsafe(
      `
      SELECT
        id_absensi,
        TIME_FORMAT(jam_masuk, '%H:%i') AS jam_masuk,

        TIME_FORMAT(jam_pulang, '%H:%i') AS jam_pulang,

        lokasi
      FROM absensi
      WHERE
        tanggal = ?
        AND id_karyawan = ?
      LIMIT 1
      `,
      tanggal,
      Number(id_karyawan),
    );

    return NextResponse.json({
      success: true,
      data: rows[0] ?? null,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal mengambil status absensi",
      },
      { status: 500 },
    );
  }
}
