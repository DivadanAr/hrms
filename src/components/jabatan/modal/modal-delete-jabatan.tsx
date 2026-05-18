"use client";

import { useState } from "react";
import { X, Trash2, Loader2, AlertTriangle } from "lucide-react";

type JabatanType = {
  id_jabatan: number;
  nama_jabatan: string;
  keterangan: string | null;
};

type Props = {
  isOpen: boolean;
  data: JabatanType | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

export default function ModalDeleteJabatan({
  isOpen,
  data,
  onClose,
  onSuccess,
  onError,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/jabatan/${data?.id_jabatan}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        console.log(result);
        onError(result.message);
      } else {
        onClose();
        onSuccess(`jabatan "${data?.nama_jabatan}" berhasil dihapus.`);
      }
    } catch {
      onError("Gagal menghapus jabatan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  if (!isOpen || !data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-sm mx-4 bg-white rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <Trash2 size={15} className="text-red-500" />
            </div>
            <h2 className="text-sm font-medium text-gray-900">Hapus jabatan</h2>
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
        <div className="px-5 py-5 space-y-3">
          {/* Warning box */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
            <AlertTriangle
              size={16}
              className="text-red-500 flex-shrink-0 mt-0.5"
            />
            <p className="text-xs text-red-600 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Data yang dihapus tidak bisa
              dikembalikan.
            </p>
          </div>

          {/* Info jabatan */}
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 space-y-1">
            <p className="text-xs text-gray-400">jabatan yang akan dihapus:</p>
            <p className="text-sm font-medium text-gray-800">
              {data.nama_jabatan}
            </p>
            {data.keterangan && (
              <p className="text-xs text-gray-500">{data.keterangan}</p>
            )}
          </div>

          <p className="text-sm text-gray-600">
            Apakah kamu yakin ingin menghapus jabatan ini?
          </p>
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
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium text-white bg-red-500 hover:bg-red-600 active:scale-95 rounded-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Ya, Hapus
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
