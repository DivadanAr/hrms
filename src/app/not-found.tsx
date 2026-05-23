import Link from "next/link";
import { SearchX, ArrowLeft, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Background Blur */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-xl">
          {/* Card */}
          <div className="rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(16,185,129,0.15)] p-10 text-center">
            {/* Icon */}
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-100 shadow-inner">
              <SearchX size={44} className="text-emerald-600" />
            </div>

            {/* Code */}
            <h1 className="mt-8 text-7xl font-black tracking-tight text-gray-900">
              404
            </h1>

            {/* Title */}
            <h2 className="mt-4 text-2xl font-bold text-gray-800">
              Halaman Tidak Ditemukan
            </h2>

            {/* Desc */}
            <p className="mt-3 text-sm leading-relaxed text-gray-500 max-w-md mx-auto">
              Halaman yang kamu cari mungkin sudah dipindahkan, dihapus, atau
              URL yang dimasukkan tidak tersedia pada sistem HRMS.
            </p>

            {/* Info Box */}
            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <div className="flex items-center justify-center gap-2 text-sm text-emerald-700">
                <ShieldAlert size={16} />
                HR Management System Protected Area
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-medium text-white transition-all hover:bg-emerald-600 active:scale-95"
              >
                <ArrowLeft size={16} />
                Kembali ke Dashboard
              </Link>

              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
              >
                Login Ulang
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-400">
            HRMS • Human Resource Management System
          </p>
        </div>
      </div>
    </div>
  );
}
