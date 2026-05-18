import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idKaryawan = searchParams.get("id_karyawan");

    let data;

    if (idKaryawan) {
      /**
       * DETAIL per karyawan
       * Mengembalikan setiap baris komponen gaji beserta info komponennya.
       * Diurutkan: pendapatan dulu, lalu potongan, lalu urut ID.
       */
      data = await prisma.$queryRawUnsafe(
        `
        SELECT
          pg.id_pengalokasian_gaji,
          pg.id_karyawan,
          pg.id_komponen_gaji,
          kg.nama_komponen_gaji,
          kg.tipe,
          kg.keterangan                    AS keterangan_komponen,
          pg.nominal
        FROM pengalokasian_gaji pg
        JOIN komponen_gaji kg
          ON kg.id_komponen_gaji = pg.id_komponen_gaji
        WHERE pg.id_karyawan = ?
        ORDER BY
          FIELD(kg.tipe, 'pendapatan', 'potongan'),
          pg.id_pengalokasian_gaji ASC
        `,
        Number(idKaryawan),
      );
    } else {
      /**
       * LIST semua karyawan — sudah diagregasi di SQL.
       * Setiap baris = 1 karyawan dengan:
       *   - jumlah_komponen  : total komponen yang dialokasikan
       *   - total_pendapatan : SUM nominal tipe pendapatan
       *   - total_potongan   : SUM nominal tipe potongan
       *   - gaji_bersih      : total_pendapatan - total_potongan
       * Karyawan tanpa alokasi tetap muncul dengan nilai 0.
       */
      data = await prisma.$queryRawUnsafe(
        `
        SELECT
          k.id_karyawan,
          k.nama,
          k.nip,
          k.status,
          j.nama_jabatan,
          d.nama_departemen,
          COUNT(pg.id_pengalokasian_gaji)                              AS jumlah_komponen,
          COALESCE(SUM(CASE WHEN kg.tipe = 'pendapatan' THEN pg.nominal ELSE 0 END), 0) AS total_pendapatan,
          COALESCE(SUM(CASE WHEN kg.tipe = 'potongan'   THEN pg.nominal ELSE 0 END), 0) AS total_potongan,
          COALESCE(SUM(CASE WHEN kg.tipe = 'pendapatan' THEN pg.nominal ELSE 0 END), 0)
            - COALESCE(SUM(CASE WHEN kg.tipe = 'potongan' THEN pg.nominal ELSE 0 END), 0) AS gaji_bersih
        FROM karyawan k
        LEFT JOIN jabatan j
          ON j.id_jabatan = k.id_jabatan
        LEFT JOIN departemen d
          ON d.id_departemen = k.id_departemen
        LEFT JOIN pengalokasian_gaji pg
          ON pg.id_karyawan = k.id_karyawan
        LEFT JOIN komponen_gaji kg
          ON kg.id_komponen_gaji = pg.id_komponen_gaji
        GROUP BY
          k.id_karyawan,
          k.nama,
          k.nip,
          k.status,
          j.nama_jabatan,
          d.nama_departemen
        ORDER BY k.nama ASC
        `,
      );
    }

    const serializedData = (data as any[]).map((item) => ({
      ...item,
      jumlah_komponen: Number(item.jumlah_komponen || 0),
      total_pendapatan: Number(item.total_pendapatan || 0),
      total_potongan: Number(item.total_potongan || 0),
      gaji_bersih: Number(item.gaji_bersih || 0),
    }));
    return NextResponse.json({
      success: true,
      data: serializedData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validasi field wajib
    if (
      !body.id_komponen_gaji ||
      !body.id_karyawan ||
      body.nominal === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "id_komponen_gaji, id_karyawan, dan nominal wajib diisi.",
        },
        { status: 400 },
      );
    }

    // Cek duplikat — satu karyawan tidak boleh punya komponen yang sama dua kali
    const existing: any[] = await prisma.$queryRawUnsafe(
      `
      SELECT id_pengalokasian_gaji
      FROM pengalokasian_gaji
      WHERE id_karyawan = ? AND id_komponen_gaji = ?
      LIMIT 1
      `,
      Number(body.id_karyawan),
      Number(body.id_komponen_gaji),
    );

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Komponen gaji ini sudah dialokasikan untuk karyawan tersebut.",
        },
        { status: 409 },
      );
    }

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO pengalokasian_gaji (id_komponen_gaji, id_karyawan, nominal)
      VALUES (?, ?, ?)
      `,
      Number(body.id_komponen_gaji),
      Number(body.id_karyawan),
      Number(body.nominal),
    );

    return NextResponse.json({
      success: true,
      message: "Pengalokasian gaji berhasil ditambahkan.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
