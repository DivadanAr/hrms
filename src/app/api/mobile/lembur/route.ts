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

// ─── GET /api/mobile/lembur ───────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const id_karyawan = await getIdKaryawan();
    if (!id_karyawan) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const bulan = searchParams.get("bulan"); // format: YYYY-MM (opsional)

    let query = `
      SELECT
        l.id_lembur,
        k.id_karyawan,
        l.tanggal,
        l.total_jam_lembur,
        l.keterangan,
        l.status,
        k.nama AS nama_karyawan,
        u.email AS approved_by
      FROM lembur_karyawan l
      LEFT JOIN karyawan k ON k.id_karyawan = l.id_karyawan
      LEFT JOIN user u ON u.id_user = k.id_user
      WHERE l.id_karyawan = ?
    `;

    const params: any[] = [id_karyawan];

    if (bulan) {
      query += ` AND DATE_FORMAT(l.tanggal, '%Y-%m') = ?`;
      params.push(bulan);
    }

    query += ` ORDER BY l.tanggal DESC`;

    const rows: any[] = await prisma.$queryRawUnsafe(query, ...params);

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal mengambil data lembur",
      },
      { status: 500 },
    );
  }
}

// ─── POST /api/mobile/lembur ──────────────────────────────────────────────────

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
      `INSERT INTO lembur_karyawan (id_karyawan, tanggal, total_jam_lembur, keterangan, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      id_karyawan,
      tanggal,
      jam,
      keterangan || null,
    );

    return NextResponse.json({
      success: true,
      message: "Pengajuan lembur berhasil dikirim",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membuat lembur" },
      { status: 500 },
    );
  }
}
