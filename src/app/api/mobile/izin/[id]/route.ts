import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCookie } from "@/context/cookie";

// ─── Helper ───────────────────────────────────────────────────────────────────

type Params = {
  params: Promise<{
    id: string;
  }>;
};

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

async function getIzin(id_izin: number, id_karyawan: number): Promise<any> {
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT id_izin, status FROM izin_karyawan
     WHERE id_izin = ? AND id_karyawan = ? LIMIT 1`,
    id_izin,
    id_karyawan,
  );
  return rows[0] ?? null;
}

// ─── PUT /api/mobile/izin/[id] ────────────────────────────────────────────────
// Edit izin — hanya jika status masih 'pending'

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const id_karyawan = await getIdKaryawan();
    if (!id_karyawan) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const id_izin = Number(id);
    const izin = await getIzin(id_izin, id_karyawan);

    if (!izin) {
      return NextResponse.json(
        { success: false, message: "Data izin tidak ditemukan" },
        { status: 404 },
      );
    }

    if (izin.status === "diterima") {
      return NextResponse.json(
        {
          success: false,
          message: "Izin yang sudah diterima tidak dapat diubah",
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { jenis_izin, alasan, tanggal_mulai, tanggal_berakhir } = body;

    if (!jenis_izin || !tanggal_mulai || !tanggal_berakhir) {
      return NextResponse.json(
        {
          success: false,
          message:
            "jenis_izin, tanggal_mulai, dan tanggal_berakhir wajib diisi",
        },
        { status: 400 },
      );
    }

    await prisma.$executeRawUnsafe(
      `
      UPDATE izin_karyawan
      SET
        jenis_izin = ?,
        alasan = ?,
        tanggal_mulai = ?,
        tanggal_berakhir = ?
      WHERE id_izin = ? AND id_karyawan = ?
      `,
      jenis_izin,
      alasan || null,
      tanggal_mulai,
      tanggal_berakhir,
      id_izin,
      id_karyawan,
    );

    return NextResponse.json({
      success: true,
      message: "Izin berhasil diperbarui",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui izin" },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/mobile/izin/[id] ────────────────────────────────────────────
// Hapus izin — hanya jika status masih 'pending' atau 'ditolak'

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const id_karyawan = await getIdKaryawan();
    if (!id_karyawan) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const id_izin = Number(id);
    const izin = await getIzin(id_izin, id_karyawan);

    if (!izin) {
      return NextResponse.json(
        { success: false, message: "Data izin tidak ditemukan" },
        { status: 404 },
      );
    }

    if (izin.status === "diterima") {
      return NextResponse.json(
        {
          success: false,
          message: "Izin yang sudah diterima tidak dapat dihapus",
        },
        { status: 403 },
      );
    }

    await prisma.$executeRawUnsafe(
      `DELETE FROM izin_karyawan WHERE id_izin = ? AND id_karyawan = ?`,
      id_izin,
      id_karyawan,
    );

    return NextResponse.json({
      success: true,
      message: "Izin berhasil dihapus",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus izin" },
      { status: 500 },
    );
  }
}
