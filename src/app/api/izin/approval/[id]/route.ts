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

    /*
      status:
      - pending
      - diterima
      - ditolak
    */

    if (!body.status || !body.aproved_by) {
      return NextResponse.json(
        {
          success: false,
          message: "status dan aproved_by wajib diisi",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.$executeRawUnsafe(
      `
      UPDATE izin_karyawan
      SET
        status = ?,
        aproved_by = ?
      WHERE id_izin = ?
      `,
      body.status,
      Number(body.aproved_by),
      Number(id),
    );

    return NextResponse.json({
      success: true,
      message: `Izin berhasil ${body.status}`,
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal approval izin",
      },
      {
        status: 500,
      },
    );
  }
}
