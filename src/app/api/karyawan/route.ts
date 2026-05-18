import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { nullable } from "@/lib/utils/nullable";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    // nullable + convert number
    const limit =
      limitParam && limitParam.trim() !== "" ? Number(limitParam) : null;

    const offset =
      offsetParam && offsetParam.trim() !== "" ? Number(offsetParam) : null;

    let query = `
      SELECT *
      FROM data_karyawan
      ORDER BY id_karyawan DESC
    `;

    const values: any[] = [];

    // jika limit ada
    if (limit !== null) {
      query += ` LIMIT ?`;
      values.push(limit);

      // jika offset ada
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
      {
        status: 500,
      },
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // required
    const email = body.email;
    const password = body.password;
    const nama = body.nama;
    const jenis_kelamin = body.jenis_kelamin;
    const nip = body.nip;
    const tanggal_masuk = body.tanggal_masuk;

    // validasi sederhana
    if (
      !email ||
      !password ||
      !nama ||
      !jenis_kelamin ||
      !nip ||
      !tanggal_masuk ||
      !body.id_jabatan ||
      !body.id_departemen
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Data wajib belum lengkap",
        },
        { status: 400 },
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // execute stored procedure
    await prisma.$executeRawUnsafe(
      `
      CALL sp_tambah_karyawan(
        ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
      `,
      email,
      hashedPassword,
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
      body.id_jabatan,
      body.id_departemen,
    );

    return NextResponse.json({
      success: true,
      message: "Data karyawan berhasil ditambahkan",
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Terjadi kesalahan",
      },
      { status: 500 },
    );
  }
}
