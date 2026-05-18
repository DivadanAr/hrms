import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.nominal === undefined || Number(body.nominal) <= 0) {
      return NextResponse.json(
        { success: false, message: "Nominal harus lebih dari 0." },
        { status: 400 },
      );
    }

    // Cek data exist
    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT id_pengalokasian_gaji FROM pengalokasian_gaji WHERE id_pengalokasian_gaji = ? LIMIT 1`,
      Number(id),
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: "Data tidak ditemukan." },
        { status: 404 },
      );
    }

    // Hanya update nominal — komponen & karyawan tidak boleh diubah
    await prisma.$executeRawUnsafe(
      `UPDATE pengalokasian_gaji SET nominal = ? WHERE id_pengalokasian_gaji = ?`,
      Number(body.nominal),
      Number(id),
    );

    return NextResponse.json({
      success: true,
      message: "Nominal berhasil diperbarui.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Cek data exist
    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT id_pengalokasian_gaji FROM pengalokasian_gaji WHERE id_pengalokasian_gaji = ? LIMIT 1`,
      Number(id),
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: "Data tidak ditemukan." },
        { status: 404 },
      );
    }

    await prisma.$executeRawUnsafe(
      `DELETE FROM pengalokasian_gaji WHERE id_pengalokasian_gaji = ?`,
      Number(id),
    );

    return NextResponse.json({
      success: true,
      message: "Pengalokasian gaji berhasil dihapus.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
