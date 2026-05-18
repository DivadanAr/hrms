import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.$queryRawUnsafe(`
      SELECT
          (
              SELECT COUNT(*)
              FROM karyawan
          ) AS total_karyawan,

          (
              SELECT COUNT(*)
              FROM departemen
          ) AS total_departemen,

          (
              SELECT COUNT(*)
              FROM jabatan
          ) AS total_jabatan,

          (
              SELECT COUNT(*)
              FROM absensi
              WHERE tanggal = CURDATE()
          ) AS total_hadir_hari_ini,

          (
              SELECT COUNT(*)
              FROM absensi a
              JOIN absensi_setting s ON 1=1
              WHERE
                  a.tanggal = CURDATE()
                  AND TIME(a.jam_masuk) > s.normal_jam_masuk
          ) AS total_terlambat_hari_ini,

          (
              SELECT COALESCE(
                  SUM(
                      CASE
                          WHEN kg.tipe = 'pendapatan'
                          THEN pg.nominal
                          ELSE -pg.nominal
                      END
                  ),
                  0
              )
              FROM pengalokasian_gaji pg
              JOIN komponen_gaji kg
                  ON kg.id_komponen_gaji = pg.id_komponen_gaji
          ) AS total_penggajian,
        (
            SELECT COUNT(*)
            FROM absensi a
            JOIN absensi_setting s ON 1=1
            WHERE
                MONTH(a.tanggal) = MONTH(CURDATE())
                AND YEAR(a.tanggal) = YEAR(CURDATE())
                AND TIME(a.jam_masuk) <= s.normal_jam_masuk
        ) AS total_tepat_waktu_bulan_ini,

        (
            SELECT COUNT(*)
            FROM absensi a
            JOIN absensi_setting s ON 1=1
            WHERE
                MONTH(a.tanggal) = MONTH(CURDATE())
                AND YEAR(a.tanggal) = YEAR(CURDATE())
                AND TIME(a.jam_masuk) > s.normal_jam_masuk
        ) AS total_terlambat_bulan_ini,

        (
            (
                SELECT COUNT(*)
                FROM karyawan
            ) * DAY(LAST_DAY(CURDATE()))
        ) -
        (
            SELECT COUNT(*)
            FROM absensi
            WHERE
                MONTH(tanggal) = MONTH(CURDATE())
                AND YEAR(tanggal) = YEAR(CURDATE())
        ) AS total_tidak_hadir_bulan_ini
    `);

    const raw = (result as any[])[0];

    const data = {
      total_karyawan: Number(raw.total_karyawan || 0),

      total_departemen: Number(raw.total_departemen || 0),

      total_jabatan: Number(raw.total_jabatan || 0),

      total_hadir_hari_ini: Number(raw.total_hadir_hari_ini || 0),

      total_terlambat_hari_ini: Number(raw.total_terlambat_hari_ini || 0),

      total_penggajian: Number(raw.total_penggajian || 0),

      total_tepat_waktu_bulan_ini: Number(raw.total_tepat_waktu_bulan_ini || 0),

      total_terlambat_bulan_ini: Number(raw.total_terlambat_bulan_ini || 0),

      total_tidak_hadir_bulan_ini: Number(raw.total_tidak_hadir_bulan_ini || 0),
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Terjadi kesalahan server",
      },
      {
        status: 500,
      },
    );
  }
}
