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
        ik.id_izin,
        ik.id_karyawan,
        k.nama AS nama_karyawan,
        ik.jenis_izin,
        ik.alasan,
        ik.tanggal_pengajuan,
        ik.tanggal_mulai,
        ik.tanggal_berakhir,
        ik.status,
        ik.aproved_by,
        u.email AS approved_by_email
      FROM izin_karyawan ik
      JOIN karyawan k
        ON ik.id_karyawan = k.id_karyawan
      LEFT JOIN user u
        ON ik.aproved_by = u.id_user
      WHERE 1=1
    `;

    const values: any[] = [];

    // filter tanggal
    if (tanggalMulai && tanggalAkhir) {
      query += `
        AND DATE(ik.tanggal_pengajuan)
        BETWEEN ? AND ?
      `;

      values.push(tanggalMulai, tanggalAkhir);
    }

    // order pending dulu
    query += `
      ORDER BY
        CASE
          WHEN ik.status = 'pending' THEN 0
          ELSE 1
        END,
        ik.id_izin DESC
    `;

    const data = await prisma.$queryRawUnsafe<any[]>(query, ...values);

    return NextResponse.json({
      success: true,
      data,
      total_data: data.length,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data izin",
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

    if (
      !body.id_karyawan ||
      !body.jenis_izin ||
      !body.tanggal_mulai ||
      !body.tanggal_berakhir
    ) {
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
      INSERT INTO izin_karyawan (
        id_karyawan,
        jenis_izin,
        alasan,
        tanggal_mulai,
        tanggal_berakhir,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      Number(body.id_karyawan),
      body.jenis_izin,
      nullable<string>(body.alasan),
      body.tanggal_mulai,
      body.tanggal_berakhir,
      "pending",
    );

    return NextResponse.json({
      success: true,
      message: "Pengajuan izin berhasil",
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal mengajukan izin",
      },
      {
        status: 500,
      },
    );
  }
}
