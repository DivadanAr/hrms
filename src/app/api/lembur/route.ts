import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nullable } from "@/lib/utils/nullable";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const tanggalMulai = searchParams.get("tanggal_mulai");

    const tanggalAkhir = searchParams.get("tanggal_akhir");

    let query = `
      SELECT
        lk.id_lembur,
        lk.id_karyawan,
        k.nama AS nama_karyawan,
        lk.tanggal,
        lk.total_jam_lembur,
        lk.keterangan,
        lk.status,
        lk.aproved_by,
        u.email AS approved_by_email
      FROM lembur_karyawan lk
      JOIN karyawan k
        ON lk.id_karyawan = k.id_karyawan
      LEFT JOIN user u
        ON lk.aproved_by = u.id_user
      WHERE 1=1
    `;

    const values: any[] = [];

    // filter tanggal
    if (tanggalMulai && tanggalAkhir) {
      query += `
        AND DATE(lk.tanggal)
        BETWEEN ? AND ?
      `;

      values.push(tanggalMulai, tanggalAkhir);
    }

    // pending di atas
    query += `
      ORDER BY
        CASE
          WHEN lk.status = 'pending' THEN 0
          ELSE 1
        END,
        lk.id_lembur DESC
    `;

    const data = await prisma.$queryRawUnsafe<any[]>(query, ...values);

    return NextResponse.json({
      success: true,
      data,
      total_data: data.length,
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal mengambil data lembur",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // validasi
    if (!body.id_karyawan || !body.tanggal || !body.total_jam_lembur) {
      return NextResponse.json(
        {
          success: false,
          message: "Data wajib belum lengkap",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO lembur_karyawan (
        id_karyawan,
        tanggal,
        total_jam_lembur,
        keterangan,
        status,
        aproved_by
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      Number(body.id_karyawan),
      body.tanggal,
      Number(body.total_jam_lembur),
      nullable<string>(body.keterangan),
      "pending",
      null,
    );

    return NextResponse.json({
      success: true,
      message: "Pengajuan lembur berhasil",
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal mengajukan lembur",
      },
      {
        status: 500,
      },
    );
  }
}
