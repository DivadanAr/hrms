"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Search,
  Timer,
  TrendingUp,
  UserCheck,
  Eye,
} from "lucide-react";

import { ToastContainer, useToast } from "@/components/toast";
import Link from "next/link";

type RekapBulananType = {
  id_karyawan: number;

  nama_karyawan: string;

  total_hadir: number;

  total_tepat_waktu: number;

  total_terlambat_menit: number;
};

export default function AbsensiBulananTable() {
  const [data, setData] = useState<RekapBulananType[]>([]);

  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [bulan, setBulan] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0"),
  );

  const [tahun, setTahun] = useState(String(new Date().getFullYear()));

  const { toast, toasts, removeToast } = useToast();

  // =========================
  // FETCH
  // =========================
  const getData = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/absensi/bulanan?bulan=${bulan}&tahun=${tahun}`,
      );

      const result = await res.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.message || "Gagal mengambil data");
      }
    } catch (error) {
      console.log(error);

      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // =========================
  // FILTER
  // =========================
  const filtered = useMemo(() => {
    return data.filter((item) =>
      item.nama_karyawan.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [data, searchQuery]);

  // =========================
  // STATISTIK
  // =========================
  const totalKaryawan = filtered.length;

  const totalHadir = filtered.reduce((sum, item) => sum + item.total_hadir, 0);

  const totalTepatWaktu = filtered.reduce(
    (sum, item) => sum + item.total_tepat_waktu,
    0,
  );

  const rataTerlambat =
    filtered.length > 0
      ? Math.round(
          filtered.reduce((sum, item) => sum + item.total_terlambat_menit, 0) /
            filtered.length,
        )
      : 0;

  return (
    <>
      <div className="p-4 md:p-6 space-y-5">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Absensi Bulanan
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Rekap kehadiran dan keterlambatan karyawan
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            {/* SEARCH */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 h-11 bg-white shadow-sm">
              <Search size={16} className="text-gray-400" />

              <input
                type="text"
                placeholder="Cari karyawan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent w-full sm:w-64"
              />
            </div>

            {/* FILTER */}
            <div className="flex items-center gap-2">
              <select
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="h-11 px-3 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={String(i + 1).padStart(2, "0")}>
                    {new Date(2025, i).toLocaleString("id-ID", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                className="h-11 w-28 px-3 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white"
              />

              <button
                onClick={getData}
                className="h-11 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-all"
              >
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* STATISTIK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Total Karyawan */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Karyawan</p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {totalKaryawan}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                <UserCheck size={20} className="text-blue-600" />
              </div>
            </div>

            <span className="inline-flex mt-4 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
              Rekap karyawan
            </span>
          </div>

          {/* Hadir */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Hadir</p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {totalHadir}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CalendarDays size={20} className="text-emerald-600" />
              </div>
            </div>

            <span className="inline-flex mt-4 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
              Hari hadir
            </span>
          </div>

          {/* Tepat Waktu */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Tepat Waktu</p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {totalTepatWaktu}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-sky-100 flex items-center justify-center">
                <Clock3 size={20} className="text-sky-600" />
              </div>
            </div>

            <span className="inline-flex mt-4 px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-medium">
              Datang tepat waktu
            </span>
          </div>

          {/* Avg */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Terlambat</p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {rataTerlambat}
                  <span className="text-base ml-1">mnt</span>
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                <TrendingUp size={20} className="text-purple-600" />
              </div>
            </div>

            <span className="inline-flex mt-4 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
              Rata-rata keterlambatan
            </span>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4 pl-5">
                    No
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Nama Karyawan
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Total Hadir
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Tepat Waktu
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Total Menit Terlambat
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />

                        <span className="text-sm">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-16 text-center text-sm text-gray-400"
                    >
                      Tidak ada data absensi
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, index) => (
                    <tr
                      key={item.id_karyawan}
                      className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors"
                    >
                      {/* NO */}
                      <td className="pl-5 py-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </div>
                      </td>

                      {/* NAMA */}
                      <td className="py-4">
                        <p className="text-sm font-semibold text-gray-800">
                          {item.nama_karyawan}
                        </p>
                      </td>

                      {/* HADIR */}
                      <td className="py-4">
                        <span className="inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                          {item.total_hadir} Hari
                        </span>
                      </td>

                      {/* TEPAT */}
                      <td className="py-4">
                        <span className="text-sm font-medium text-sky-600">
                          {item.total_tepat_waktu} Hari
                        </span>
                      </td>

                      {/* MENIT */}
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Clock3 size={15} className="text-gray-400" />

                          <span className="text-sm text-gray-700">
                            {item.total_terlambat_menit} menit
                          </span>
                        </div>
                      </td>

                      {/* ACTION */}
                      <td className="py-4">
                        <Link
                          href={`/absensi/karyawan/${item.id_karyawan}`}
                          className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-all"
                        >
                          <Eye size={13} />
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          {!loading && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-50">
              <p className="text-xs text-gray-400">
                Menampilkan{" "}
                <span className="font-semibold text-gray-600">
                  {filtered.length}
                </span>{" "}
                data karyawan
              </p>
            </div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
