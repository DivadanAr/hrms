"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import ModalTambahDepartemen from "./modal/modal-tambah-departemen";
import ModalEditDepartemen from "./modal/modal-edit-departemen";
import ModalDeleteDepartemen from "./modal/modal-delete-departemen";
import { ToastContainer, useToast } from "../toast";

type DepartemenType = {
  id_departemen: number;
  nama_departemen: string;
  keterangan: string | null;
  jumlah_karyawan: number;
};

export default function departemenTable() {
  const [departemen, setdepartemen] = useState<DepartemenType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // modal
  const [modalTambah, setModalTambah] = useState(false);
  const [modalEdit, setModalEdit] = useState<DepartemenType | null>(null);
  const [modalDelete, setModalDelete] = useState<DepartemenType | null>(null);
  const { toasts, removeToast, toast } = useToast();

  // fetch data
  const getData = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/departemen");

      const result = await res.json();

      if (result.success) {
        setdepartemen(result.data);
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
    return departemen.filter((item) =>
      item.nama_departemen.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [departemen, searchQuery]);

  const totalKaryawan = useMemo(() => {
    return departemen.reduce(
      (acc, item) => acc + (item.jumlah_karyawan ?? 0),
      0,
    );
  }, [departemen]);

  const karyawanPerdepartemen = useMemo(() => {
    return departemen.map((item) => ({
      nama: item.nama_departemen,
      jumlah: item.jumlah_karyawan ?? 0,
    }));
  }, [departemen]);

  const maxJumlah = Math.max(...karyawanPerdepartemen.map((d) => d.jumlah), 1);

  const generatePastelColor = () => {
    const hue = Math.floor(Math.random() * 360);

    return `hsl(${hue}, 70%, 80%)`;
  };

  const pastelColors = useMemo(() => {
    return karyawanPerdepartemen.map(() => generatePastelColor());
  }, [karyawanPerdepartemen]);

  return (
    <>
      <div className="p-4 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">departemen</h1>

            <p className="text-sm text-gray-500 mt-1">
              Informasi dan pengelolaan departemen perusahaan
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 h-11 bg-white shadow-sm">
              <Search size={16} className="text-gray-400" />

              <input
                type="text"
                placeholder="Cari departemen..."
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
          {/* Total departemen */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Total departemen</p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? "–" : departemen.length}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                <BriefcaseBusiness size={20} className="text-emerald-600" />
              </div>
            </div>

            <span className="inline-flex mt-4 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
              Semua departemen
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
            ) : karyawanPerdepartemen.length === 0 ? (
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
                        data={karyawanPerdepartemen}
                        dataKey="jumlah"
                        nameKey="nama"
                        innerRadius={30}
                        outerRadius={55}
                        paddingAngle={3}
                      >
                        {karyawanPerdepartemen.map((_, index) => (
                          <Cell key={index} fill={pastelColors[index]} />
                        ))}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="space-y-2 w-60 h-30 overflow-y-scroll">
                  {karyawanPerdepartemen.map((item, index) => (
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
                    Nama departemen
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
                          ? "departemen tidak ditemukan"
                          : "Belum ada data departemen"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, index) => {
                    return (
                      <tr
                        key={item.id_departemen}
                        className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors"
                      >
                        <td className="pl-5 py-4">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">
                            {index + 1}
                          </div>
                        </td>

                        <td className="py-4">
                          <p className="text-sm text-gray-800">
                            {item.nama_departemen}
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
                  {departemen.length}
                </span>{" "}
                departemen
              </p>
            </div>
          )}
        </div>
      </div>

      <ModalTambahDepartemen
        isOpen={modalTambah}
        onClose={() => setModalTambah(false)}
        onSuccess={(msg: string) => {
          getData();
          toast.success(msg);
        }}
        onError={(msg: string) => toast.error(msg)}
      />

      <ModalEditDepartemen
        isOpen={!!modalEdit}
        data={modalEdit}
        onClose={() => setModalEdit(null)}
        onSuccess={(msg: string) => {
          getData();
          toast.success(msg);
        }}
        onError={(msg: string) => toast.error(msg)}
      />

      <ModalDeleteDepartemen
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
