import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { nullable } from "@/lib/utils/nullable";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const { id } = await params;

    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    const limit =
      limitParam && limitParam.trim() !== "" ? Number(limitParam) : null;

    const offset =
      offsetParam && offsetParam.trim() !== "" ? Number(offsetParam) : null;

    let query = `
      SELECT *
      FROM data_karyawan
      WHERE id_karyawan = ?
      ORDER BY id_karyawan DESC
    `;

    const values: any[] = [Number(id)];

    if (limit !== null) {
      query += ` LIMIT ?`;
      values.push(limit);

      if (offset !== null) {
        query += ` OFFSET ?`;
        values.push(offset);
      }
    }

    const data = await prisma.$queryRawUnsafe<any[]>(query, ...values);

    return NextResponse.json({
      success: true,
      data,
      total_data: data.length,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data",
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const body = await req.json();

    // required
    const email = body.email;
    const nama = body.nama;
    const jenis_kelamin = body.jenis_kelamin;
    const nip = body.nip;
    const tanggal_masuk = body.tanggal_masuk;

    if (!email || !nama || !jenis_kelamin || !nip || !tanggal_masuk) {
      return NextResponse.json(
        {
          success: false,
          message: "Data wajib belum lengkap",
        },
        {
          status: 400,
        },
      );
    }

    // optional password
    let hashedPassword = null;

    if (body.password && body.password.trim() !== "") {
      hashedPassword = await bcrypt.hash(body.password, 10);
    }

    await prisma.$executeRawUnsafe(
      `
      CALL sp_edit_karyawan(
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
      `,
      Number(id),

      email,
      nullable(body.role),

      nama,
      jenis_kelamin,
      nullable(body.alamat),
      nip,
      nullable(body.no_rek),
      nullable(body.no_telp),
      nullable(body.status),
      tanggal_masuk,
      nullable(body.tanggal_keluar),
      nullable(body.id_jabatan),
      nullable(body.id_departemen),
    );

    // update password jika dikirim
    if (hashedPassword) {
      await prisma.$executeRawUnsafe(
        `
        UPDATE user u
        JOIN karyawan k
        ON k.id_user = u.id_user
        SET u.password = ?
        WHERE k.id_karyawan = ?
        `,
        hashedPassword,
        Number(id),
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data karyawan berhasil diupdate",
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal update data",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    await prisma.$executeRawUnsafe(`CALL sp_delete_karyawan(?)`, Number(id));

    return NextResponse.json({
      success: true,
      message: "Data karyawan berhasil dihapus",
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal menghapus data",
      },
      {
        status: 500,
      },
    );
  }
}
