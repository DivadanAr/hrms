"use client";

import { useState } from "react";
import { X, Building2, Loader2 } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

export default function ModalTambahJabatan({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: Props) {
  const [form, setForm] = useState({ nama_jabatan: "", keterangan: "" });
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState("");

  const handleSubmit = async () => {
    if (!form.nama_jabatan.trim()) {
      setFieldError("Nama jabatan wajib diisi.");
      return;
    }

    setFieldError("");
    setLoading(true);

    try {
      const res = await fetch("/api/jabatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      handleClose();
      onSuccess("jabatan berhasil ditambahkan.");
    } catch {
      onError("Gagal menambahkan jabatan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setForm({ nama_jabatan: "", keterangan: "" });
    setFieldError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Building2 size={16} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-900">
                Tambah jabatan
              </h2>
              <p className="text-xs text-gray-400">
                Isi form berikut untuk menambah jabatan baru
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">
              Nama jabatan <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: IT Development"
              value={form.nama_jabatan}
              onChange={(e) => {
                setForm((f) => ({ ...f, nama_jabatan: e.target.value }));
                if (fieldError) setFieldError("");
              }}
              disabled={loading}
              className={`w-full h-9 px-3 text-sm rounded-lg border outline-none transition-colors bg-white text-gray-800 placeholder-gray-400
                disabled:opacity-60 disabled:cursor-not-allowed
                ${fieldError ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-emerald-400"}`}
            />
            {fieldError && (
              <p className="text-[11px] text-red-500">{fieldError}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">
              Keterangan{" "}
              <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <textarea
              placeholder="Contoh: Divisi pengembangan sistem dan teknologi"
              value={form.keterangan}
              onChange={(e) =>
                setForm((f) => ({ ...f, keterangan: e.target.value }))
              }
              disabled={loading}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-emerald-400 outline-none transition-colors bg-white text-gray-800 placeholder-gray-400 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button
            onClick={handleClose}
            disabled={loading}
            className="h-9 px-4 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 active:scale-95 transition-all duration-150 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 active:scale-95 rounded-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
