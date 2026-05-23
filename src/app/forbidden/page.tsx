import Link from "next/link";
import { LockKeyhole, ArrowLeft, ShieldBan } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Background */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-red-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-xl">
          <div className="rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(239,68,68,0.15)] p-10 text-center">
            {/* Icon */}
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-red-100 shadow-inner">
              <LockKeyhole size={44} className="text-red-500" />
            </div>

            {/* Code */}
            <h1 className="mt-8 text-7xl font-black tracking-tight text-gray-900">
              403
            </h1>

            {/* Title */}
            <h2 className="mt-4 text-2xl font-bold text-gray-800">
              Access Forbidden
            </h2>

            {/* Desc */}
            <p className="mt-3 text-sm leading-relaxed text-gray-500 max-w-md mx-auto">
              Kamu tidak memiliki izin untuk mengakses halaman ini. Silakan
              hubungi administrator HRMS apabila ini adalah kesalahan.
            </p>

            {/* Warning */}
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
              <div className="flex items-center justify-center gap-2 text-sm text-red-700">
                <ShieldBan size={16} />
                Restricted Role Access Detected
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-medium text-white transition-all hover:bg-red-600 active:scale-95"
              >
                <ArrowLeft size={16} />
                Kembali
              </Link>

              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
              >
                Login Dengan Akun Lain
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            HRMS Security Layer • Protected Resource
          </p>
        </div>
      </div>
    </div>
  );
}
