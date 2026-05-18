import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/mysql";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const searchParams = req.nextUrl.searchParams;

    const dari_tanggal = searchParams.get("dari_tanggal");

    const sampai_tanggal = searchParams.get("sampai_tanggal");

    if (!dari_tanggal || !sampai_tanggal) {
      return NextResponse.json(
        {
          success: false,
          message: "dari_tanggal dan sampai_tanggal wajib diisi",
        },
        {
          status: 400,
        },
      );
    }

    const [rows] = await pool.execute(
      `CALL sp_detail_absensi_karyawan(?, ?, ?)`,
      [Number(id), dari_tanggal, sampai_tanggal],
    );

    const rawData = (rows as any[])[0];

    const data = rawData.map((item: any) => ({
      id_absensi: Number(item.id_absensi),

      tanggal: item.tanggal,

      hari: item.hari,

      id_karyawan: Number(item.id_karyawan),

      nama_karyawan: item.nama_karyawan,

      jam_masuk: item.jam_masuk,

      jam_pulang: item.jam_pulang,

      lokasi: item.lokasi,

      status: item.status,

      terlambat_menit: Number(item.terlambat_menit),
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
        message: error.message || "Gagal mengambil detail absensi",
      },
      {
        status: 500,
      },
    );
  }
}
