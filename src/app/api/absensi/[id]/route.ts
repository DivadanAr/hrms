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

    if (!body.tanggal || !body.id_karyawan) {
      return NextResponse.json(
        {
          success: false,
          message: "Tanggal dan id_karyawan wajib diisi",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.$executeRawUnsafe(
      `
      UPDATE absensi
      SET
          jam_masuk = ?,
          jam_pulang = ?,
          tanggal = ?,
          lokasi = ?,
          id_karyawan = ?
      WHERE id_absensi = ?
      `,
      nullable<string>(body.jam_masuk),
      nullable<string>(body.jam_pulang),
      body.tanggal,
      nullable<string>(body.lokasi),
      Number(body.id_karyawan),
      Number(id),
    );

    return NextResponse.json({
      success: true,
      message: "Absensi berhasil diupdate",
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal update absensi",
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
      DELETE FROM absensi
      WHERE id_absensi = ?
      `,
      Number(id),
    );

    return NextResponse.json({
      success: true,
      message: "Absensi berhasil dihapus",
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal menghapus absensi",
      },
      {
        status: 500,
      },
    );
  }
}
