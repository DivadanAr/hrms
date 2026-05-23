"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCookie } from "@/context/cookie";

// ─── Types ────────────────────────────────────────────────────────────────────

type JenisIzin = "sakit" | "cuti" | "izin";
type StatusIzin = "pending" | "ditolak" | "diterima";

interface IzinData {
  id_izin: number;
  jenis_izin: JenisIzin;
  alasan: string | null;
  tanggal_pengajuan: string;
  tanggal_mulai: string;
  tanggal_berakhir: string;
  status: StatusIzin;
  approved_by_nama: string | null;
}

interface FormState {
  jenis_izin: JenisIzin;
  alasan: string;
  tanggal_mulai: string;
  tanggal_berakhir: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const JENIS_CONFIG: Record<
  JenisIzin,
  {
    label: string;
    emoji: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  sakit: {
    label: "Sakit",
    emoji: "🤒",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-400",
  },
  cuti: {
    label: "Cuti",
    emoji: "🏖️",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  izin: {
    label: "Izin",
    emoji: "📋",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
};

const STATUS_CONFIG: Record<
  StatusIzin,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  pending: {
    label: "Menunggu",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  ditolak: {
    label: "Ditolak",
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-400",
  },
  diterima: {
    label: "Diterima",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dt: string | null): string {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateInput(dt: string | null): string {
  if (!dt) return "";
  return new Date(dt).toISOString().split("T")[0];
}

function dayCount(start: string, end: string): number {
  const a = new Date(start);
  const b = new Date(end);
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000) + 1);
}

function canEdit(status: StatusIzin) {
  return status !== "diterima";
}

// ─── Badge Components ─────────────────────────────────────────────────────────

function JenisBadge({ jenis }: { jenis: JenisIzin }) {
  const c = JENIS_CONFIG[jenis];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function StatusBadge({ status }: { status: StatusIzin }) {
  const c = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${status === "pending" ? `${c.dot} animate-pulse` : c.dot}`}
      />
      {c.label}
    </span>
  );
}

// ─── Modal Wrapper ────────────────────────────────────────────────────────────

function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed z-9999 inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ animation: "modalUp 0.28s cubic-bezier(.34,1.56,.64,1) both" }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Form Fields ──────────────────────────────────────────────────────────────

function FormFields({
  form,
  onChange,
  disabled,
}: {
  form: FormState;
  onChange: (f: Partial<FormState>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Jenis Izin */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Jenis Izin <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["sakit", "cuti", "izin"] as JenisIzin[]).map((j) => {
            const c = JENIS_CONFIG[j];
            const selected = form.jenis_izin === j;
            return (
              <button
                key={j}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ jenis_izin: j })}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 text-xs font-bold transition-all
                  ${
                    selected
                      ? `${c.bg} ${c.text} ${c.border} scale-[1.03] shadow-sm`
                      : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span className="text-xl">{c.emoji}</span>
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tanggal */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Tanggal Mulai <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={form.tanggal_mulai}
            disabled={disabled}
            onChange={(e) => onChange({ tanggal_mulai: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-emerald-100 bg-emerald-50/50 text-sm font-semibold text-emerald-950
              focus:outline-none focus:border-emerald-500 focus:bg-white transition-all disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Tanggal Selesai <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={form.tanggal_berakhir}
            disabled={disabled}
            min={form.tanggal_mulai}
            onChange={(e) => onChange({ tanggal_berakhir: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-emerald-100 bg-emerald-50/50 text-sm font-semibold text-emerald-950
              focus:outline-none focus:border-emerald-500 focus:bg-white transition-all disabled:opacity-50"
          />
        </div>
      </div>

      {/* Durasi info */}
      {form.tanggal_mulai && form.tanggal_berakhir && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
          <svg
            className="w-4 h-4 text-emerald-500 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs font-bold text-emerald-700">
            Durasi: {dayCount(form.tanggal_mulai, form.tanggal_berakhir)} hari
          </span>
        </div>
      )}

      {/* Alasan */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Alasan / Keterangan
        </label>
        <textarea
          rows={3}
          placeholder="Tuliskan keterangan tambahan..."
          value={form.alasan}
          disabled={disabled}
          onChange={(e) => onChange({ alasan: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl border-2 border-emerald-100 bg-emerald-50/50 text-sm font-semibold text-emerald-950
            placeholder:text-slate-300 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none disabled:opacity-50"
        />
      </div>
    </div>
  );
}

// ─── Modal: Detail ─────────────────────────────────────────────────────────────

function ModalDetail({
  izin,
  onClose,
  onEdit,
  onDelete,
}: {
  izin: IzinData;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const jenis = JENIS_CONFIG[izin.jenis_izin];
  const status = STATUS_CONFIG[izin.status];
  const editable = canEdit(izin.status);
  const days = dayCount(izin.tanggal_mulai, izin.tanggal_berakhir);

  return (
    <Modal onClose={onClose}>
      {/* Header */}
      <div className={`px-6 pt-6 pb-5 rounded-t-3xl ${jenis.bg}`}>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-3xl">{jenis.emoji}</span>
            <h2 className={`text-lg font-black mt-1 ${jenis.text}`}>
              {jenis.label}
            </h2>
            <p className={`text-xs font-semibold opacity-70 ${jenis.text}`}>
              Diajukan {formatDate(izin.tanggal_pengajuan)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-slate-500 hover:bg-white transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <StatusBadge status={izin.status} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-4">
        {/* Tanggal row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Mulai
            </p>
            <p className="text-sm font-black text-slate-800">
              {formatDate(izin.tanggal_mulai)}
            </p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Selesai
            </p>
            <p className="text-sm font-black text-slate-800">
              {formatDate(izin.tanggal_berakhir)}
            </p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
              Durasi
            </p>
            <p className="text-sm font-black text-emerald-800">{days} Hari</p>
          </div>
        </div>

        {/* Alasan */}
        {izin.alasan && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Alasan
            </p>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              {izin.alasan}
            </p>
          </div>
        )}

        {/* Approved by */}
        {izin.status === "diterima" && izin.approved_by_nama && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-200 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-emerald-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                Disetujui oleh
              </p>
              <p className="text-sm font-black text-emerald-800">
                {izin.approved_by_nama}
              </p>
            </div>
          </div>
        )}

        {/* Not editable notice */}
        {!editable && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
            <svg
              className="w-4 h-4 text-emerald-500 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-xs font-semibold text-emerald-700">
              Izin yang sudah diterima tidak dapat diubah
            </p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      {editable && (
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onDelete}
            className="flex-1 py-3 rounded-2xl border-2 border-red-100 bg-red-50 text-red-600 text-sm font-black uppercase tracking-wider
              flex items-center justify-center gap-2 hover:bg-red-100 transition-all active:scale-[0.98]"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Hapus
          </button>
          <button
            onClick={onEdit}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-black uppercase tracking-wider
              flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
        </div>
      )}
    </Modal>
  );
}

// ─── Modal: Form (Add / Edit) ─────────────────────────────────────────────────

function ModalForm({
  mode,
  initial,
  onClose,
  onSuccess,
}: {
  mode: "add" | "edit";
  initial?: IzinData;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<FormState>({
    jenis_izin: initial?.jenis_izin ?? "izin",
    alasan: initial?.alasan ?? "",
    tanggal_mulai: initial ? formatDateInput(initial.tanggal_mulai) : "",
    tanggal_berakhir: initial ? formatDateInput(initial.tanggal_berakhir) : "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.tanggal_mulai || !form.tanggal_berakhir) {
      setError("Tanggal mulai dan selesai wajib diisi");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const url =
        mode === "add"
          ? "/api/mobile/izin"
          : `/api/mobile/izin/${initial!.id_izin}`;
      const method = mode === "add" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || "Terjadi kesalahan");
      }
    } catch {
      setError("Koneksi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-emerald-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-emerald-950">
              {mode === "add" ? "Buat Pengajuan Izin" : "Edit Pengajuan Izin"}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {mode === "add"
                ? "Isi form berikut untuk mengajukan izin"
                : "Ubah data izin Anda"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 py-5">
        <FormFields
          form={form}
          onChange={(f) => setForm((prev) => ({ ...prev, ...f }))}
        />
        {error && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">
            <svg
              className="w-4 h-4 text-red-500 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xs font-semibold text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-500 text-sm font-black uppercase tracking-wider hover:bg-slate-100 transition-all active:scale-[0.98]"
        >
          Batal
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-black uppercase tracking-wider
            shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Menyimpan...
            </>
          ) : mode === "add" ? (
            "Kirim Pengajuan"
          ) : (
            "Simpan Perubahan"
          )}
        </button>
      </div>
    </Modal>
  );
}

// ─── Modal: Konfirmasi Hapus ──────────────────────────────────────────────────

function ModalDelete({
  izin,
  onClose,
  onSuccess,
}: {
  izin: IzinData;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/mobile/izin/${izin.id_izin}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
        onClose();
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="px-6 py-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>
        <h2 className="text-lg font-black text-slate-900 mb-2">
          Hapus Pengajuan?
        </h2>
        <p className="text-sm text-slate-400 font-medium mb-1">
          Pengajuan{" "}
          <span className="font-bold text-slate-600">
            {JENIS_CONFIG[izin.jenis_izin].label}
          </span>{" "}
          pada
        </p>
        <p className="text-sm font-bold text-slate-700 mb-6">
          {formatDate(izin.tanggal_mulai)} — {formatDate(izin.tanggal_berakhir)}
        </p>
        <p className="text-xs text-slate-400 mb-6">
          Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-500 text-sm font-black uppercase tracking-wider hover:bg-slate-100 transition-all"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white text-sm font-black uppercase tracking-wider
              shadow-lg shadow-red-200 hover:bg-red-600 transition-all active:scale-[0.98] disabled:opacity-60
              flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Hapus"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Izin Card ─────────────────────────────────────────────────────────────────

function IzinCard({ izin, onClick }: { izin: IzinData; onClick: () => void }) {
  const jenis = JENIS_CONFIG[izin.jenis_izin];
  const days = dayCount(izin.tanggal_mulai, izin.tanggal_berakhir);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100
        transition-all active:scale-[0.99] overflow-hidden group"
    >
      {/* Left accent bar */}
      <div className="flex">
        <div
          className={`w-1.5 shrink-0 ${izin.status === "diterima" ? "bg-emerald-400" : izin.status === "ditolak" ? "bg-red-300" : "bg-amber-300"}`}
        />

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-3">
            {/* Left */}
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl ${jenis.bg} flex items-center justify-center text-xl shrink-0`}
              >
                {jenis.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <JenisBadge jenis={izin.jenis_izin} />
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {formatDate(izin.tanggal_mulai)} —{" "}
                  {formatDate(izin.tanggal_berakhir)}
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <StatusBadge status={izin.status} />
              <span className="text-xs font-bold text-slate-400">
                {days} hari
              </span>
            </div>
          </div>

          {/* Alasan preview */}
          {izin.alasan && (
            <p className="mt-3 text-xs text-slate-400 font-medium line-clamp-1 pl-14">
              {izin.alasan}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-slate-100 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-20 rounded-full bg-slate-100" />
          <div className="h-3 w-36 rounded-full bg-slate-100" />
        </div>
        <div className="h-5 w-16 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ModalState =
  | { type: "none" }
  | { type: "detail"; izin: IzinData }
  | { type: "add" }
  | { type: "edit"; izin: IzinData }
  | { type: "delete"; izin: IzinData };

export default function IzinPage() {
  const [izinList, setIzinList] = useState<IzinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [filter, setFilter] = useState<StatusIzin | "all">("all");

  const fetchIzin = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/mobile/izin");
      const json = await res.json();
      if (json.success) setIzinList(json.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIzin();
  }, [fetchIzin]);

  const filtered =
    filter === "all" ? izinList : izinList.filter((i) => i.status === filter);

  // Summary counts
  const counts = {
    pending: izinList.filter((i) => i.status === "pending").length,
    diterima: izinList.filter((i) => i.status === "diterima").length,
    ditolak: izinList.filter((i) => i.status === "ditolak").length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes modalUp {
          from { opacity:0; transform:translateY(40px) scale(.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .a1 { animation: fadeIn .4s ease both; }
        .a2 { animation: fadeIn .4s .07s ease both; }
        .a3 { animation: fadeIn .4s .14s ease both; }
        .dot-bg {
          background-image: radial-gradient(circle, #d1fae5 1px, transparent 1px);
          background-size: 26px 26px;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dot-bg pb-28">
        {/* ── Header ── */}
        <header className="a1 sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-emerald-100 px-5 py-4">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-200">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest leading-none">
                Riwayat
              </p>
              <h1 className="text-sm font-black text-emerald-950 leading-tight">
                Pengajuan Izin
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-5 py-6 space-y-5">
          {/* ── Summary Cards ── */}
          <div className="a1 grid grid-cols-3 gap-3">
            {[
              {
                label: "Menunggu",
                count: counts.pending,
                bg: "bg-amber-50",
                text: "text-amber-800",
                border: "border-amber-100",
                num: "text-amber-700",
              },
              {
                label: "Diterima",
                count: counts.diterima,
                bg: "bg-emerald-50",
                text: "text-emerald-800",
                border: "border-emerald-100",
                num: "text-emerald-700",
              },
              {
                label: "Ditolak",
                count: counts.ditolak,
                bg: "bg-red-50",
                text: "text-red-800",
                border: "border-red-100",
                num: "text-red-600",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`${s.bg} ${s.border} border rounded-2xl p-3 text-center`}
              >
                <p className={`text-2xl font-black ${s.num}`}>
                  {loading ? "—" : s.count}
                </p>
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${s.text} opacity-70 mt-0.5`}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* ── Filter Tabs ── */}
          <div className="a2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(["all", "pending", "diterima", "ditolak"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                  ${
                    filter === f
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                      : "bg-white border border-slate-200 text-slate-500 hover:border-emerald-200 hover:text-emerald-600"
                  }`}
              >
                {f === "all" ? "Semua" : STATUS_CONFIG[f].label}
              </button>
            ))}
          </div>

          {/* ── List ── */}
          <div className="a3 space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-sm font-bold text-slate-400">
                  {filter === "all"
                    ? "Belum ada pengajuan izin"
                    : `Tidak ada izin dengan status "${STATUS_CONFIG[filter as StatusIzin]?.label}"`}
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Tekan tombol + untuk membuat pengajuan baru
                </p>
              </div>
            ) : (
              filtered.map((izin) => (
                <IzinCard
                  key={izin.id_izin}
                  izin={izin}
                  onClick={() => setModal({ type: "detail", izin })}
                />
              ))
            )}
          </div>
        </main>

        {/* ── FAB ── */}
        <button
          onClick={() => setModal({ type: "add" })}
          className="fixed bottom-25 right-8 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600
            text-white shadow-2xl shadow-emerald-300 hover:shadow-emerald-400 hover:scale-110 active:scale-95
            flex items-center justify-center transition-all duration-200"
          aria-label="Buat pengajuan izin baru"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      {/* ── Modals ── */}

      {modal.type === "detail" && (
        <ModalDetail
          izin={modal.izin}
          onClose={() => setModal({ type: "none" })}
          onEdit={() => setModal({ type: "edit", izin: modal.izin })}
          onDelete={() => setModal({ type: "delete", izin: modal.izin })}
        />
      )}

      {modal.type === "add" && (
        <ModalForm
          mode="add"
          onClose={() => setModal({ type: "none" })}
          onSuccess={fetchIzin}
        />
      )}

      {modal.type === "edit" && (
        <ModalForm
          mode="edit"
          initial={modal.izin}
          onClose={() => setModal({ type: "none" })}
          onSuccess={fetchIzin}
        />
      )}

      {modal.type === "delete" && (
        <ModalDelete
          izin={modal.izin}
          onClose={() => setModal({ type: "none" })}
          onSuccess={fetchIzin}
        />
      )}
    </>
  );
}
