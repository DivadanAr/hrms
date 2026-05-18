"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  Timer,
  TrendingUp,
  User,
} from "lucide-react";

import { ToastContainer, useToast } from "@/components/toast";

type DetailAbsensiType = {
  id_absensi: number;

  tanggal: string;

  hari: string;

  id_karyawan: number;

  nama_karyawan: string;

  jam_masuk: string | null;

  jam_pulang: string | null;

  lokasi: string | null;

  status: string;

  terlambat_menit: number;
};

type Props = {
  id_karyawan: number;
};

export default function DetailAbsensiKaryawan({ id_karyawan }: Props) {
  const [data, setData] = useState<DetailAbsensiType[]>([]);

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

      const firstDay = `${tahun}-${bulan}-01`;

      const lastDay = new Date(Number(tahun), Number(bulan), 0)
        .toISOString()
        .split("T")[0];

      const res = await fetch(
        `/api/absensi/karyawan/${id_karyawan}?dari_tanggal=${firstDay}&sampai_tanggal=${lastDay}`,
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
    return data.filter(
      (item) =>
        item.hari.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.lokasi || "").toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [data, searchQuery]);

  // =========================
  // STATISTIK
  // =========================
  const totalHadir = filtered.length;

  const totalTerlambat = filtered.filter(
    (item) => item.terlambat_menit > 0,
  ).length;

  const totalTepatWaktu = filtered.filter(
    (item) => item.terlambat_menit <= 0,
  ).length;

  const totalMenitTerlambat = filtered.reduce(
    (sum, item) => sum + item.terlambat_menit,
    0,
  );

  // =========================
  // FORMAT
  // =========================
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time: string | null) => {
    if (!time) return "-";

    return time.slice(0, 5);
  };

  return (
    <>
      <div className="p-4 md:p-6 space-y-5">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Detail Absensi Karyawan
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Riwayat absensi harian karyawan
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            {/* SEARCH */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 h-11 bg-white shadow-sm">
              <Search size={16} className="text-gray-400" />

              <input
                type="text"
                placeholder="Cari data..."
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
                {Array.from({
                  length: 12,
                }).map((_, i) => (
                  <option key={i} value={String(i + 1).padStart(2, "0")}>
                    {new Date(2026, i).toLocaleString("id-ID", {
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

        {/* PROFILE */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <User size={24} className="text-emerald-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {data[0]?.nama_karyawan || "-"}
              </h2>

              <p className="text-sm text-gray-500">
                ID Karyawan: {id_karyawan}
              </p>
            </div>
          </div>
        </div>

        {/* STATISTIK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
          </div>

          {/* Terlambat */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Terlambat</p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {totalTerlambat}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">
                <Timer size={20} className="text-amber-600" />
              </div>
            </div>
          </div>

          {/* Menit */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Menit Terlambat</p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {totalMenitTerlambat}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                <TrendingUp size={20} className="text-purple-600" />
              </div>
            </div>
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
                    Tanggal
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Hari
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Jam Masuk
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Jam Pulang
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Status
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Terlambat
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Lokasi
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />

                        <span className="text-sm">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-16 text-center text-sm text-gray-400"
                    >
                      Tidak ada data absensi
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, index) => (
                    <tr
                      key={item.id_absensi}
                      className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors"
                    >
                      {/* NO */}
                      <td className="pl-5 py-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </div>
                      </td>

                      {/* Tanggal */}
                      <td className="py-4">
                        <p className="text-sm font-medium text-gray-700">
                          {formatDate(item.tanggal)}
                        </p>
                      </td>

                      {/* Hari */}
                      <td className="py-4">
                        <span className="text-sm text-gray-700">
                          {item.hari}
                        </span>
                      </td>

                      {/* Masuk */}
                      <td className="py-4">
                        <span className="text-sm font-medium text-gray-700">
                          {formatTime(item.jam_masuk)}
                        </span>
                      </td>

                      {/* Pulang */}
                      <td className="py-4">
                        <span className="text-sm font-medium text-gray-700">
                          {formatTime(item.jam_pulang)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            item.status === "tepat waktu"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Terlambat */}
                      <td className="py-4">
                        <span
                          className={`text-sm font-medium ${
                            item.terlambat_menit > 0
                              ? "text-red-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {item.terlambat_menit} menit
                        </span>
                      </td>

                      {/* Lokasi */}
                      <td className="py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin size={15} className="text-gray-400" />

                          {item.lokasi || "-"}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
