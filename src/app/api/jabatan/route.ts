import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nullable } from "@/lib/utils/nullable";

export async function GET() {
  try {
    const data = await prisma.$queryRaw<any[]>`
      SELECT
        j.id_jabatan,
        j.nama_jabatan,
        j.keterangan,
        COUNT(k.id_karyawan) as jumlah_karyawan
      FROM jabatan j
      LEFT JOIN karyawan k
        ON k.id_jabatan = j.id_jabatan
      GROUP BY j.id_jabatan
      ORDER BY j.id_jabatan DESC
    `;

    const serializedData = data.map((item) => ({
      ...item,
      jumlah_karyawan: Number(item.jumlah_karyawan),
    }));

    return NextResponse.json({
      success: true,
      data: serializedData,
      total_data: serializedData.length,
    });
  } catch (error) {
    console.log("error ", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data",
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

    if (!body.nama_jabatan) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama jabatan wajib diisi",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO jabatan (
        nama_jabatan,
        keterangan
      )
      VALUES (?, ?)
      `,
      body.nama_jabatan,
      nullable<string>(body.keterangan),
    );

    return NextResponse.json({
      success: true,
      message: "Jabatan berhasil ditambahkan",
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal menambah jabatan",
      },
      {
        status: 500,
      },
    );
  }
}
