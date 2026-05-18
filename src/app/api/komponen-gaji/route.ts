import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nullable } from "@/lib/utils/nullable";

export async function GET() {
  try {
    const data = await prisma.$queryRawUnsafe(`
      SELECT 
        id_komponen_gaji,
        nama_komponen_gaji,
        keterangan,
        tipe
      FROM komponen_gaji
      ORDER BY id_komponen_gaji DESC
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
      INSERT INTO komponen_gaji (
        nama_komponen_gaji,
        keterangan,
        tipe
      )
      VALUES (?, ?, ?)
      `,
      body.nama_komponen_gaji,
      nullable<string>(body.keterangan),
      body.tipe,
    );

    return NextResponse.json({
      success: true,
      message: "Komponen gaji berhasil ditambahkan",
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
