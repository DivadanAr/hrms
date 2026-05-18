"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Users,
  Wallet,
  TrendingUp,
} from "lucide-react";

type KaryawanAlokasi = {
  id_karyawan: number;
  nama: string;
  nip: string;
  status: string;
  nama_jabatan: string | null;
  nama_departemen: string | null;
  jumlah_komponen: number;
  total_pendapatan: number;
  total_potongan: number;
  gaji_bersih: number;
};

const PER_PAGE = 10;

function formatRupiah(nominal: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(nominal);
}

export default function PengalokasianGajiTable() {
  const router = useRouter();
  const [list, setList] = useState<KaryawanAlokasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [deptList, setDeptList] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/pengalokasian-gaji");
        const json = await res.json();
        const data: KaryawanAlokasi[] = json.data ?? [];
        setList(data);
        const depts = [
          ...new Set(data.map((d) => d.nama_departemen).filter(Boolean)),
        ] as string[];
        setDeptList(depts);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterDept]);

  const filtered = list.filter((k) => {
    const matchSearch =
      k.nama.toLowerCase().includes(search.toLowerCase()) ||
      k.nip.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === "" || k.nama_departemen === filterDept;
    return matchSearch && matchDept;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

  const totalSudahAlokasi = list.filter(
    (k) => Number(k.jumlah_komponen) > 0,
  ).length;
  const totalBelumAlokasi = list.length - totalSudahAlokasi;
  const grandTotalGajiBersih = list.reduce(
    (acc, k) => acc + Number(k.gaji_bersih),
    0,
  );

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      )
        pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-medium text-gray-900">
              Pengalokasian Gaji
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Kelola komponen gaji per karyawan (pendapatan & potongan)
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 h-9 bg-white">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau NIP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent w-44"
              />
            </div>
            {deptList.length > 0 && (
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 outline-none focus:border-emerald-400"
              >
                <option value="">Semua Departemen</option>
                {deptList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">Sudah Dialokasikan</p>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Users size={14} className="text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-medium text-gray-900">
              {loading ? "–" : totalSudahAlokasi}
            </p>
            <span className="inline-block mt-1.5 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
              dari {list.length} karyawan
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">Belum Dialokasikan</p>
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <Settings2 size={14} className="text-amber-500" />
              </div>
            </div>
            <p className="text-2xl font-medium text-gray-900">
              {loading ? "–" : totalBelumAlokasi}
            </p>
            <span className="inline-block mt-1.5 text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
              Perlu dikonfigurasi
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">Total Gaji Bersih</p>
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <Wallet size={14} className="text-blue-500" />
              </div>
            </div>
            <p className="text-lg font-medium text-gray-900">
              {loading ? "–" : formatRupiah(grandTotalGajiBersih)}
            </p>
            <span className="inline-block mt-1.5 text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
              Semua karyawan
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide py-3 pl-4 w-12">
                    No
                  </th>
                  <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide py-3">
                    Karyawan
                  </th>
                  <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide py-3 w-32">
                    Komponen
                  </th>
                  <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide py-3 w-36">
                    Total Pendapatan
                  </th>
                  <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide py-3 w-36">
                    Total Potongan
                  </th>
                  <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide py-3 w-36">
                    Gaji Bersih
                  </th>
                  <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide py-3 w-24">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-sm text-gray-400"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-sm text-gray-400"
                    >
                      <TrendingUp
                        size={32}
                        className="mx-auto mb-2 text-gray-300"
                      />
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  paginated.map((item, index) => {
                    const sudahAlokasi = Number(item.jumlah_komponen) > 0;
                    return (
                      <tr
                        key={item.id_karyawan}
                        className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors duration-100"
                      >
                        <td className="pl-4 py-3.5">
                          <span
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium"
                            style={{ background: "#D1FAE5", color: "#065F46" }}
                          >
                            {(currentPage - 1) * PER_PAGE + index + 1}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-emerald-700">
                                {item.nama.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {item.nama}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                NIP {item.nip}
                                {item.nama_jabatan
                                  ? ` · ${item.nama_jabatan}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5">
                          {sudahAlokasi ? (
                            <span className="inline-block text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                              {Number(item.jumlah_komponen)} komponen
                            </span>
                          ) : (
                            <span className="inline-block text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
                              Belum ada
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-sm font-medium text-emerald-600">
                          {sudahAlokasi
                            ? formatRupiah(Number(item.total_pendapatan))
                            : "–"}
                        </td>
                        <td className="py-3.5 text-sm font-medium text-red-500">
                          {sudahAlokasi
                            ? formatRupiah(Number(item.total_potongan))
                            : "–"}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`text-sm font-semibold ${sudahAlokasi ? "text-gray-800" : "text-gray-400"}`}
                          >
                            {sudahAlokasi
                              ? formatRupiah(Number(item.gaji_bersih))
                              : "–"}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <button
                            onClick={() =>
                              router.push(
                                `/pengalokasian-gaji/${item.id_karyawan}`,
                              )
                            }
                            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-emerald-600 border border-emerald-300 rounded-lg hover:bg-emerald-50 active:scale-95 transition-all duration-150"
                          >
                            <Settings2 size={12} />
                            Kelola
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
              <p className="text-xs text-gray-400">
                Menampilkan{" "}
                <span className="font-medium text-gray-600">
                  {(currentPage - 1) * PER_PAGE + 1}–
                  {Math.min(currentPage * PER_PAGE, filtered.length)}
                </span>{" "}
                dari{" "}
                <span className="font-medium text-gray-600">
                  {filtered.length}
                </span>{" "}
                karyawan
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {getPageNumbers().map((page, i) =>
                    page === "..." ? (
                      <span
                        key={`e-${i}`}
                        className="w-8 h-8 flex items-center justify-center text-xs text-gray-400"
                      >
                        ···
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${currentPage === page ? "bg-emerald-500 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
