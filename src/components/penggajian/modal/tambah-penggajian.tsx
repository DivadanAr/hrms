"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, X, Users } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type KaryawanOption = {
  id_karyawan: number;
  nama: string;
  nip: string;
  nama_jabatan: string | null;
  nama_departemen: string | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Generate periode options: 1 tahun kebelakang s/d 1 tahun kedepan */
function getPeriodeOptions() {
  const options: string[] = [];
  const now = new Date();
  // 12 bulan kebelakang → bulan ini → 12 bulan kedepan
  for (let i = -12; i <= 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    options.push(`${yyyy}-${mm}`);
  }
  return options;
}

function currentPeriode() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function formatPeriode(periode: string) {
  if (!periode) return "-";
  const [yyyy, mm] = periode.split("-");
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return `${months[Number(mm) - 1]} ${yyyy}`;
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
};

export default function ModalTambahPenggajian({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: Props) {
  const periodeOptions = getPeriodeOptions();

  const [periode, setPeriode] = useState(currentPeriode());
  const [idKaryawan, setIdKaryawan] = useState("");

  // karyawan yang belum punya penggajian di periode ini
  const [karyawanList, setKaryawanList] = useState<KaryawanOption[]>([]);
  const [loadingKaryawan, setLoadingKaryawan] = useState(false);

  // preview nominal dari alokasi
  const [preview, setPreview] = useState<{
    pendapatan: number;
    potongan: number;
    bersih: number;
  } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // ── Reset saat modal dibuka/ditutup ──────────────────────────────────────

  useEffect(() => {
    if (!isOpen) {
      setPeriode(currentPeriode());
      setIdKaryawan("");
      setKaryawanList([]);
      setPreview(null);
    }
  }, [isOpen]);

  // ── Fetch karyawan yang belum digaji saat periode berubah ─────────────────

  useEffect(() => {
    if (!isOpen) return;

    const fetchKaryawan = async () => {
      setLoadingKaryawan(true);
      setIdKaryawan("");
      setPreview(null);
      try {
        // Ambil semua karyawan aktif
        const [allRes, gajiRes] = await Promise.all([
          fetch("/api/karyawan?status=aktif"),
          fetch(`/api/penggajian?periode=${periode}`),
        ]);

        const allJson = await allRes.json();
        const gajiJson = await gajiRes.json();

        const semuaKaryawan: KaryawanOption[] = allJson.data ?? [];
        const sudahDigaji: number[] = (gajiJson.data ?? []).map(
          (g: any) => g.id_karyawan,
        );

        // Filter: tampilkan hanya yang belum punya penggajian di periode ini
        const belum = semuaKaryawan.filter(
          (k) => !sudahDigaji.includes(k.id_karyawan),
        );

        setKaryawanList(belum);
      } catch {
        onError("Gagal memuat daftar karyawan.");
      } finally {
        setLoadingKaryawan(false);
      }
    };

    fetchKaryawan();
  }, [periode, isOpen]);

  // ── Fetch preview nominal saat karyawan berubah ───────────────────────────

  useEffect(() => {
    if (!idKaryawan) {
      setPreview(null);
      return;
    }

    const fetchPreview = async () => {
      setLoadingPreview(true);
      try {
        const res = await fetch(
          `/api/pengalokasian-gaji?id_karyawan=${idKaryawan}`,
        );
        const json = await res.json();
        const alokasi: any[] = json.data ?? [];

        const pendapatan = alokasi
          .filter((a) => a.tipe === "pendapatan")
          .reduce((acc, a) => acc + Number(a.nominal), 0);

        const potongan = alokasi
          .filter((a) => a.tipe === "potongan")
          .reduce((acc, a) => acc + Number(a.nominal), 0);

        setPreview({ pendapatan, potongan, bersih: pendapatan - potongan });
      } catch {
        setPreview(null);
      } finally {
        setLoadingPreview(false);
      }
    };

    fetchPreview();
  }, [idKaryawan]);

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!idKaryawan) {
      onError("Pilih karyawan terlebih dahulu.");
      return;
    }
    if (!preview) {
      onError("Data alokasi gaji belum tersedia.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/penggajian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_karyawan: Number(idKaryawan),
          periode: periode,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan.");

      onClose();
      onSuccess("Penggajian berhasil dibuat.");
    } catch (err: any) {
      onError(err.message || "Gagal menyimpan.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  const selectedKaryawan = karyawanList.find(
    (k) => k.id_karyawan === Number(idKaryawan),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm mx-4 bg-white rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Plus size={14} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-black">
                Buat Penggajian
              </h2>
              <p className="text-xs text-gray-500">
                Generate slip gaji karyawan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-40"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Periode */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-black">Periode</label>
            <select
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              disabled={submitting}
              className="w-full h-9 px-3 text-sm text-gray-800 rounded-lg border border-gray-200 outline-none focus:border-emerald-400"
            >
              {periodeOptions.map((p) => (
                <option key={p} value={p}>
                  {formatPeriode(p)}
                  {p === currentPeriode() ? " (Bulan ini)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Karyawan */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-black">Karyawan</label>

            {loadingKaryawan ? (
              <div className="w-full h-9 flex items-center gap-2 px-3 rounded-lg border border-gray-200 text-sm text-gray-400">
                <Loader2 size={13} className="animate-spin" />
                Memuat daftar karyawan...
              </div>
            ) : karyawanList.length === 0 ? (
              <div className="w-full h-9 flex items-center gap-2 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-400">
                <Users size={13} />
                Semua karyawan sudah digaji periode ini
              </div>
            ) : (
              <select
                value={idKaryawan}
                onChange={(e) => setIdKaryawan(e.target.value)}
                disabled={submitting}
                className="w-full h-9 px-3 text-sm text-gray-800 rounded-lg border border-gray-200 outline-none focus:border-emerald-400"
              >
                <option value="">Pilih karyawan...</option>
                {karyawanList.map((k) => (
                  <option key={k.id_karyawan} value={k.id_karyawan}>
                    {k.nama} — {k.nip}
                  </option>
                ))}
              </select>
            )}

            {/* Info jabatan & dept dari karyawan terpilih */}
            {selectedKaryawan && (
              <p className="text-xs text-gray-400">
                {[
                  selectedKaryawan.nama_jabatan,
                  selectedKaryawan.nama_departemen,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>

          {/* Preview Nominal */}
          {idKaryawan && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 space-y-2">
              {loadingPreview ? (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Loader2 size={12} className="animate-spin" />
                  Menghitung nominal dari alokasi gaji...
                </div>
              ) : preview ? (
                <>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Preview dari alokasi gaji
                  </p>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Total Pendapatan</span>
                    <span className="font-medium text-emerald-600">
                      {formatRupiah(preview.pendapatan)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Total Potongan</span>
                    <span className="font-medium text-red-500">
                      {formatRupiah(preview.potongan)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-gray-200">
                    <span className="font-medium text-black">Gaji Bersih</span>
                    <span className="font-semibold text-gray-900">
                      {formatRupiah(preview.bersih)}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-amber-500">
                  Karyawan ini belum memiliki alokasi gaji. Atur dulu di menu
                  Pengalokasian Gaji.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={submitting}
            className="h-9 px-4 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              submitting ||
              !idKaryawan ||
              loadingPreview ||
              !preview ||
              preview.bersih <= 0
            }
            className="h-9 px-4 text-sm text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {submitting && <Loader2 size={13} className="animate-spin" />}
            {submitting ? "Memproses..." : "Buat Penggajian"}
          </button>
        </div>
      </div>
    </div>
  );
}
