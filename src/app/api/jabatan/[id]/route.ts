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

    if (!body.nama_jabatan) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama jabatan wajib diisi",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.$executeRawUnsafe(
      `
      UPDATE jabatan
      SET
        nama_jabatan = ?,
        keterangan = ?
      WHERE id_jabatan = ?
      `,
      body.nama_jabatan,
      nullable<string>(body.keterangan),
      Number(id),
    );

    return NextResponse.json({
      success: true,
      message: "Jabatan berhasil diupdate",
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal update jabatan",
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

    // cek apakah jabatan masih dipakai karyawan
    const karyawan = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) AS total
      FROM karyawan
      WHERE id_jabatan = ${Number(id)}
    `;

    const totalKaryawan = Number(karyawan[0].total);

    // validasi
    if (totalKaryawan > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Jabatan tidak dapat dihapus karena masih memiliki ${totalKaryawan} karyawan`,
        },
        {
          status: 400,
        },
      );
    }

    // hapus jabatan
    await prisma.$executeRawUnsafe(
      `
      DELETE FROM jabatan
      WHERE id_jabatan = ?
      `,
      Number(id),
    );

    return NextResponse.json({
      success: true,
      message: "Jabatan berhasil dihapus",
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal menghapus jabatan",
      },
      {
        status: 500,
      },
    );
  }
}
