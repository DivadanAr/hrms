"use client";

import { useState, useEffect, useCallback } from "react";
import { getCookie } from "@/context/cookie";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserData {
  id_karyawan: number;
  nama: string;
  email: string;
  jabatan: string;
  departemen: string;
  role: string;
}

interface AbsensiResponse {
  success: boolean;
  type?: "masuk" | "pulang";
  message: string;
}

interface AbsensiStatus {
  id_absensi?: number;
  jam_masuk?: string | null;
  jam_pulang?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTanggalHariIni(): string {
  return new Date().toISOString().split("T")[0];
}

function getJamSekarang(): string {
  return new Date().toTimeString().slice(0, 8);
}

function formatJam(jam: string | null | undefined): string {
  if (!jam) return "—";
  return jam.slice(0, 5);
}

function formatTanggal(tgl: string): string {
  return new Date(tgl).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ─── Clock Component ──────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState(getJamSekarang());

  useEffect(() => {
    const id = setInterval(() => setTime(getJamSekarang()), 1000);
    return () => clearInterval(id);
  }, []);

  const [h, m, s] = time.split(":");

  return (
    <div className="flex items-end gap-1 justify-center">
      <span className="text-7xl font-black tabular-nums text-emerald-950 leading-none">
        {h}
      </span>
      <span className="text-5xl font-black text-emerald-400 mb-1 animate-pulse">
        :
      </span>
      <span className="text-7xl font-black tabular-nums text-emerald-950 leading-none">
        {m}
      </span>
      <span className="text-5xl font-black text-emerald-300 mb-1 animate-pulse">
        :
      </span>
      <span className="text-5xl font-bold tabular-nums text-emerald-500 mb-0.5 leading-none">
        {s}
      </span>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AbsensiStatus | null }) {
  if (!status?.jam_masuk) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Belum Absen
      </span>
    );
  }
  if (status.jam_masuk && !status.jam_pulang) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Sedang Bekerja
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
      Selesai Hari Ini
    </span>
  );
}

// ─── Info Card ────────────────────────────────────────────────────────────────

function InfoCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: "emerald" | "teal" | "slate";
}) {
  const colors = {
    emerald: "from-emerald-50 to-emerald-100 border-gray-200 text-emerald-700",
    teal: "from-teal-50 to-teal-100 border-teal-200 text-teal-700",
    slate: "from-slate-50 to-slate-100 border-slate-200 text-slate-500",
  };

  return (
    <div
      className={`flex flex-col gap-2 p-4 rounded-2xl border bg-gradient-to-br ${colors[accent]}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest opacity-70">
          {label}
        </span>
        <span className="opacity-60">{icon}</span>
      </div>
      <span className="text-2xl font-black tracking-tight">{value}</span>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const id = setTimeout(onClose, 3500);
    return () => clearTimeout(id);
  }, [onClose]);

  return (
    <div
      className={`z-99999 fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold max-w-sm w-full
        ${type === "success" ? "bg-emerald-600" : "bg-red-500"}`}
      style={{ animation: "slideUp 0.3s ease" }}
    >
      <span className="text-lg">{type === "success" ? "✅" : "❌"}</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="opacity-70 hover:opacity-100 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

// ─── User Card ────────────────────────────────────────────────────────────────

function UserCard({
  user,
  loading,
}: {
  user: UserData | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="fade-in-2 bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100 p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded-lg bg-emerald-100 animate-pulse" />
            <div className="h-3 w-44 rounded-lg bg-slate-100 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initials = getInitials(user.nama);

  return (
    <div className="fade-in-2 bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100 p-5">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-md shadow-gray-200">
          <span className="text-white text-lg font-black tracking-tight">
            {initials}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-black text-emerald-950 truncate leading-tight">
            {user.nama}
          </p>
          <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
            {user.email}
          </p>
        </div>

        {/* ID Badge
        <div className="shrink-0 text-right">
          <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 border border-gray-200 text-emerald-700 text-xs font-black tracking-wider">
            #{user.id_karyawan}
          </span>
        </div> */}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AbsensiPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [lokasi, setLokasi] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<AbsensiStatus | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [checkLoading, setCheckLoading] = useState(false);

  const tanggal = getTanggalHariIni();

  // ─── Ambil user dari cookie ───────────────────────────────────────────────

  useEffect(() => {
    async function loadUser() {
      try {
        const raw = await getCookie("__vxu_meta-Us");
        if (raw) {
          const parsed: UserData = JSON.parse(raw);
          setUser(parsed);
        }
      } catch (err) {
        console.error("Gagal membaca cookie user", err);
      } finally {
        setLoadingUser(false);
      }
    }
    loadUser();
  }, []);

  // ─── Fetch status absensi (otomatis setelah user tersedia) ───────────────

  const fetchStatus = useCallback(
    async (id: number) => {
      if (!id) return;
      setCheckLoading(true);
      try {
        const res = await fetch(
          `/api/absensi/status?tanggal=${tanggal}&id_karyawan=${id}`,
        );
        if (res.ok) {
          const data = await res.json();
          setStatus(data.data ?? null);
        }
      } catch {
        // silent
      } finally {
        setCheckLoading(false);
      }
    },
    [tanggal],
  );

  useEffect(() => {
    if (user?.id_karyawan) {
      fetchStatus(user.id_karyawan);
    }
  }, [user, fetchStatus]);

  // ─── Ambil lokasi GPS ────────────────────────────────────────────────────

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );

          const data = await res.json();

          const city =
            data.address.city ||
            data.address.county ||
            data.address.state ||
            "Unknown";

          const country = data.address.country || "";

          setLokasi(`${city}, ${country}`);
        } catch (error) {
          setLokasi("Lokasi tidak ditemukan");
        }
      },
      () => {
        setLokasi("Izin lokasi ditolak");
      },
    );
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  // ─── Submit absensi ──────────────────────────────────────────────────────

  const handleAbsensi = async () => {
    if (!user?.id_karyawan) {
      setToast({ message: "Data user tidak ditemukan", type: "error" });
      return;
    }

    setLoading(true);
    const jamSekarang = getJamSekarang();

    const body: Record<string, unknown> = {
      tanggal,
      id_karyawan: user.id_karyawan,
      lokasi: lokasi || null,
    };

    if (!status?.jam_masuk) {
      body.jam_masuk = jamSekarang;
    } else {
      body.jam_pulang = jamSekarang;
    }

    try {
      const res = await fetch("/api/absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: AbsensiResponse = await res.json();

      if (data.success) {
        setToast({ message: data.message, type: "success" });
        await fetchStatus(user.id_karyawan);
      } else {
        setToast({ message: data.message, type: "error" });
      }
    } catch {
      setToast({ message: "Koneksi gagal, coba lagi", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const isSudahPulang = !!status?.jam_pulang;
  const isSedangMasuk = !!status?.jam_masuk && !status?.jam_pulang;
  const buttonLabel = isSudahPulang
    ? "Absensi Selesai Hari Ini"
    : isSedangMasuk
      ? "Absen Pulang"
      : "Absen Masuk";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in   { animation: fadeIn 0.5s ease both; }
        .fade-in-2 { animation: fadeIn 0.5s 0.08s ease both; }
        .fade-in-3 { animation: fadeIn 0.5s 0.16s ease both; }
        .fade-in-4 { animation: fadeIn 0.5s 0.24s ease both; }
        .fade-in-5 { animation: fadeIn 0.5s 0.32s ease both; }
        .dot-bg {
          background-image: radial-gradient(circle, #d1fae5 1px, transparent 1px);
          background-size: 28px 28px;
        }
      `}</style>

      {/* <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dot-bg"> */}
      <div className="min-h-screen bg-gray-100 dot-bg">
        {/* ── Header ── */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-6 py-4 fade-in">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm shadow-gray-200">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-emerald-500 font-semibold uppercase tracking-widest leading-none">
                  Sistem
                </p>
                <h1 className="text-base font-black text-emerald-950 leading-tight">
                  Absensi Karyawan
                </h1>
              </div>
            </div>

            {/* Status + loading spinner jika sedang cek */}
            <div className="flex items-center gap-2">
              {checkLoading && (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              )}
              <StatusBadge status={status} />
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-5 py-8 space-y-5">
          {/* ── Clock Card ── */}
          <div className="fade-in bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100 p-6 text-center relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-50 opacity-60" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-teal-50 opacity-60" />
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 relative">
              {formatTanggal(tanggal)}
            </p>
            <div className="relative">
              <LiveClock />
            </div>
            <p className="text-xs text-slate-400 mt-4 font-medium relative">
              {lokasi ? (
                <span className="inline-flex items-center gap-1 text-emerald-500">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Lokasi terdeteksi
                </span>
              ) : (
                "Lokasi tidak tersedia"
              )}
            </p>
          </div>

          {/* ── User Card (nama + email, otomatis dari cookie) ── */}
          <UserCard user={user} loading={loadingUser} />

          {/* ── Jam Masuk / Pulang ── */}
          <div className="fade-in-3 grid grid-cols-2 gap-3">
            <InfoCard
              label="Jam Masuk"
              value={formatJam(status?.jam_masuk)}
              accent="emerald"
              icon={
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
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              }
            />
            <InfoCard
              label="Jam Pulang"
              value={formatJam(status?.jam_pulang)}
              accent={status?.jam_pulang ? "teal" : "slate"}
              icon={
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              }
            />
          </div>

          {/* ── Lokasi GPS ── */}
          <div className="fade-in-4 bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100 p-5">
            <label className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center justify-between mb-3">
              Lokasi GPS
              <button
                onClick={getLocation}
                className="text-emerald-500 hover:text-emerald-700 font-bold text-xs transition-colors"
              >
                Refresh →
              </button>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Koordinat GPS otomatis..."
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 bg-emerald-50/50
                  text-emerald-950 text-sm font-semibold placeholder:text-slate-300
                  focus:outline-none focus:border-gray-500 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {/* ── Submit Button ── */}
          <div className="fade-in-5">
            <button
              onClick={handleAbsensi}
              disabled={loading || isSudahPulang || loadingUser || !user}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest
                transition-all duration-300 shadow-md active:scale-[0.98]
                ${
                  isSudahPulang || !user
                    ? "bg-slate-300 text-slate-400 cursor-not-allowed shadow-none"
                    : isSedangMasuk
                      ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-gray-200 hover:shadow-lg hover:shadow-gray-200 hover:-translate-y-0.5"
                      : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-gray-200 hover:shadow-lg hover:shadow-gray-200 hover:-translate-y-0.5"
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {!isSudahPulang && user && (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {isSedangMasuk ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      )}
                    </svg>
                  )}
                  {buttonLabel}
                </span>
              )}
            </button>

            {!isSudahPulang && user && (
              <p className="text-center text-xs text-slate-400 mt-3 font-medium">
                {isSedangMasuk
                  ? "Klik untuk mencatat jam pulang Anda"
                  : "Klik untuk mencatat jam masuk Anda"}
              </p>
            )}
          </div>
        </main>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
