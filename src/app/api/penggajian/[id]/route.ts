import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    let data_detail_penggajian;
    let data_penggajian;

    data_detail_penggajian = await prisma.$queryRawUnsafe<any[]>(`
      SELECT
        p.id_penggajian,
        p.periode,
        kg.nama_komponen_gaji,
        kg.tipe,
        dp.nominal,
        dp.keterangan
        FROM
        penggajian p
      JOIN detail_penggajian dp ON
        dp.id_penggajian = p.id_penggajian
      JOIN komponen_gaji kg ON
        dp.id_komponen_gaji = kg.id_komponen_gaji
      WHERE p.id_penggajian = ${Number(id)};
    `);

    data_penggajian = await prisma.$queryRawUnsafe<any[]>(`
      SELECT
          p.id_penggajian,
          k.id_karyawan,
          k.nama AS nama_karyawan,
          k.nip,
          j.nama_jabatan,
          p.periode,
          p.total_pendapatan,
          p.total_potongan,
          p.gaji_bersih
      FROM
          penggajian p
      JOIN karyawan k ON
          p.id_karyawan = k.id_karyawan
      JOIN jabatan j ON
          j.id_jabatan = k.id_jabatan
      WHERE p.id_penggajian = ${Number(id)};
    `);

    const jumlah_izin = await prisma.$queryRawUnsafe(`
      SELECT
          COUNT(*) AS jumlah_izin
      FROM izin_karyawan
      WHERE id_karyawan = ${Number(data_penggajian[0].id_karyawan)}
      AND DATE_FORMAT(tanggal_mulai, '%Y-%m') = '${data_penggajian[0].periode}'
      AND status = 'diterima';
    `);

    const serializedJumlahIzin = (jumlah_izin as any[]).map((item) => ({
      jumlah_izin: Number(item.jumlah_izin),
    }));

    const jumlah_jam_lembur = await prisma.$queryRawUnsafe(`
      SELECT
          COALESCE(SUM(total_jam_lembur), 0) AS jumlah_jam_lembur
      FROM lembur_karyawan
      WHERE id_karyawan = ${Number(data_penggajian[0].id_karyawan)}
      AND DATE_FORMAT(tanggal, '%Y-%m') = '${data_penggajian[0].periode}'
      AND status = 'diterima';
    `);

    const serializedJumlahlembur = (jumlah_jam_lembur as any[]).map((item) => ({
      jumlah_jam_lembur: Number(item.jumlah_jam_lembur),
    }));

    const jumlah_hari_kerja = await prisma.$queryRawUnsafe(`
      WITH RECURSIVE tanggal AS (
          SELECT STR_TO_DATE(CONCAT('${data_penggajian[0].periode}', '-01'), '%Y-%m-%d') AS tgl

          UNION ALL

          SELECT DATE_ADD(tgl, INTERVAL 1 DAY)
          FROM tanggal
          WHERE tgl < LAST_DAY(
              STR_TO_DATE(CONCAT('${data_penggajian[0].periode}', '-01'), '%Y-%m-%d')
          )
      )

      SELECT
          COUNT(*) AS jumlah_hari_kerja
      FROM tanggal
      WHERE DAYOFWEEK(tgl) NOT IN (1, 7);
    `);

    const serializedJumlahHariKerja = (jumlah_hari_kerja as any[]).map(
      (item) => ({
        jumlah_hari_kerja: Number(item.jumlah_hari_kerja),
      }),
    );

    const jumlah_kehadiran = await prisma.$queryRawUnsafe(`
      SELECT COUNT(DISTINCT DATE(tanggal)) AS jumlah_kehadiran
      FROM absensi
      WHERE id_karyawan = ${Number(data_penggajian[0].id_karyawan)}
      AND DATE_FORMAT(tanggal, '%Y-%m') = '${data_penggajian[0].periode}'
      AND DAYOFWEEK(DATE(tanggal)) NOT IN (1,7);
    `);

    const serializedJumlahKehadiran = (jumlah_kehadiran as any[]).map(
      (item) => ({
        jumlah_kehadiran: Number(item.jumlah_kehadiran),
      }),
    );

    return NextResponse.json({
      success: true,
      data_detail_penggajian: data_detail_penggajian,
      data_penggajian: data_penggajian,
      jumlah_izin: serializedJumlahIzin[0].jumlah_izin,
      jumlah_jam_lembur: serializedJumlahlembur[0].jumlah_jam_lembur,
      jumlah_hari_kerja: serializedJumlahHariKerja[0].jumlah_hari_kerja,
      jumlah_kehadiran: serializedJumlahKehadiran[0].jumlah_kehadiran,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    await prisma.$executeRawUnsafe(
      `
      DELETE FROM detail_penggajian
      WHERE id_penggajian = ?
      `,
      Number(id),
    );

    await prisma.$executeRawUnsafe(
      `
      DELETE FROM penggajian
      WHERE id_penggajian = ?
      `,
      Number(id),
    );

    return NextResponse.json({
      success: true,
      message: "Penggajian berhasil dihapus",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
