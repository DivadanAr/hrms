import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const body = await req.json();

    await prisma.$executeRawUnsafe(
      `
      UPDATE penggajian
      SET
        id_karyawan = ?,
        periode = ?,
        total_pendapatan = ?,
        total_potongan = ?,
        gaji_bersih = ?
      WHERE id_penggajian = ?
      `,
      body.id_karyawan,
      body.periode,
      body.total_pendapatan,
      body.total_potongan,
      body.gaji_bersih,
      Number(id),
    );

    return NextResponse.json({
      success: true,
      message: "Penggajian berhasil diupdate",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    await prisma.$executeRawUnsafe(
      `
      DELETE FROM penggajian
      WHERE id_penggajian = ?
      `,
      Number(id),
    );

    return NextResponse.json({
      success: true,
      message: "Penggajian berhasil dihapus",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
