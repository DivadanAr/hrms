import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nullable } from "@/lib/utils/nullable";

export async function GET() {
  try {
    const data = await prisma.$queryRaw<any[]>`
      SELECT
        d.id_departemen,
        d.nama_departemen,
        d.keterangan,
        COUNT(k.id_karyawan) as jumlah_karyawan
      FROM departemen d
      LEFT JOIN karyawan k
        ON k.id_departemen = d.id_departemen
      GROUP BY d.id_departemen
      ORDER BY d.id_departemen DESC
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

    if (!body.nama_departemen) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama departemen wajib diisi",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO departemen (
        nama_departemen,
        keterangan
      )
      VALUES (?, ?)
      `,
      body.nama_departemen,
      nullable<string>(body.keterangan),
    );

    return NextResponse.json({
      success: true,
      message: "Departemen berhasil ditambahkan",
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal menambah departemen",
      },
      {
        status: 500,
      },
    );
  }
}
