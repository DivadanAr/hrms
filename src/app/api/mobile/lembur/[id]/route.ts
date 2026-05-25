import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCookie } from "@/context/cookie";

async function getIdKaryawan(): Promise<number | null> {
  try {
    const raw = await getCookie("__vxu_meta-Us");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Number(parsed.id_karyawan) || null;
  } catch {
    return null;
  }
}

async function getLembur(id_lembur: number, id_karyawan: number) {
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT id_lembur, status FROM lembur_karyawan WHERE id_lembur = ? AND id_karyawan = ? LIMIT 1`,
    id_lembur,
    id_karyawan,
  );
  return rows[0] ?? null;
}

// ─── PUT /api/mobile/lembur/[id] ─────────────────────────────────────────────

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const id_karyawan = await getIdKaryawan();
    if (!id_karyawan)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );

    const id_lembur = Number(id);
    const lembur = await getLembur(id_lembur, id_karyawan);

    if (!lembur)
      return NextResponse.json(
        { success: false, message: "Data tidak ditemukan" },
        { status: 404 },
      );
    if (lembur.status === "diterima")
      return NextResponse.json(
        {
          success: false,
          message: "Lembur yang sudah diterima tidak dapat diubah",
        },
        { status: 403 },
      );

    const body = await req.json();
    const { tanggal, total_jam_lembur, keterangan } = body;

    if (!tanggal || !total_jam_lembur) {
      return NextResponse.json(
        { success: false, message: "tanggal dan total_jam_lembur wajib diisi" },
        { status: 400 },
      );
    }

    const jam = Number(total_jam_lembur);
    if (isNaN(jam) || jam < 1 || jam > 24) {
      return NextResponse.json(
        { success: false, message: "total_jam_lembur harus antara 1–24" },
        { status: 400 },
      );
    }

    await prisma.$executeRawUnsafe(
      `UPDATE lembur_karyawan SET tanggal = ?, total_jam_lembur = ?, keterangan = ? WHERE id_lembur = ? AND id_karyawan = ?`,
      tanggal,
      jam,
      keterangan || null,
      id_lembur,
      id_karyawan,
    );

    return NextResponse.json({
      success: true,
      message: "Lembur berhasil diperbarui",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui lembur" },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/mobile/lembur/[id] ──────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const id_karyawan = await getIdKaryawan();
    if (!id_karyawan)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );

    const id_lembur = Number(id);
    const lembur = await getLembur(id_lembur, id_karyawan);

    if (!lembur)
      return NextResponse.json(
        { success: false, message: "Data tidak ditemukan" },
        { status: 404 },
      );
    if (lembur.status === "diterima")
      return NextResponse.json(
        {
          success: false,
          message: "Lembur yang sudah diterima tidak dapat dihapus",
        },
        { status: 403 },
      );

    await prisma.$executeRawUnsafe(
      `DELETE FROM lembur_karyawan WHERE id_lembur = ? AND id_karyawan = ?`,
      id_lembur,
      id_karyawan,
    );

    return NextResponse.json({
      success: true,
      message: "Lembur berhasil dihapus",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus lembur" },
      { status: 500 },
    );
  }
}
