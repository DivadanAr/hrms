import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.$queryRawUnsafe(`
      SELECT 
        id,
        TIME_FORMAT(normal_jam_masuk, '%H:%i:%s') AS normal_jam_masuk,
        TIME_FORMAT(normal_jam_pulang, '%H:%i:%s') AS normal_jam_pulang
      FROM absensi_setting
      LIMIT 1
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

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    await prisma.$executeRawUnsafe(
      `
      UPDATE absensi_setting
      SET
        normal_jam_masuk = ?,
        normal_jam_pulang = ?
      WHERE id = ?
      `,
      body.normal_jam_masuk,
      body.normal_jam_pulang,
      body.id,
    );

    return NextResponse.json({
      success: true,
      message: "Setting absensi berhasil diupdate",
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
