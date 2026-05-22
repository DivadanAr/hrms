"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CircleDollarSign,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

type KomponenGajiType = {
  id_komponen_gaji: number;
  nama_komponen_gaji: string;
  keterangan: string | null;
  tipe: "pendapatan" | "potongan";
};

// ─── Modal Tambah ────────────────────────────────────────────────────────────
export default function ModalTambahKomponen({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    nama_komponen_gaji: "",
    keterangan: "",
    tipe: "" as "pendapatan" | "potongan" | "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = form.nama_komponen_gaji.trim() !== "" && form.tipe !== "";

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/komponen-gaji", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_komponen_gaji: form.nama_komponen_gaji.trim(),
          keterangan: form.keterangan.trim() || null,
          tipe: form.tipe,
        }),
      });

      const result = await res.json();

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.message ?? "Terjadi kesalahan");
      }
    } catch (e) {
      setError("Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CircleDollarSign size={18} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Tambah Komponen Gaji
              </h2>
              <p className="text-xs text-gray-400">Isi data komponen baru</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Nama Komponen */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Nama Komponen <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="cth: Tunjangan Kehadiran"
              value={form.nama_komponen_gaji}
              onChange={(e) =>
                setForm((f) => ({ ...f, nama_komponen_gaji: e.target.value }))
              }
              className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>

          {/* Tipe */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Tipe <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["pendapatan", "potongan"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, tipe: t }))}
                  className={`h-11 rounded-xl border text-sm font-medium capitalize transition-all ${
                    form.tipe === t
                      ? t === "pendapatan"
                        ? "bg-emerald-50 border-emerald-400 text-emerald-700 ring-2 ring-emerald-100"
                        : "bg-red-50 border-red-400 text-red-700 ring-2 ring-red-100"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {t === "pendapatan" ? "➕ Pendapatan" : "➖ Potongan"}
                </button>
              ))}
            </div>
          </div>

          {/* Keterangan */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Keterangan{" "}
              <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <textarea
              placeholder="Deskripsi singkat komponen gaji ini..."
              value={form.keterangan}
              onChange={(e) =>
                setForm((f) => ({ ...f, keterangan: e.target.value }))
              }
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              <span className="text-base">⚠️</span>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-10 px-5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="h-10 px-5 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Plus size={15} />
                Simpan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
