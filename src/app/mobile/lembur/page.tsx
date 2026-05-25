"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusLembur = "pending" | "ditolak" | "diterima";

interface LemburData {
  id_lembur: number;
  id_karyawan: number;
  tanggal: string;
  total_jam_lembur: number;
  keterangan: string | null;
  status: StatusLembur;
  nama_karyawan: string | null;
  approved_by: string | null; // email approver
}

interface FormState {
  tanggal: string;
  total_jam_lembur: number | "";
  keterangan: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  StatusLembur,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
    barColor: string;
  }
> = {
  pending: {
    label: "Menunggu",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
    barColor: "bg-amber-300",
  },
  ditolak: {
    label: "Ditolak",
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-400",
    barColor: "bg-red-300",
  },
  diterima: {
    label: "Diterima",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    barColor: "bg-emerald-400",
  },
};

const BULAN_LABEL = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Ags",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNowYYYYMM(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
}

function formatDate(dt: string): string {
  return new Date(dt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateInput(dt: string): string {
  return new Date(dt).toISOString().split("T")[0];
}

function formatBulanLabel(yyyymm: string): string {
  const [y, m] = yyyymm.split("-");
  return `${BULAN_LABEL[Number(m) - 1]} ${y}`;
}

function getDayName(dt: string): string {
  return new Date(dt).toLocaleDateString("id-ID", { weekday: "short" });
}

function getDayNum(dt: string): number {
  return new Date(dt).getDate();
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-9999 inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ animation: "modalUp .28s cubic-bezier(.34,1.56,.64,1) both" }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: StatusLembur }) {
  const c = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${status === "pending" ? `${c.dot} animate-pulse` : c.dot}`}
      />
      {c.label}
    </span>
  );
}

// ─── Jam Picker ───────────────────────────────────────────────────────────────

function JamPicker({
  value,
  onChange,
  disabled,
}: {
  value: number | "";
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 24].map((j) => (
        <button
          key={j}
          type="button"
          disabled={disabled}
          onClick={() => onChange(j)}
          className={`py-2.5 rounded-xl text-sm font-black transition-all border-2
            ${
              value === j
                ? "bg-emerald-600 text-white border-emerald-600 scale-105 shadow-md shadow-emerald-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-100 hover:border-emerald-300"
            } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          {j}
        </button>
      ))}
    </div>
  );
}

// ─── Modal Form ───────────────────────────────────────────────────────────────

