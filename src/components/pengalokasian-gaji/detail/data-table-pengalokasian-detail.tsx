"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
} from "lucide-react";

import { ToastContainer, useToast } from "@/components/toast";
import DeleteConfirmModal from "./delete-komponen-alokasi";

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

type KomponenGaji = {
  id_komponen_gaji: number;
  nama_komponen_gaji: string;
  tipe: "pendapatan" | "potongan";
  keterangan: string | null;
};

type PengalokasianItem = {
  id_pengalokasian_gaji: number;
  id_komponen_gaji: number;
  id_karyawan: number;
  nominal: string;

  nama_komponen_gaji: string;
  tipe: "pendapatan" | "potongan";
  keterangan: string | null;
};

function formatRupiah(nominal: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(nominal);
}

function parseRupiah(val: string) {
  return Number(val.replace(/\D/g, ""));
}

function formatInput(val: string) {
  const num = val.replace(/\D/g, "");
  if (!num) return "";
  return new Intl.NumberFormat("id-ID").format(Number(num));
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL TAMBAH / EDIT
// ─────────────────────────────────────────────────────────────────────────────
function ModalKomponen({
  isOpen,
  editData,
  komponenList,
  idKaryawan,
  onClose,
  onSuccess,
  onError,
}: {
  isOpen: boolean;
  editData: PengalokasianItem | null;
  komponenList: KomponenGaji[];
  idKaryawan: number;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [idKomponen, setIdKomponen] = useState("");
  const [nominal, setNominal] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{
    komponen?: string;
    nominal?: string;
  }>({});

  useEffect(() => {
    if (editData) {
      setIdKomponen(String(editData.id_komponen_gaji));
      setNominal(formatInput(String(editData.nominal)));
    } else {
      setIdKomponen("");
      setNominal("");
    }

    setErrors({});
  }, [editData, isOpen]);

  const selectedKomponen = komponenList.find(
    (k) => k.id_komponen_gaji === Number(idKomponen),
  );

  const validate = () => {
    const e: typeof errors = {};

    if (!idKomponen) {
      e.komponen = "Pilih komponen gaji.";
    }

    if (!nominal || parseRupiah(nominal) <= 0) {
      e.nominal = "Nominal harus lebih dari 0.";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const isEdit = !!editData;

      const url = isEdit
        ? `/api/pengalokasian-gaji/${editData.id_pengalokasian_gaji}`
        : "/api/pengalokasian-gaji";

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_karyawan: idKaryawan,
          id_komponen_gaji: Number(idKomponen),
          nominal: parseRupiah(nominal),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal menyimpan.");
      }

      onClose();

      onSuccess(
        isEdit
          ? "Komponen gaji berhasil diperbarui."
          : "Komponen gaji berhasil ditambahkan.",
      );
    } catch (err: any) {
      onError(err.message || "Gagal menyimpan.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm mx-4 bg-white rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                editData ? "bg-blue-50" : "bg-emerald-50"
              }`}
            >
              {editData ? (
                <Pencil size={14} className="text-blue-600" />
              ) : (
                <Plus size={14} className="text-emerald-600" />
              )}
            </div>

            <div>
              <h2 className="text-sm font-medium text-black">
                {editData ? "Edit Komponen" : "Tambah Komponen"}
              </h2>

              <p className="text-xs text-black">Komponen gaji karyawan</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-black hover:bg-gray-100"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Komponen */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-black">
              Komponen Gaji
            </label>

            <select
              value={idKomponen}
              onChange={(e) => {
                setIdKomponen(e.target.value);
                setErrors((v) => ({
                  ...v,
                  komponen: "",
                }));
              }}
              disabled={loading || !!editData}
              className="w-full h-9 px-3 text-sm text-gray-800 rounded-lg border border-gray-200"
            >
              <option value="">Pilih komponen</option>

              <optgroup label="Pendapatan">
                {komponenList
                  .filter((k) => k.tipe === "pendapatan")
                  .map((k) => (
                    <option key={k.id_komponen_gaji} value={k.id_komponen_gaji}>
                      {k.nama_komponen_gaji}
                    </option>
                  ))}
              </optgroup>

              <optgroup label="Potongan">
                {komponenList
                  .filter((k) => k.tipe === "potongan")
                  .map((k) => (
                    <option key={k.id_komponen_gaji} value={k.id_komponen_gaji}>
                      {k.nama_komponen_gaji}
                    </option>
                  ))}
              </optgroup>
            </select>

            {errors.komponen && (
              <p className="text-xs text-red-500">{errors.komponen}</p>
            )}
          </div>

          {/* Nominal */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-black">Nominal</label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-black">
                Rp
              </span>

              <input
                type="text"
                inputMode="numeric"
                value={nominal}
                onChange={(e) => {
                  setNominal(formatInput(e.target.value));

                  setErrors((v) => ({
                    ...v,
                    nominal: "",
                  }));
                }}
                className="w-full h-9 pl-8 pr-3 text-sm text-gray-800 rounded-lg border border-gray-200"
              />
            </div>

            {errors.nominal && (
              <p className="text-xs text-red-500">{errors.nominal}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-9 px-4 text-sm border border-gray-200 rounded-lg"
          >
            Batal
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="h-9 px-4 text-sm text-white bg-emerald-500 rounded-lg"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function PengalokasianGajiDetail() {
  const router = useRouter();
  const params = useParams();

  const idKaryawan = Number(params.id);

  const { toast, toasts, removeToast } = useToast();

  const [karyawan, setKaryawan] = useState<KaryawanType | null>(null);

  const [alokasi, setAlokasi] = useState<PengalokasianItem[]>([]);
  const [komponenList, setKomponenList] = useState<KomponenGaji[]>([]);

  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);

  const [editData, setEditData] = useState<PengalokasianItem | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [karyawanRes, alokRes, komponenRes] = await Promise.all([
        fetch(`/api/karyawan/${idKaryawan}`),
        fetch(`/api/pengalokasian-gaji?id_karyawan=${idKaryawan}`),
        fetch("/api/komponen-gaji"),
      ]);

      const karyawanJson = await karyawanRes.json();
      const alokJson = await alokRes.json();
      const komponenJson = await komponenRes.json();

      setKaryawan(karyawanJson.data[0]);
      setAlokasi(alokJson.data ?? []);
      setKomponenList(komponenJson.data ?? []);
    } catch (err) {
      console.log(err);

      toast.error("Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idKaryawan) {
      fetchData();
    }
  }, [idKaryawan]);

  const pendapatan = alokasi.filter((a) => a.tipe === "pendapatan");

  const potongan = alokasi.filter((a) => a.tipe === "potongan");

  const totalPendapatan = pendapatan.reduce(
    (acc, item) => acc + Number(item.nominal),
    0,
  );

  const totalPotongan = potongan.reduce(
    (acc, item) => acc + Number(item.nominal),
    0,
  );

  const gajiBersih = totalPendapatan - totalPotongan;

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!karyawan) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-500">Data karyawan tidak ditemukan.</p>
      </div>
    );
  }

  const handleEdit = (item: PengalokasianItem) => {
    setEditData(item);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/pengalokasian-gaji/${deleteId}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message || "Gagal menghapus");

      toast.success("Berhasil dihapus");
      setDeleteId(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus");
    } finally {
      setDeleteLoading(false);
    }
  };
  return (
    <>
      <div className="p-6 space-y-5 text-black">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200"
          >
            <ArrowLeft size={15} />
          </button>

          <div className="flex-1">
            <h1 className="text-xl font-semibold">Detail Alokasi Gaji</h1>

            <p className="text-sm text-black">Kelola komponen gaji karyawan</p>
          </div>

          <button
            onClick={() => {
              setEditData(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 h-9 px-4 bg-emerald-500 text-white rounded-lg"
          >
            <Plus size={15} />
            Tambah
          </button>
        </div>

        {/* Info */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">{karyawan.nama}</p>

            <p className="text-sm text-black">{karyawan.nip}</p>

            <p className="text-xs text-black mt-1">
              {karyawan.nama_jabatan} • {karyawan.nama_departemen}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-black">Gaji Bersih</p>

            <p className="text-2xl font-bold text-black">
              {formatRupiah(gajiBersih)}
            </p>
          </div>
        </div>

        {/* Pendapatan */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
            <TrendingUp size={15} className="text-emerald-600" />

            <p className="text-sm font-medium">Pendapatan</p>
          </div>

          {pendapatan.map((item) => (
            <div
              key={item.id_pengalokasian_gaji}
              className="flex items-center justify-between px-4 py-3 border-b border-gray-50"
            >
              <div>
                <p className="text-sm">{item.nama_komponen_gaji}</p>

                {item.keterangan && (
                  <p className="text-xs text-black">{item.keterangan}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-emerald-600">
                  {formatRupiah(Number(item.nominal))}
                </p>

                <button
                  onClick={() => handleEdit(item)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Pencil size={15} />
                </button>

                <button
                  onClick={() => handleDelete(item.id_pengalokasian_gaji)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Potongan */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
            <TrendingDown size={15} className="text-red-500" />

            <p className="text-sm font-medium">Potongan</p>
          </div>

          {potongan.map((item) => (
            <div
              key={item.id_pengalokasian_gaji}
              className="flex items-center justify-between px-4 py-3 border-b border-gray-50"
            >
              <div>
                <p className="text-sm">{item.nama_komponen_gaji}</p>

                {item.keterangan && (
                  <p className="text-xs text-black">{item.keterangan}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-red-500">
                  {formatRupiah(Number(item.nominal))}
                </p>

                <button
                  onClick={() => handleEdit(item)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Pencil size={15} />
                </button>

                <button
                  onClick={() => handleDelete(item.id_pengalokasian_gaji)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-blue-500" />

            <p className="text-sm font-medium">Take Home Pay</p>
          </div>

          <p className="text-2xl font-bold">{formatRupiah(gajiBersih)}</p>
        </div>
      </div>

      <ModalKomponen
        isOpen={modalOpen}
        editData={editData}
        komponenList={komponenList}
        idKaryawan={idKaryawan}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        onSuccess={(msg) => {
          fetchData();
          toast.success(msg);
        }}
        onError={(msg) => {
          toast.error(msg);
        }}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <DeleteConfirmModal
        isOpen={!!deleteId}
        loading={deleteLoading}
        title="Hapus Komponen Gaji?"
        description="Komponen gaji yang dihapus tidak dapat dikembalikan."
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
