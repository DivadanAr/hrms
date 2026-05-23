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

    // ambil id karyawan
    const karyawan = await prisma.$queryRaw<any[]>`
      SELECT
        id_karyawan
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

    const histories = await prisma.$queryRaw<any[]>`
        SELECT
            tanggal,

            TIME_FORMAT(jam_masuk, '%H:%i') AS jam_masuk,

            TIME_FORMAT(jam_pulang, '%H:%i') AS jam_pulang,

            lokasi,

            TIME_FORMAT(
                TIMEDIFF(
                    TIME(jam_pulang),
                    TIME(jam_masuk)
                ),
                '%H:%i'
            ) AS total_jam

        FROM absensi
        WHERE id_karyawan = ${id_karyawan}
        ORDER BY tanggal DESC
        LIMIT 10;
    `;

    return NextResponse.json({
      success: true,
      data: histories,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil history absensi",
      },
      {
        status: 500,
      },
    );
  }
}
