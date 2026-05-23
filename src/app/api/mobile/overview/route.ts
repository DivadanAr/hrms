import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCookie } from "@/context/cookie";

export async function GET(req: NextRequest) {
  try {
    const rawUser = await getCookie("__vxu_meta-Us");

    if (!rawUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const parsedUser = JSON.parse(rawUser);

    const id_user = parsedUser.id_user;

    // cari karyawan login
    const karyawan = await prisma.$queryRaw<any[]>`
      SELECT
        id_karyawan,
        nama
      FROM karyawan
      WHERE id_user = ${id_user}
      LIMIT 1
    `;

    if (karyawan.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Karyawan tidak ditemukan",
        },
        {
          status: 404,
        },
      );
    }

    const id_karyawan = karyawan[0].id_karyawan;

    // overview hari ini
    const overview = await prisma.$queryRaw<any[]>`
      SELECT
        jam_masuk,
        jam_pulang
      FROM absensi
      WHERE id_karyawan = ${id_karyawan}
      AND tanggal = CURDATE()
      LIMIT 1
    `;

    // jumlah hadir bulan ini
    const hadir = await prisma.$queryRaw<any[]>`
      SELECT
        COUNT(DISTINCT tanggal) AS jumlah_kehadiran
      FROM absensi
      WHERE id_karyawan = ${id_karyawan}
      AND DATE_FORMAT(tanggal, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
      AND DAYOFWEEK(tanggal) NOT IN (1,7)
    `;

    // hitung hari kerja bulan ini
    const hariKerja = await prisma.$queryRaw<any[]>`
      WITH RECURSIVE dates AS (
        SELECT DATE_FORMAT(CURDATE(), '%Y-%m-01') AS tanggal

        UNION ALL

        SELECT DATE_ADD(tanggal, INTERVAL 1 DAY)
        FROM dates
        WHERE tanggal < LAST_DAY(CURDATE())
      )

      SELECT COUNT(*) AS jumlah_hari_kerja
      FROM dates
      WHERE DAYOFWEEK(tanggal) NOT IN (1,7)
    `;

    // tidak hadir = hari kerja - hadir
    const jumlahHadir = Number(hadir[0].jumlah_kehadiran);
    const jumlahHariKerja = Number(hariKerja[0].jumlah_hari_kerja);

    const jumlahTidakHadir = jumlahHariKerja - jumlahHadir;

    return NextResponse.json({
      success: true,

      data: {
        checkin: overview[0]?.jam_masuk || null,
        checkout: overview[0]?.jam_pulang || null,

        jumlah_kehadiran: jumlahHadir,
        jumlah_tidak_hadir: jumlahTidakHadir < 0 ? 0 : jumlahTidakHadir,
      },
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data overview",
      },
      {
        status: 500,
      },
    );
  }
}
