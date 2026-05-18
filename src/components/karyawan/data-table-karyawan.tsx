"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  Calendar,
  Mail,
  Phone,
  Search,
  Users,
  Venus,
  Mars,
  Eye,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import ModalTambahKaryawan from "./modal/modal-tambah-karyawan";
import ModalEditKaryawan from "./modal/modal-edit-karyawan";
import ModalDeleteKaryawan from "./modal/modal-delete-karyawan";
import { ToastContainer, useToast } from "../toast";

type KaryawanType = {
  id_karyawan: number;
  nama: string;
  jenis_kelamin: "L" | "P";
  alamat: string | null;
  nip: string;
  no_rek: string | null;
  no_telp: string | null;

  id_user: number;
  email: string;
  role: string;

  status: string;

  tanggal_masuk: string;
  tanggal_keluar: string | null;

  id_departemen: number;
  nama_departemen: string;

  id_jabatan: number;
  nama_jabatan: string;
};

export default function KaryawanTable() {
  const [karyawan, setKaryawan] = useState<KaryawanType[]>([]);

  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedKaryawan, setSelectedKaryawan] = useState<KaryawanType | null>(
    null,
  );

  const [modalTambah, setModalTambah] = useState(false);
  const [modalEdit, setModalEdit] = useState<KaryawanType | null>(null);
  const [modalDelete, setModalDelete] = useState<KaryawanType | null>(null);
  const { toasts, removeToast, toast } = useToast();

  // =========================
  // FETCH
  // =========================
  const getData = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/karyawan");

      const result = await res.json();

      if (result.success) {
        setKaryawan(result.data);
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

  // =========================
  // FILTER
  // =========================
  const filtered = useMemo(() => {
    return karyawan.filter(
      (item) =>
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nama_departemen
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.nama_jabatan.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [karyawan, searchQuery]);

  // =========================
  // STATISTIK
  // =========================
  const totalAktif = karyawan.filter((k) => k.status === "aktif").length;

  const totalNonaktif = karyawan.filter((k) => k.status !== "aktif").length;

  const totalLaki = karyawan.filter((k) => k.jenis_kelamin === "L").length;

  const totalPerempuan = karyawan.filter((k) => k.jenis_kelamin === "P").length;

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

  return (
    <>
      <div className="p-4 md:p-6 space-y-5">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Data Karyawan
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Informasi dan pengelolaan data karyawan perusahaan
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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

        {/* STATISTIK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Total */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Karyawan</p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {karyawan.length}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
            </div>

            <span className="inline-flex mt-4 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
              Semua karyawan
            </span>
          </div>

          {/* Aktif */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Karyawan Aktif</p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {totalAktif}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                <BadgeCheck size={20} className="text-emerald-600" />
              </div>
            </div>

            <span className="inline-flex mt-4 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
              Status aktif
            </span>
          </div>

          {/* Laki */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Laki-laki</p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {totalLaki}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-sky-100 flex items-center justify-center">
                <Mars size={20} className="text-sky-600" />
              </div>
            </div>

            <span className="inline-flex mt-4 px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-medium">
              Laki-laki
            </span>
          </div>

          {/* Perempuan */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Perempuan</p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {totalPerempuan}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-pink-100 flex items-center justify-center">
                <Venus size={20} className="text-pink-600" />
              </div>
            </div>

            <span className="inline-flex mt-4 px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-medium">
              Perempuan
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
              Data karyawan tidak ditemukan
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id_karyawan}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800">
                      {item.nama}
                    </h2>

                    <p className="text-xs text-gray-400 mt-1">{item.email}</p>
                  </div>

                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${
                      item.status === "aktif"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Info */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 size={15} className="text-gray-400" />

                    {item.nama_departemen}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase size={15} className="text-gray-400" />

                    {item.nama_jabatan}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={15} className="text-gray-400" />

                    {item.no_telp ?? "-"}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={15} className="text-gray-400" />
                    Masuk {formatDate(item.tanggal_masuk)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* TABLE DESKTOP */}
        <div className="hidden md:block bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4 pl-5">
                    No
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Karyawan
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Kontak
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Departemen
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Jabatan
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Gender
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Status
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4">
                    Tanggal Masuk
                  </th>

                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-4 w-52">
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
                    <td
                      colSpan={8}
                      className="py-16 text-center text-sm text-gray-400"
                    >
                      Tidak ada data karyawan
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, index) => (
                    <tr
                      key={item.id_karyawan}
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
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {item.nama}
                          </p>

                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <Mail size={12} />

                            {item.email}
                          </div>

                          <p className="text-xs text-gray-400 mt-1">
                            NIP: {item.nip}
                          </p>
                        </div>
                      </td>

                      {/* Kontak */}
                      <td className="py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            {item.no_telp ?? "-"}
                          </p>

                          <p className="text-xs text-gray-400">
                            Rek: {item.no_rek ?? "-"}
                          </p>
                        </div>
                      </td>

                      {/* Departemen */}
                      <td className="py-4">
                        <span className="inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                          {item.nama_departemen}
                        </span>
                      </td>

                      {/* Jabatan */}
                      <td className="py-4">
                        <span className="inline-flex px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                          {item.nama_jabatan}
                        </span>
                      </td>

                      {/* Gender */}
                      <td className="py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            item.jenis_kelamin === "L"
                              ? "bg-sky-100 text-sky-700"
                              : "bg-pink-100 text-pink-700"
                          }`}
                        >
                          {item.jenis_kelamin === "L"
                            ? "Laki-laki"
                            : "Perempuan"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            item.status === "aktif"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Tanggal */}
                      <td className="py-4">
                        <div>
                          <p className="text-sm text-gray-700">
                            {formatDate(item.tanggal_masuk)}
                          </p>

                          {item.tanggal_keluar && (
                            <p className="text-xs text-red-400 mt-1">
                              Keluar {formatDate(item.tanggal_keluar)}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          {/* Edit */}
                          <button
                            onClick={() => {
                              // modal edit milikmu
                              setSelectedKaryawan(item);
                              setModalEdit(item);
                            }}
                            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-amber-600 border border-amber-300 rounded-lg hover:bg-amber-50 transition-all"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              setSelectedKaryawan(item);
                              setModalDelete(item);
                            }}
                            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-all"
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
                  {karyawan.length}
                </span>{" "}
                karyawan
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ModalTambahKaryawan
        isOpen={modalTambah}
        onClose={() => setModalTambah(false)}
        onSuccess={(msg) => {
          getData();
          toast.success(msg);
        }}
        onError={(msg) => toast.error(msg)}
      />
      <ModalEditKaryawan
        isOpen={!!modalEdit}
        data={modalEdit}
        onClose={() => setModalEdit(null)}
        onSuccess={(msg) => {
          getData();
          toast.success(msg);
        }}
        onError={(msg) => toast.error(msg)}
      />
      <ModalDeleteKaryawan
        isOpen={!!modalDelete}
        data={modalDelete}
        onClose={() => setModalDelete(null)}
        onSuccess={(msg) => {
          getData();
          toast.success(msg);
        }}
        onError={(msg) => toast.error(msg)}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
