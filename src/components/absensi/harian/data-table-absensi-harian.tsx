"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock3,
  MapPin,
  Search,
  UserCheck,
  Timer,
  CircleAlert,
} from "lucide-react";

import { ToastContainer, useToast } from "@/components/toast";

type AbsensiType = {
  tanggal: string;
  hari: string;

  nama_karyawan: string;

  jam_masuk: string | null;
  jam_pulang: string | null;

  lokasi: string | null;

  status: string;

  terlambat_menit: number;
};

export default function AbsensiHarianTable() {
  const [data, setData] = useState<AbsensiType[]>([]);

  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [dariTanggal, setDariTanggal] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [sampaiTanggal, setSampaiTanggal] = useState(
    new Date().toISOString().split("T")[0],
  );

  const { toasts, removeToast, toast } = useToast();

  // =========================
  // FETCH
  // =========================
  const getData = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/absensi?dari_tanggal=${dariTanggal}&sampai_tanggal=${sampaiTanggal}`,
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
        item.nama_karyawan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.hari.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [data, searchQuery]);

  // =========================
  // STATISTIK
  // =========================
  const totalHadir = data.length;

  const totalTepatWaktu = data.filter(
    (item) => item.status.toLowerCase() === "tepat waktu",
  ).length;

  const totalTerlambat = data.filter((item) => item.terlambat_menit > 0).length;

  const totalBelumPulang = data.filter((item) => !item.jam_pulang).length;

  // =========================
  // FORMAT
  // =========================
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
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
              Absensi Harian
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Monitoring data kehadiran dan keterlambatan karyawan
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 h-11 bg-white shadow-sm">
              <Search size={16} className="text-gray-400" />

              <input
                type="text"
                placeholder="Cari absensi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent w-full sm:w-64"
              />
            </div>

            {/* Date */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dariTanggal}
                onChange={(e) => setDariTanggal(e.target.value)}
                className="h-11 px-3 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white"
              />

              <span className="text-gray-400 text-sm">s/d</span>

              <input
                type="date"
                value={sampaiTanggal}
                onChange={(e) => setSampaiTanggal(e.target.value)}
                className="h-11 px-3 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white"
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
          {/* Total */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Kehadiran</p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {totalHadir}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                <UserCheck size={20} className="text-blue-600" />
              </div>
            </div>

            <span className="inline-flex mt-4 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
              Semua absensi
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

              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Clock3 size={20} className="text-emerald-600" />
              </div>
            </div>

            <span className="inline-flex mt-4 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
              Tepat waktu
            </span>
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

            <span className="inline-flex mt-4 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
              Datang terlambat
            </span>
          </div>

          {/* Belum Pulang */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Belum Checkout</p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {totalBelumPulang}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
                <CircleAlert size={20} className="text-red-600" />
              </div>
            </div>

            <span className="inline-flex mt-4 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
              Belum pulang
            </span>
          </div>
        </div>

        {/* MOBILE CARD */}
        <div className="grid grid-cols-1 md:hidden gap-4">
          {loading ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-sm text-gray-400">
              Memuat data...
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-sm text-gray-400">
              Data absensi tidak ditemukan
            </div>
          ) : (
            filtered.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800">
                      {item.nama_karyawan}
                    </h2>

                    <p className="text-xs text-gray-400 mt-1">
                      {item.hari}, {formatDate(item.tanggal)}
                    </p>
                  </div>

                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${
                      item.terlambat_menit > 0
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock3 size={15} className="text-gray-400" />
                    Masuk: {formatTime(item.jam_masuk)}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock3 size={15} className="text-gray-400" />
                    Pulang: {formatTime(item.jam_pulang)}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Timer size={15} className="text-gray-400" />
                    Terlambat: {item.terlambat_menit} menit
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={15} className="text-gray-400" />

                    {item.lokasi ?? "-"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* TABLE */}
        <div className="hidden md:block bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
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
                    Karyawan
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Jam Masuk
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Jam Pulang
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Lokasi
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Status
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Terlambat
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
                      key={index}
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
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {formatDate(item.tanggal)}
                          </p>

                          <p className="text-xs text-gray-400 mt-1 capitalize">
                            {item.hari}
                          </p>
                        </div>
                      </td>

                      {/* Karyawan */}
                      <td className="py-4">
                        <p className="text-sm font-semibold text-gray-800">
                          {item.nama_karyawan}
                        </p>
                      </td>

                      {/* Masuk */}
                      <td className="py-4">
                        <span className="text-sm text-gray-700">
                          {formatTime(item.jam_masuk)}
                        </span>
                      </td>

                      {/* Pulang */}
                      <td className="py-4">
                        <span className="text-sm text-gray-700">
                          {formatTime(item.jam_pulang)}
                        </span>
                      </td>

                      {/* Lokasi */}
                      <td className="py-4">
                        <p className="text-sm text-gray-600">
                          {item.lokasi ?? "-"}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            item.terlambat_menit > 0
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
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
                              ? "text-red-500"
                              : "text-emerald-600"
                          }`}
                        >
                          {item.terlambat_menit} menit
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-50">
              <p className="text-xs text-gray-400">
                Menampilkan{" "}
                <span className="font-semibold text-gray-600">
                  {filtered.length}
                </span>{" "}
                data absensi
              </p>
            </div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
