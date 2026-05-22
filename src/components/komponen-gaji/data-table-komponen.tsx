"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleDollarSign, Pencil, Plus, Search, Trash2 } from "lucide-react";
import ModalTambahKomponen from "./modal/tambah-komponen";
import { ToastContainer, useToast } from "../toast";
import DeleteConfirmModalKomponen from "./modal/delete-komponen";
import ModalEditKomponen from "./modal/edit-komponen";

type KomponenGajiType = {
  id_komponen_gaji: number;
  nama_komponen_gaji: string;
  keterangan: string | null;
  tipe: "pendapatan" | "potongan";
};

export default function KomponenGajiTable() {
  const [komponenGaji, setKomponenGaji] = useState<KomponenGajiType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [modalTambah, setModalTambah] = useState(false);
  const [modalEdit, setModalEdit] = useState<KomponenGajiType | null>(null);
  const [modalDelete, setModalDelete] = useState<KomponenGajiType | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast, toasts, removeToast } = useToast();

  const getData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/komponen-gaji");
      const result = await res.json();
      if (result.success) setKomponenGaji(result.data);
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
    return komponenGaji.filter((item) =>
      item.nama_komponen_gaji.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [komponenGaji, searchQuery]);

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/komponen-gaji/${deleteId}`, {
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
      <div className="p-4 md:p-6">
        {/* Modal Tambah */}
        {modalTambah && (
          <ModalTambahKomponen
            onClose={() => setModalTambah(false)}
            onSuccess={getData}
          />
        )}

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 border-b border-gray-100">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Komponen Gaji
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Master data komponen penggajian
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 h-11 bg-white">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari komponen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent w-full sm:w-56"
                />
              </div>
              <button
                onClick={() => setModalTambah(true)}
                className="inline-flex items-center justify-center gap-2 h-11 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-all active:scale-95"
              >
                <Plus size={16} />
                Tambah Data
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
                    Nama Komponen
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4 w-40">
                    Tipe
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Keterangan
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4 w-40">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <CircleDollarSign
                        size={36}
                        className="mx-auto mb-3 text-gray-300"
                      />
                      <p className="text-sm text-gray-400">
                        {searchQuery
                          ? "Komponen tidak ditemukan"
                          : "Belum ada data komponen gaji"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, index) => (
                    <tr
                      key={item.id_komponen_gaji}
                      className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="pl-5 py-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-4">
                        <p className="text-sm text-gray-800">
                          {item.nama_komponen_gaji}
                        </p>
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                            item.tipe === "pendapatan"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.tipe}
                        </span>
                      </td>
                      <td className="py-4">
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {item.keterangan ?? "-"}
                        </p>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setModalEdit(item)}
                            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-all"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id_komponen_gaji)}
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
                  {komponenGaji.length}
                </span>{" "}
                komponen gaji
              </p>
            </div>
          )}
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <DeleteConfirmModalKomponen
        isOpen={!!deleteId}
        loading={deleteLoading}
        title="Hapus Komponen Gaji?"
        description="Komponen gaji yang dihapus tidak dapat dikembalikan."
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
      {modalEdit && (
        <ModalEditKomponen
          data={modalEdit}
          onClose={() => setModalEdit(null)}
          onSuccess={() => {
            getData();
            toast.success("Komponen berhasil diperbarui");
          }}
        />
      )}{" "}
    </>
  );
}
