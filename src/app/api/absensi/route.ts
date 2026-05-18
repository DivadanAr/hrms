import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/mysql";
import { prisma } from "@/lib/prisma";
import { nullable } from "@/lib/utils/nullable";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const dari_tanggal = searchParams.get("dari_tanggal");
    const sampai_tanggal = searchParams.get("sampai_tanggal");

    if (!dari_tanggal || !sampai_tanggal) {
      return NextResponse.json(
        {
          success: false,
          message: "dari_tanggal dan sampai_tanggal wajib diisi",
        },
        { status: 400 },
      );
    }

    const [rows] = await pool.execute(`CALL sp_absensi_karyawan(?, ?)`, [
      dari_tanggal,
      sampai_tanggal,
    ]);

    // rows[0] = result set pertama dari stored procedure
    const data = (rows as any[])[0];

    return NextResponse.json({ success: true, data });
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const tanggal = body.tanggal;
    const id_karyawan = body.id_karyawan;

    if (!tanggal || !id_karyawan) {
      return NextResponse.json(
        {
          success: false,
          message: "tanggal dan id_karyawan wajib diisi",
        },
        {
          status: 400,
        },
      );
    }

    // cek apakah hari ini sudah absen
    const check: any = await prisma.$queryRawUnsafe(
      `
      SELECT
          id_absensi,
          jam_masuk,
          jam_pulang
      FROM absensi
      WHERE
          tanggal = ?
          AND id_karyawan = ?
      LIMIT 1
      `,
      tanggal,
      Number(id_karyawan),
    );

    // jika belum ada -> insert absensi masuk
    if (check.length === 0) {
      await prisma.$executeRawUnsafe(
        `
        INSERT INTO absensi (
            jam_masuk,
            jam_pulang,
            tanggal,
            lokasi,
            id_karyawan
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        nullable<string>(body.jam_masuk),
        null,
        tanggal,
        nullable<string>(body.lokasi),
        Number(id_karyawan),
      );

      return NextResponse.json({
        success: true,
        type: "masuk",
        message: "Absensi masuk berhasil",
      });
    }

    // jika sudah ada -> update jam pulang
    await prisma.$executeRawUnsafe(
      `
      UPDATE absensi
      SET
          jam_pulang = ?
      WHERE id_absensi = ?
      `,
      nullable<string>(body.jam_pulang),
      check[0].id_absensi,
    );

    return NextResponse.json({
      success: true,
      type: "pulang",
      message: "Absensi pulang berhasil",
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal menyimpan absensi",
      },
      {
        status: 500,
      },
    );
  }
}
