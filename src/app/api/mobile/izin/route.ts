import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCookie } from "@/context/cookie";

// ─── Helper ───────────────────────────────────────────────────────────────────

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

// ─── GET /api/mobile/izin ─────────────────────────────────────────────────────
// Ambil semua izin milik karyawan yang sedang login

export async function GET() {
  try {
    const id_karyawan = await getIdKaryawan();

    if (!id_karyawan) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const rows: any[] = await prisma.$queryRawUnsafe(
      `
      SELECT
        i.id_izin,
        i.jenis_izin,
        i.alasan,
        i.tanggal_pengajuan,
        i.tanggal_mulai,
        i.tanggal_berakhir,
        i.status,
        k.nama AS approved_by_nama
      FROM izin_karyawan i
      LEFT JOIN karyawan k ON k.id_karyawan = i.aproved_by
      WHERE i.id_karyawan = ?
      ORDER BY i.tanggal_pengajuan DESC
      `,
      id_karyawan,
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil data izin" },
      { status: 500 },
    );
  }
}

// ─── POST /api/mobile/izin ────────────────────────────────────────────────────
// Buat pengajuan izin baru

export async function POST(req: NextRequest) {
  try {
    const id_karyawan = await getIdKaryawan();

    if (!id_karyawan) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
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

    if (!["sakit", "cuti", "izin"].includes(jenis_izin)) {
      return NextResponse.json(
        { success: false, message: "jenis_izin tidak valid" },
        { status: 400 },
      );
    }

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO izin_karyawan (
        id_karyawan,
        jenis_izin,
        alasan,
        tanggal_mulai,
        tanggal_berakhir,
        status
      ) VALUES (?, ?, ?, ?, ?, 'pending')
      `,
      id_karyawan,
      jenis_izin,
      alasan || null,
      tanggal_mulai,
      tanggal_berakhir,
    );

    return NextResponse.json({
      success: true,
      message: "Pengajuan izin berhasil dikirim",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membuat izin" },
      { status: 500 },
    );
  }
}
