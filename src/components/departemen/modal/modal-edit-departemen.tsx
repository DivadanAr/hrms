"use client";

import { useEffect, useState } from "react";
import { X, Pencil, Loader2 } from "lucide-react";

type DepartemenType = {
  id_departemen: number;
  nama_departemen: string;
  keterangan: string | null;
};

type Props = {
  isOpen: boolean;
  data: DepartemenType | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

export default function ModalEditDepartemen({
  isOpen,
  data,
  onClose,
  onSuccess,
  onError,
}: Props) {
  const [form, setForm] = useState({ nama_departemen: "", keterangan: "" });
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState("");

  // Sync form saat data berubah
  useEffect(() => {
    if (data) {
      setForm({
        nama_departemen: data.nama_departemen,
        keterangan: data.keterangan ?? "",
      });
    }
  }, [data]);

  const handleSubmit = async () => {
    if (!form.nama_departemen.trim()) {
      setFieldError("Nama departemen wajib diisi.");
      return;
    }

    setFieldError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/departemen/${data?.id_departemen}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      handleClose();
      onSuccess("Departemen berhasil diperbarui.");
    } catch {
      onError("Gagal memperbarui departemen. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setFieldError("");
    onClose();
  };

  if (!isOpen || !data) return null;

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
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Pencil size={15} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-900">
                Edit Departemen
              </h2>
              <p className="text-xs text-gray-400">
                Perbarui informasi departemen
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
              Nama Departemen <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: IT Development"
              value={form.nama_departemen}
              onChange={(e) => {
                setForm((f) => ({ ...f, nama_departemen: e.target.value }));
                if (fieldError) setFieldError("");
              }}
              disabled={loading}
              className={`w-full h-9 px-3 text-sm rounded-lg border outline-none transition-colors bg-white text-gray-800 placeholder-gray-400
                disabled:opacity-60 disabled:cursor-not-allowed
                ${fieldError ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-blue-400"}`}
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
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-blue-400 outline-none transition-colors bg-white text-gray-800 placeholder-gray-400 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
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
            className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 active:scale-95 rounded-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
