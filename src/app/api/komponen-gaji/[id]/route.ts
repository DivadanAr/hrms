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
      UPDATE komponen_gaji
      SET
        nama_komponen_gaji = ?,
        keterangan = ?,
        tipe = ?
      WHERE id_komponen_gaji = ?
      `,
      body.nama_komponen_gaji,
      nullable<string>(body.keterangan),
      body.tipe,
      Number(id),
    );

    return NextResponse.json({
      success: true,
      message: "Komponen gaji berhasil diupdate",
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
      DELETE FROM komponen_gaji
      WHERE id_komponen_gaji = ?
      `,
      Number(id),
    );

    return NextResponse.json({
      success: true,
      message: "Komponen gaji berhasil dihapus",
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
