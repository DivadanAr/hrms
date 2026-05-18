import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nullable } from "@/lib/utils/nullable";

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
      UPDATE lembur_karyawan
      SET
        id_karyawan = ?,
        tanggal = ?,
        total_jam_lembur = ?,
        keterangan = ?,
        status = ?,
        aproved_by = ?
      WHERE id_lembur = ?
      `,
      body.id_karyawan,
      body.tanggal,
      body.total_jam_lembur,
      nullable<string>(body.keterangan),
      body.status,
      nullable<number>(body.aproved_by),
      Number(id),
    );

    return NextResponse.json({
      success: true,
      message: "Lembur berhasil diupdate",
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
      DELETE FROM lembur_karyawan
      WHERE id_lembur = ?
      `,
      Number(id),
    );

    return NextResponse.json({
      success: true,
      message: "Lembur berhasil dihapus",
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
