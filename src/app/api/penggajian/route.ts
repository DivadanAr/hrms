import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const bulan = Number(searchParams.get("bulan"));
    const formattedBulan = bulan.toString().padStart(2, "0");

    const tahun = Number(searchParams.get("tahun"));

    let data;

    if (!bulan || !tahun) {
      data = await prisma.$queryRawUnsafe(`
      SELECT
          p.id_penggajian,
          k.nama AS nama_karyawan,
          k.nip,
          j.nama_jabatan,
          p.periode,
          p.total_pendapatan,
          p.total_potongan,
          p.gaji_bersih
      FROM
          penggajian p
      JOIN karyawan k ON
          p.id_karyawan = k.id_karyawan
      JOIN jabatan j ON
          j.id_jabatan = k.id_jabatan;
    `);
    } else
      data = await prisma.$queryRawUnsafe(`
      SELECT
          p.id_penggajian,
          k.nama AS nama_karyawan,
          k.nip,
          j.nama_jabatan,
          p.periode,
          p.total_pendapatan,
          p.total_potongan,
          p.gaji_bersih
      FROM
          penggajian p
      JOIN karyawan k ON
        p.id_karyawan = k.id_karyawan
      JOIN jabatan j ON
        j.id_jabatan = k.id_jabatan
      WHERE p.periode = '${tahun}-${formattedBulan}'
    `);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // required
    const id_karyawan = body.id_karyawan;
    const periode = body.periode;

    // validasi sederhana
    if (!id_karyawan || !periode) {
      return NextResponse.json(
        {
          success: false,
          message: "Data wajib belum lengkap",
        },
        { status: 400 },
      );
    }

    await prisma.$executeRawUnsafe(
      `
      CALL sp_generate_penggajian(?, ?)
      `,
      id_karyawan,
      periode,
    );

    return NextResponse.json({
      success: true,
      message: "Berhasil membuat penggajian",
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Terjadi kesalahan",
      },
      { status: 500 },
    );
  }
}
