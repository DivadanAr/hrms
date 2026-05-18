import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.$queryRawUnsafe(`
      SELECT *
      FROM penggajian
      ORDER BY id_penggajian DESC
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

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO penggajian (
        id_karyawan,
        periode,
        total_pendapatan,
        total_potongan,
        gaji_bersih
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      body.id_karyawan,
      body.periode,
      body.total_pendapatan,
      body.total_potongan,
      body.gaji_bersih,
    );

    return NextResponse.json({
      success: true,
      message: "Penggajian berhasil ditambahkan",
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
