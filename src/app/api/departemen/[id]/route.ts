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
      UPDATE departemen
      SET
        nama_departemen = ?,
        keterangan = ?
      WHERE id_departemen = ?
      `,
      body.nama_departemen,
      nullable<string>(body.keterangan),
      Number(id),
    );

    return NextResponse.json({
      success: true,
      message: "Departemen berhasil diupdate",
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal update departemen",
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

    // cek apakah departemen masih dipakai karyawan
    const karyawan = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) AS total
      FROM karyawan
      WHERE id_departemen = ${Number(id)}
    `;

    const totalKaryawan = Number(karyawan[0].total);

    // validasi
    if (totalKaryawan > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Departemen tidak dapat dihapus karena masih memiliki karyawan",
        },
        {
          status: 400,
        },
      );
    }

    // hapus departemen
    await prisma.$executeRawUnsafe(
      `
      DELETE FROM departemen
      WHERE id_departemen = ?
      `,
      Number(id),
    );

    return NextResponse.json({
      success: true,
      message: "Departemen berhasil dihapus",
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal menghapus departemen",
      },
      {
        status: 500,
      },
    );
  }
}
