"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CircleDollarSign,
  Pencil,
  Plus,
  Search,
  Settings2,
  Trash2,
} from "lucide-react";
import { ToastContainer, useToast } from "../toast";
import { useRouter } from "next/navigation";
import ModalTambahPenggajian from "./modal/tambah-penggajian";
import DeleteConfirmModalPenggajian from "./modal/delete-komponen";

type PenggajianType = {
  id_penggajian: number;
  nama_karyawan: string;
  nip: string;
  nama_jabatan: string;
  periode: string;
  total_pendapatan: number;
  total_potongan: number;
  gaji_bersih: number;
};

export default function PenggajianTable() {
  const router = useRouter();
  const [penggajian, setPenggajian] = useState<PenggajianType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [modalTambah, setModalTambah] = useState(false);
  const [modalEdit, setModalEdit] = useState<PenggajianType | null>(null);
  const [modalDelete, setModalDelete] = useState<PenggajianType | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast, toasts, removeToast } = useToast();

  const [bulan, setBulan] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0"),
  );

  const [tahun, setTahun] = useState(String(new Date().getFullYear()));

  function formatRupiah(nominal: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(nominal);
  }

  const getData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/penggajian?bulan=${bulan}&tahun=${tahun}`);
      const result = await res.json();
      if (result.success) setPenggajian(result.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const filtered = useMemo(() => {
    return penggajian.filter((item) =>
      item.nama_karyawan.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [penggajian, searchQuery]);

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/penggajian/${deleteId}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message || "Gagal menghapus");

      toast.success("Berhasil dihapus");
      setDeleteId(null);
      getData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Penggajian</h1>
            <p className="text-sm text-gray-500 mt-1">
              Laporan karyawan yang sudah dilakukan penggajian
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 h-11 bg-white">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Cari Karyawan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent w-full sm:w-56"
              />
            </div>
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
            <button
              onClick={() => setModalTambah(true)}
              className="inline-flex items-center justify-center gap-2 h-11 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-all active:scale-95"
            >
              <Plus size={16} />
              Buat Penggajian
            </button>
          </div>
        </div>

        {/* Table — sama persis dengan kode asal */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4 pl-5 w-16">
                  No
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                  Nama Karyawan
                </th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-4 w-40">
                  NIP
                </th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-4 w-40">
                  Jabatan
                </th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-4 w-50">
                  Periode Penggajian
                </th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-4 w-50">
                  Gaji diterima
                </th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-2 w-46">
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
                  <td colSpan={7} className="py-16 text-center">
                    <CircleDollarSign
                      size={36}
                      className="mx-auto mb-3 text-gray-300"
                    />
                    <p className="text-sm text-gray-400">
                      {searchQuery
                        ? "Penggajian tidak ditemukan"
                        : "Belum ada data Penggajian"}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => (
                  <tr
                    key={item.id_penggajian}
                    className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="pl-5 py-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="text-sm text-gray-800">
                        {item.nama_karyawan}
                      </p>
                    </td>
                    <td className="py-4">
                      <p className="text-sm text-center text-gray-800">
                        {item.nip}
                      </p>
                    </td>
                    <td className="py-4">
                      <p className="text-sm text-center text-gray-800">
                        {item.nama_jabatan}
                      </p>
                    </td>
                    <td className="py-4">
                      <p className="text-sm text-center text-gray-800">
                        {item.periode}
                      </p>
                    </td>

                    <td className="py-4">
                      <p className="text-sm text-center text-black font-semibold">
                        {formatRupiah(item.gaji_bersih)}
                      </p>
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap justify-center items-center gap-2">
                        <button
                          onClick={() =>
                            router.push(`/penggajian/${item.id_penggajian}`)
                          }
                          className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-emerald-600 border border-emerald-300 rounded-lg hover:bg-emerald-50 active:scale-95 transition-all duration-150"
                        >
                          <Settings2 size={12} />
                          Detail
                        </button>
                        <button
                          onClick={() => handleDelete(item.id_penggajian)}
                          className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-red-500 border border-red-300 rounded-lg hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={13} />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-4 border-t border-gray-50">
            <p className="text-xs text-gray-400">
              Menampilkan{" "}
              <span className="font-semibold text-gray-600">
                {filtered.length}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-gray-600">
                {penggajian.length}
              </span>{" "}
              Penggajian
            </p>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <DeleteConfirmModalPenggajian
        isOpen={!!deleteId}
        loading={deleteLoading}
        title="Hapus Penggajian?"
        description="Penggajian yang dihapus tidak dapat dikembalikan."
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />

      <ModalTambahPenggajian
        isOpen={modalTambah}
        onClose={() => setModalTambah(false)}
        onSuccess={(msg) => {
          toast.success(msg);
          getData();
        }}
        onError={(msg) => {
          toast.error(msg);
        }}
      />
    </>
  );
}
