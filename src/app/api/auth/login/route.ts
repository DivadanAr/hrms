import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { email, password, device } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email dan password wajib diisi",
        },
        { status: 400 },
      );
    }

    // QUERY RAW
    const users = await prisma.$queryRaw<any[]>`
      SELECT
        u.id_user,
        u.email,
        u.password,
        u.role,
        k.id_karyawan,
        k.nama,
        d.nama_departemen,
        j.nama_jabatan

      FROM karyawan k

      LEFT JOIN user u
        ON u.id_user = k.id_user

      LEFT JOIN departemen d
        ON d.id_departemen = k.id_departemen

      LEFT JOIN jabatan j
        ON j.id_jabatan = k.id_jabatan

      WHERE u.email = ${email}
      
      LIMIT 1
    `;

    const user = users[0];

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Email tidak ditemukan",
        },
        { status: 404 },
      );
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Password salah",
        },
        { status: 401 },
      );
    }

    // Payload JWT
    const payload = {
      id_user: user.id_user,
      email: user.email,
      role: user.role,
      id_karyawan: user.id_karyawan,
      nama: user.nama,
      departemen: user.nama_departemen,
      jabatan: user.nama_jabatan,

      device,
    };

    // Generate token
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    // Response
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      token,
      user: payload,
    });

    // Simpan cookies
    // response.cookies.set("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   path: "/",
    //   maxAge: 60 * 60 * 24 * 7,
    // });

    return response;
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