function ModalForm({
  mode,
  initial,
  onClose,
  onSuccess,
}: {
  mode: "add" | "edit";
  initial?: LemburData;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState<FormState>({
    tanggal: initial ? formatDateInput(initial.tanggal) : today,
    total_jam_lembur: initial?.total_jam_lembur ?? "",
    keterangan: initial?.keterangan ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  const handleSubmit = async () => {
    if (!form.tanggal || form.total_jam_lembur === "") {
      setError("Tanggal dan jumlah jam wajib diisi");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const url =
        mode === "add"
          ? "/api/mobile/lembur"
          : `/api/mobile/lembur/${initial!.id_lembur}`;
      const res = await fetch(url, {
        method: mode === "add" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else setError(data.message || "Terjadi kesalahan");
    } catch {
      setError("Koneksi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-emerald-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-emerald-950">
            {mode === "add" ? "Pengajuan Lembur" : "Edit Lembur"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {mode === "add"
              ? "Isi detail lembur Anda"
              : "Perbarui data pengajuan lembur"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all"
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

      <div className="px-6 py-5 space-y-5">
        {/* Tanggal */}
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
            Tanggal Lembur <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-emerald-400"
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
            </div>
            <input
              type="date"
              value={form.tanggal}
              max={today}
              onChange={(e) => set({ tanggal: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-emerald-100 bg-emerald-50/50
                text-sm font-bold text-emerald-950 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Jam */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Jumlah Jam Lembur <span className="text-red-400">*</span>
            </label>
            {form.total_jam_lembur !== "" && (
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {form.total_jam_lembur} jam
              </span>
            )}
          </div>
          <JamPicker
            value={form.total_jam_lembur}
            onChange={(v) => set({ total_jam_lembur: v })}
          />
          <p className="text-[10px] text-slate-400 mt-2 font-medium">
            Ketuk angka untuk memilih durasi lembur
          </p>
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
            Keterangan
          </label>
          <textarea
            rows={3}
            placeholder="Tuliskan pekerjaan yang dilakukan saat lembur..."
            value={form.keterangan}
            onChange={(e) => set({ keterangan: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-emerald-100 bg-emerald-50/50 text-sm font-semibold
              text-emerald-950 placeholder:text-slate-300 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">
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
            shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-60
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
            "Simpan"
          )}
        </button>
      </div>
    </Modal>
  );
}

// ─── Modal Detail ─────────────────────────────────────────────────────────────

function ModalDetail({
  lembur,
  onClose,
  onEdit,
  onDelete,
}: {
  lembur: LemburData;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const canEdit = lembur.status !== "diterima";
  const sc = STATUS_CONFIG[lembur.status];

  return (
    <Modal onClose={onClose}>
      {/* Header */}
      <div className="relative px-6 pt-6 mb-10 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-t-3xl overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">
              Detail Lembur
            </p>
            <h2 className="text-white text-2xl font-black">
              {formatDate(lembur.tanggal)}
            </h2>
            <p className="text-emerald-200 text-sm font-semibold mt-0.5">
              {getDayName(lembur.tanggal)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all"
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

        {/* Big jam display */}
        <div className="relative mt-4 flex items-end gap-2">
          <span className="text-6xl font-black text-white leading-none">
            {lembur.total_jam_lembur}
          </span>
          <span className="text-emerald-200 text-lg font-bold mb-1">
            jam lembur
          </span>
        </div>
      </div>

      {/* Status float card */}
      <div className="mx-6 -mt-6 mb-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100 px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Status
          </span>
          <StatusBadge status={lembur.status} />
        </div>
      </div>

      <div className="px-6 space-y-4 pb-2">
        {/* Keterangan */}
        {lembur.keterangan && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
              Keterangan
            </p>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              {lembur.keterangan}
            </p>
          </div>
        )}

        {/* Approved by */}
        {lembur.status === "diterima" && lembur.approved_by && (
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
                {lembur.approved_by}
              </p>
            </div>
          </div>
        )}

        {!canEdit && (
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
              Lembur yang sudah diterima tidak dapat diubah
            </p>
          </div>
        )}
      </div>

      {canEdit && (
        <div className="px-6 py-5 flex gap-3">
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

// ─── Modal Delete ─────────────────────────────────────────────────────────────

function ModalDelete({
  lembur,
  onClose,
  onSuccess,
}: {
  lembur: LemburData;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try {
      await fetch(`/api/mobile/lembur/${lembur.id_lembur}`, {
        method: "DELETE",
      });
      onSuccess();
      onClose();
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
        <p className="text-sm text-slate-400 mb-1">
          Lembur tanggal{" "}
          <span className="font-bold text-slate-700">
            {formatDate(lembur.tanggal)}
          </span>
        </p>
        <p className="text-sm text-slate-400 mb-6">
          sebanyak{" "}
          <span className="font-bold text-emerald-700">
            {lembur.total_jam_lembur} jam
          </span>{" "}
          akan dihapus.
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
            onClick={handle}
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

// ─── Lembur Card ──────────────────────────────────────────────────────────────

function LemburCard({
  lembur,
  onClick,
}: {
  lembur: LemburData;
  onClick: () => void;
}) {
  const sc = STATUS_CONFIG[lembur.status];

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-3xl border border-slate-100 shadow-sm
        hover:shadow-md hover:border-emerald-100 transition-all active:scale-[0.99] overflow-hidden"
    >
      <div className="flex">
        {/* Accent bar */}
        <div className={`w-1.5 shrink-0 ${sc.barColor}`} />

        <div className="flex-1 p-4">
          <div className="flex items-start gap-3">
            {/* Date box */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex flex-col items-center justify-center text-white shrink-0 shadow-md shadow-emerald-200">
              <span className="text-xl font-black leading-none">
                {getDayNum(lembur.tanggal)}
              </span>
              <span className="text-[10px] font-bold opacity-80 uppercase">
                {getDayName(lembur.tanggal)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base font-black text-slate-900 leading-tight">
                  {lembur.total_jam_lembur}{" "}
                  <span className="text-xs font-bold text-slate-400">jam</span>
                </p>
                <StatusBadge status={lembur.status} />
              </div>

              {lembur.keterangan && (
                <p className="mt-1.5 text-xs text-slate-400 font-medium line-clamp-1">
                  {lembur.keterangan}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-4 animate-pulse flex gap-3">
      <div className="w-14 h-14 rounded-2xl bg-emerald-100 shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="flex justify-between">
          <div className="h-4 w-20 rounded-full bg-slate-100" />
          <div className="h-5 w-16 rounded-full bg-slate-100" />
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 w-3/4" />
        <div className="h-3 w-28 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ModalState =
  | { type: "none" }
  | { type: "detail"; lembur: LemburData }
  | { type: "add" }
  | { type: "edit"; lembur: LemburData }
  | { type: "delete"; lembur: LemburData };

export default function LemburPage() {
  const [list, setList] = useState<LemburData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [bulan, setBulan] = useState(getNowYYYYMM());
  const [filterStatus, setFilterStatus] = useState<StatusLembur | "all">("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/mobile/lembur?bulan=${bulan}`);
      const json = await res.json();
      if (json.success) setList(json.data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [bulan]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Month nav
  const shiftMonth = (delta: number) => {
    const [y, m] = bulan.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (next <= getNowYYYYMM()) setBulan(next);
  };

  const filtered =
    filterStatus === "all"
      ? list
      : list.filter((l) => l.status === filterStatus);

  // Summary
  const totalJam = list.reduce((s, l) => s + l.total_jam_lembur, 0);
  const counts = {
    pending: list.filter((l) => l.status === "pending").length,
    diterima: list.filter((l) => l.status === "diterima").length,
    ditolak: list.filter((l) => l.status === "ditolak").length,
  };
  const jamDiterima = list
    .filter((l) => l.status === "diterima")
    .reduce((s, l) => s + l.total_jam_lembur, 0);

  const isCurrentMonth = bulan === getNowYYYYMM();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *{font-family:'Plus Jakarta Sans',sans-serif;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes modalUp{from{opacity:0;transform:translateY(40px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        .a1{animation:fadeIn .4s ease both}
        .a2{animation:fadeIn .4s .07s ease both}
        .a3{animation:fadeIn .4s .14s ease both}
        .a4{animation:fadeIn .4s .21s ease both}
        .dot-bg{background-image:radial-gradient(circle,#d1fae5 1px,transparent 1px);background-size:26px 26px}
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .line-clamp-1{overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest leading-none">
                Riwayat
              </p>
              <h1 className="text-sm font-black text-emerald-950 leading-tight">
                Lembur Karyawan
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-5 py-6 space-y-5">
          {/* ── Month Selector ── */}
          <div className="a1 flex items-center justify-between bg-white rounded-2xl border border-emerald-100 shadow-sm px-4 py-3">
            <button
              onClick={() => shiftMonth(-1)}
              className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-all active:scale-95"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="text-center">
              <p className="text-base font-black text-emerald-950">
                {formatBulanLabel(bulan)}
              </p>
              {isCurrentMonth && (
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                  Bulan Ini
                </p>
              )}
            </div>
            <button
              onClick={() => shiftMonth(1)}
              disabled={isCurrentMonth}
              className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600
                hover:bg-emerald-100 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* ── Hero Stats Card ── */}
          <div className="a2 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-5 relative overflow-hidden shadow-xl shadow-emerald-200">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle,#fff 1px,transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />
            <div className="relative">
              <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">
                Total Jam Lembur
              </p>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-5xl font-black text-white leading-none">
                  {loading ? "—" : totalJam}
                </span>
                <span className="text-emerald-200 font-bold mb-1">jam</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Diterima", val: jamDiterima, unit: "jam" },
                  { label: "Pengajuan", val: counts.pending, unit: "pending" },
                  { label: "Sesi", val: list.length, unit: "lembur" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white/10 rounded-2xl px-3 py-2.5 text-center"
                  >
                    <p className="text-white text-lg font-black leading-none">
                      {loading ? "—" : s.val}
                    </p>
                    <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                      {s.unit}
                    </p>
                    <p className="text-emerald-300/70 text-[9px] font-semibold">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Summary mini cards ── */}
          <div className="a3 grid grid-cols-3 gap-3">
            {(
              [
                {
                  key: "pending",
                  ...STATUS_CONFIG.pending,
                  label: "Menunggu",
                  count: counts.pending,
                },
                {
                  key: "diterima",
                  ...STATUS_CONFIG.diterima,
                  label: "Diterima",
                  count: counts.diterima,
                },
                {
                  key: "ditolak",
                  ...STATUS_CONFIG.ditolak,
                  label: "Ditolak",
                  count: counts.ditolak,
                },
              ] as const
            ).map((s) => (
              <div
                key={s.key}
                className={`${s.bg} ${s.border} border rounded-2xl p-3 text-center`}
              >
                <p className={`text-2xl font-black ${s.text}`}>
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
          <div className="a3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(["all", "pending", "diterima", "ditolak"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                  ${
                    filterStatus === f
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                      : "bg-white border border-slate-200 text-slate-500 hover:border-emerald-200 hover:text-emerald-600"
                  }`}
              >
                {f === "all" ? "Semua" : STATUS_CONFIG[f].label}
              </button>
            ))}
          </div>

          {/* ── List ── */}
          <div className="a4 space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center">
                <div className="text-4xl mb-3">⏰</div>
                <p className="text-sm font-bold text-slate-400">
                  {filterStatus === "all"
                    ? `Belum ada lembur di ${formatBulanLabel(bulan)}`
                    : `Tidak ada lembur "${STATUS_CONFIG[filterStatus as StatusLembur]?.label}"`}
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Tekan tombol + untuk menambah pengajuan
                </p>
              </div>
            ) : (
              filtered.map((l) => (
                <LemburCard
                  key={l.id_lembur}
                  lembur={l}
                  onClick={() => setModal({ type: "detail", lembur: l })}
                />
              ))
            )}
          </div>
        </main>

        {/* ── FAB ── */}
        <button
          onClick={() => setModal({ type: "add" })}
          className="fixed bottom-25 right-8 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600
            text-white shadow-2xl shadow-emerald-300 hover:scale-110 active:scale-95 flex items-center justify-center transition-all duration-200"
          aria-label="Tambah pengajuan lembur"
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
          lembur={modal.lembur}
          onClose={() => setModal({ type: "none" })}
          onEdit={() => setModal({ type: "edit", lembur: modal.lembur })}
          onDelete={() => setModal({ type: "delete", lembur: modal.lembur })}
        />
      )}
      {modal.type === "add" && (
        <ModalForm
          mode="add"
          onClose={() => setModal({ type: "none" })}
          onSuccess={fetchData}
        />
      )}
      {modal.type === "edit" && (
        <ModalForm
          mode="edit"
          initial={modal.lembur}
          onClose={() => setModal({ type: "none" })}
          onSuccess={fetchData}
        />
      )}
      {modal.type === "delete" && (
        <ModalDelete
          lembur={modal.lembur}
          onClose={() => setModal({ type: "none" })}
          onSuccess={fetchData}
        />
      )}
    </>
  );
}
