"use client";

import { X, AlertTriangle } from "lucide-react";

type Props = {
  isOpen: boolean;
  loading?: boolean;
  title?: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteConfirmModal({
  isOpen,
  loading,
  title = "Hapus Data?",
  description = "Data yang dihapus tidak dapat dikembalikan.",
  onCancel,
  onConfirm,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50">
              <AlertTriangle size={14} className="text-red-500" />
            </div>

            <h2 className="text-sm font-semibold text-black">{title}</h2>
          </div>

          <button
            onClick={onCancel}
            disabled={loading}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-sm text-black/70">{description}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t">
          <button
            onClick={onCancel}
            disabled={loading}
            className="h-9 px-4 text-sm border rounded-lg"
          >
            Batal
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="h-9 px-4 text-sm text-white bg-red-500 rounded-lg"
          >
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
