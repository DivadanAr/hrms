"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Clock3, Search, TimerReset, X } from "lucide-react";

type LemburType = {
  id_lembur: number;
  id_karyawan: number;
  nama_karyawan: string;
  tanggal: string;
  total_jam_lembur: number;
  keterangan: string | null;
  status: "pending" | "diterima" | "ditolak";
  aproved_by: number | null;
  approved_by_email: string | null;
};

export default function LemburTable() {
  const [lembur, setLembur] = useState<LemburType[]>([]);

  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  // =========================
  // FILTER TANGGAL
  // =========================
  const now = new Date();

  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [tanggalMulai, setTanggalMulai] = useState(firstDay);

  const [tanggalAkhir, setTanggalAkhir] = useState(lastDay);

  // =========================
  // MODAL APPROVAL
  // =========================
  const [modalApproval, setModalApproval] = useState<{
    open: boolean;
    id: number | null;
    status: "diterima" | "ditolak" | null;
  }>({
    open: false,
    id: null,
    status: null,
  });

  const [approvalLoading, setApprovalLoading] = useState(false);

  // =========================
  // FETCH DATA
  // =========================
  const getData = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        tanggal_mulai: tanggalMulai,
        tanggal_akhir: tanggalAkhir,
      });

      const res = await fetch(`/api/lembur?${params.toString()}`);

      const result = await res.json();

      if (result.success) {
        setLembur(result.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [tanggalMulai, tanggalAkhir]);

  // =========================
  // SEARCH
  // =========================
  const filtered = useMemo(() => {
    return lembur.filter((item) =>
      item.nama_karyawan.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [lembur, searchQuery]);

  // =========================
  // STATISTIK
  // =========================
  const totalPending = lembur.filter((i) => i.status === "pending").length;

  const totalDiterima = lembur.filter((i) => i.status === "diterima").length;

  const totalDitolak = lembur.filter((i) => i.status === "ditolak").length;

  const totalJamLembur = lembur
    .filter((i) => i.status === "diterima")
    .reduce((acc, curr) => acc + Number(curr.total_jam_lembur), 0);

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================
  // APPROVAL
  // =========================
  const handleApproval = async () => {
    try {
      if (!modalApproval.id || !modalApproval.status) {
        return;
      }

      setApprovalLoading(true);

      const res = await fetch(`/api/lembur/approval/${modalApproval.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: modalApproval.status,
          aproved_by: 1,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        alert(result.message);
        return;
      }

      setModalApproval({
        open: false,
        id: null,
        status: null,
      });

      await getData();
    } catch (error) {
      console.log(error);

      alert("Gagal approval lembur");
    } finally {
      setApprovalLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Lembur Karyawan
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Pengajuan dan approval lembur karyawan
          </p>
        </div>

        {/* FILTER */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3">
          {/* Dari */}
          <div className="flex items-center gap-2 px-3 h-11 border border-gray-200 rounded-xl bg-white shadow-sm">
            <span className="text-xs text-gray-500 whitespace-nowrap">
              Dari
            </span>

            <input
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="text-sm outline-none bg-transparent text-gray-700"
            />
          </div>

          {/* Sampai */}
          <div className="flex items-center gap-2 px-3 h-11 border border-gray-200 rounded-xl bg-white shadow-sm">
            <span className="text-xs text-gray-500 whitespace-nowrap">
              Sampai
            </span>

            <input
              type="date"
              value={tanggalAkhir}
              onChange={(e) => setTanggalAkhir(e.target.value)}
              className="text-sm outline-none bg-transparent text-gray-700"
            />
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 h-11 bg-white shadow-sm">
            <Search size={16} className="text-gray-400" />

            <input
              type="text"
              placeholder="Cari karyawan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent w-full sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* STATISTIK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Pending */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {totalPending}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Clock3 size={20} className="text-yellow-600" />
            </div>
          </div>

          <span className="inline-flex mt-4 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
            Menunggu approval
          </span>
        </div>

        {/* Diterima */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Diterima</p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {totalDiterima}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Check size={20} className="text-emerald-600" />
            </div>
          </div>

          <span className="inline-flex mt-4 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
            Approval berhasil
          </span>
        </div>

        {/* Ditolak */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Ditolak</p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {totalDitolak}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
              <X size={20} className="text-red-600" />
            </div>
          </div>

          <span className="inline-flex mt-4 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
            Pengajuan ditolak
          </span>
        </div>

        {/* Total Jam */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Jam Lembur</p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {totalJamLembur} Jam
              </h2>
            </div>

            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
              <TimerReset size={20} className="text-blue-600" />
            </div>
          </div>

          <span className="inline-flex mt-4 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
            Lembur diterima
          </span>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4 pl-5">
                  No
                </th>

                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                  Karyawan
                </th>

                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                  Tanggal
                </th>

                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                  Total Jam
                </th>

                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                  Keterangan
                </th>

                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                  Status
                </th>

                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                  Approved By
                </th>

                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                  Aksi
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
                  <td colSpan={8} className="py-16 text-center">
                    <TimerReset
                      size={36}
                      className="mx-auto mb-3 text-gray-300"
                    />

                    <p className="text-sm text-gray-400">
                      Tidak ada data lembur
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => (
                  <tr
                    key={item.id_lembur}
                    className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors"
                  >
                    {/* No */}
                    <td className="pl-5 py-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                    </td>

                    {/* Karyawan */}
                    <td className="py-4">
                      <p className="text-sm font-semibold text-gray-800">
                        {item.nama_karyawan}
                      </p>
                    </td>

                    {/* Tanggal */}
                    <td className="py-4">
                      <p className="text-sm text-gray-600">
                        {formatDate(item.tanggal)}
                      </p>
                    </td>

                    {/* Total Jam */}
                    <td className="py-4">
                      <span className="inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                        {item.total_jam_lembur} Jam
                      </span>
                    </td>

                    {/* Keterangan */}
                    <td className="py-4 max-w-[250px]">
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {item.keterangan ?? "-"}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          item.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : item.status === "diterima"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Approved */}
                    <td className="py-4">
                      <p className="text-sm text-gray-500">
                        {item.approved_by_email ?? "-"}
                      </p>
                    </td>

                    {/* Aksi */}
                    <td className="py-4">
                      {item.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setModalApproval({
                                open: true,
                                id: item.id_lembur,
                                status: "diterima",
                              })
                            }
                            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-emerald-600 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-all"
                          >
                            <Check size={13} />
                            Terima
                          </button>

                          <button
                            onClick={() =>
                              setModalApproval({
                                open: true,
                                id: item.id_lembur,
                                status: "ditolak",
                              })
                            }
                            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-all"
                          >
                            <X size={13} />
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Sudah diproses
                        </span>
                      )}
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
              dari{" "}
              <span className="font-semibold text-gray-600">
                {lembur.length}
              </span>{" "}
              data lembur
            </p>
          </div>
        )}
      </div>

      {/* MODAL APPROVAL */}
      {modalApproval.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Konfirmasi Approval
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Apakah anda yakin ingin{" "}
                {modalApproval.status === "diterima" ? "menerima" : "menolak"}{" "}
                pengajuan lembur ini?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 p-5">
              <button
                onClick={() =>
                  setModalApproval({
                    open: false,
                    id: null,
                    status: null,
                  })
                }
                className="h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
              >
                Batal
              </button>

              <button
                disabled={approvalLoading}
                onClick={handleApproval}
                className={`inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 ${
                  modalApproval.status === "diterima"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {approvalLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}

                {modalApproval.status === "diterima"
                  ? "Terima Lembur"
                  : "Tolak Lembur"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
