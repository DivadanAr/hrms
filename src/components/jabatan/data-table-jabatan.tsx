"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import ModalTambahJabatan from "./modal/modal-tambah-jabatan";
import ModalEditJabatan from "./modal/modal-edit-jabatan";
import ModalDeleteJabatan from "./modal/modal-delete-jabatan";
import { ToastContainer, useToast } from "../toast";

type JabatanType = {
  id_jabatan: number;
  nama_jabatan: string;
  keterangan: string | null;
  jumlah_karyawan: number;
};

export default function JabatanTable() {
  const [jabatan, setJabatan] = useState<JabatanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // modal
  const [modalTambah, setModalTambah] = useState(false);
  const [modalEdit, setModalEdit] = useState<JabatanType | null>(null);
  const [modalDelete, setModalDelete] = useState<JabatanType | null>(null);
  const { toasts, removeToast, toast } = useToast();

  // fetch data
  const getData = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/jabatan");

      const result = await res.json();

      if (result.success) {
        setJabatan(result.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // search filter
  const filtered = useMemo(() => {
    return jabatan.filter((item) =>
      item.nama_jabatan.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [jabatan, searchQuery]);

  const totalKaryawan = useMemo(() => {
    return jabatan.reduce((acc, item) => acc + (item.jumlah_karyawan ?? 0), 0);
  }, [jabatan]);

  const karyawanPerJabatan = useMemo(() => {
    return jabatan.map((item) => ({
      nama: item.nama_jabatan,
      jumlah: item.jumlah_karyawan ?? 0,
    }));
  }, [jabatan]);

  const maxJumlah = Math.max(...karyawanPerJabatan.map((d) => d.jumlah), 1);

  const generatePastelColor = () => {
    const hue = Math.floor(Math.random() * 360);

    return `hsl(${hue}, 70%, 80%)`;
  };

  const pastelColors = useMemo(() => {
    return karyawanPerJabatan.map(() => generatePastelColor());
  }, [karyawanPerJabatan]);

  return (
    <>
      <div className="p-4 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Jabatan</h1>

            <p className="text-sm text-gray-500 mt-1">
              Informasi dan pengelolaan jabatan perusahaan
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 h-11 bg-white shadow-sm">
              <Search size={16} className="text-gray-400" />

              <input
                type="text"
                placeholder="Cari jabatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent w-full sm:w-52"
              />
            </div>

            {/* Button */}
            <button
              onClick={() => setModalTambah(true)}
              className="inline-flex items-center justify-center gap-2 h-11 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-all active:scale-95 shadow-sm"
            >
              <Plus size={16} />
              Tambah Data
            </button>
          </div>
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Total Jabatan */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Jabatan</p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? "–" : jabatan.length}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                <BriefcaseBusiness size={20} className="text-emerald-600" />
              </div>
            </div>

            <span className="inline-flex mt-4 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
              Semua jabatan
            </span>
          </div>

          {/* Total Karyawan */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Karyawan</p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? "–" : totalKaryawan}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                <BriefcaseBusiness size={20} className="text-blue-600" />
              </div>
            </div>

            <span className="inline-flex mt-4 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
              Semua posisi
            </span>
          </div>

          {/* Donut Chart */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-700">
                Karyawan per Departemen
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-56">
                <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : karyawanPerJabatan.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-sm text-gray-400">
                Tidak ada data
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row items-center gap-6">
                {/* Chart */}
                <div className="w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={karyawanPerJabatan}
                        dataKey="jumlah"
                        nameKey="nama"
                        innerRadius={30}
                        outerRadius={55}
                        paddingAngle={3}
                      >
                        {karyawanPerJabatan.map((_, index) => (
                          <Cell key={index} fill={pastelColors[index]} />
                        ))}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="space-y-2 w-60 h-30 overflow-y-scroll">
                  {karyawanPerJabatan.map((item, index) => (
                    <div
                      key={item.nama}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Color */}
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: pastelColors[index],
                          }}
                        />

                        {/* Label */}
                        <span className="text-sm text-gray-600 truncate">
                          {item.nama}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4 pl-5 w-16">
                    No
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Nama Jabatan
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Keterangan
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4 w-32">
                    Karyawan
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4 w-40">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-14 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />

                        <span className="text-sm">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-14 text-center">
                      <BriefcaseBusiness
                        size={34}
                        className="mx-auto mb-3 text-gray-300"
                      />

                      <p className="text-sm text-gray-400">
                        {searchQuery
                          ? "Jabatan tidak ditemukan"
                          : "Belum ada data jabatan"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, index) => {
                    return (
                      <tr
                        key={item.id_jabatan}
                        className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors"
                      >
                        <td className="pl-5 py-4">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">
                            {index + 1}
                          </div>
                        </td>

                        <td className="py-4">
                          <p className="text-sm text-gray-800">
                            {item.nama_jabatan}
                          </p>
                        </td>

                        <td className="py-4">
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {item.keterangan ?? "-"}
                          </p>
                        </td>

                        <td className="py-4">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-600">
                            {item.jumlah_karyawan ?? 0} karyawan
                          </span>
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
                              onClick={() => setModalDelete(item)}
                              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-red-500 border border-red-300 rounded-lg hover:bg-red-50 transition-all"
                            >
                              <Trash2 size={13} />
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
                  {jabatan.length}
                </span>{" "}
                jabatan
              </p>
            </div>
          )}
        </div>
      </div>

      <ModalTambahJabatan
        isOpen={modalTambah}
        onClose={() => setModalTambah(false)}
        onSuccess={(msg: string) => {
          getData();
          toast.success(msg);
        }}
        onError={(msg: string) => toast.error(msg)}
      />

      <ModalEditJabatan
        isOpen={!!modalEdit}
        data={modalEdit}
        onClose={() => setModalEdit(null)}
        onSuccess={(msg: string) => {
          getData();
          toast.success(msg);
        }}
        onError={(msg: string) => toast.error(msg)}
      />

      <ModalDeleteJabatan
        isOpen={!!modalDelete}
        data={modalDelete}
        onClose={() => setModalDelete(null)}
        onSuccess={(msg: string) => {
          getData();
          toast.success(msg);
        }}
        onError={(msg: string) => toast.error(msg)}
      />

      {/* Toast */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
