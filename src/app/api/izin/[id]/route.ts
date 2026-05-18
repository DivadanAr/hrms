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
      UPDATE izin_karyawan
      SET
        jenis_izin = ?,
        alasan = ?,
        tanggal_mulai = ?,
        tanggal_berakhir = ?
      WHERE id_izin = ?
      `,
      body.jenis_izin,
      nullable<string>(body.alasan),
      body.tanggal_mulai,
      body.tanggal_berakhir,
      Number(id),
    );

    return NextResponse.json({
      success: true,
      message: "Izin berhasil diupdate",
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal update izin",
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
      DELETE FROM izin_karyawan
      WHERE id_izin = ?
      `,
      Number(id),
    );

    return NextResponse.json({
      success: true,
      message: "Izin berhasil dihapus",
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal menghapus izin",
      },
      {
        status: 500,
      },
    );
  }
}
