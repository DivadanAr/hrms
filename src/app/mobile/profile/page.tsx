"use client";

import { useEffect, useState } from "react";
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const ROLE_LABEL: Record<string, string> = {
  HR: "Human Resource",
  FINANCE: "Finance",
  ADMIN: "Administrator",
  EMPLOYEE: "Employee",
};

const ROLE_COLOR: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  HR: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-500",
  },
  FINANCE: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  ADMIN: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-400",
  },
  EMPLOYEE: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-emerald-100/70 ${className}`}
    />
  );
}

// ─── Field Row ────────────────────────────────────────────────────────────────

function FieldRow({
  icon,
  label,
  value,
  loading,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  loading: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-colors
        ${
          highlight
            ? "bg-emerald-50 border border-emerald-100"
            : "bg-slate-50/60 border border-slate-100"
        }`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
          ${highlight ? "bg-emerald-100" : "bg-white border border-slate-200"}`}
      >
        <span className={highlight ? "text-emerald-600" : "text-slate-400"}>
          {icon}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">
          {label}
        </p>
        {loading ? (
          <Skeleton className="h-4 w-36" />
        ) : (
          <p
            className={`text-sm font-bold truncate leading-tight
              ${highlight ? "text-emerald-900" : "text-slate-800"}`}
          >
            {value || "—"}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const raw = await getCookie("__vxu_meta-Us");
        if (raw) setUser(JSON.parse(raw));
      } catch (err) {
        console.error("Gagal membaca cookie user", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const initials = user?.nama ? getInitials(user.nama) : "?";
  const roleColor = user?.role
    ? (ROLE_COLOR[user.role] ?? ROLE_COLOR["EMPLOYEE"])
    : ROLE_COLOR["EMPLOYEE"];
  const roleLabel = user?.role ? (ROLE_LABEL[user.role] ?? user.role) : "—";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        .anim-1 { animation: fadeIn .45s ease both; }
        .anim-2 { animation: fadeIn .45s .07s ease both; }
        .anim-3 { animation: fadeIn .45s .14s ease both; }
        .anim-4 { animation: fadeIn .45s .21s ease both; }
        .anim-5 { animation: fadeIn .45s .28s ease both; }
        .avatar-anim { animation: scaleIn .5s ease both; }
        .dot-bg {
          background-image: radial-gradient(circle, #d1fae5 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dot-bg">
        {/* ── Header ── */}
        <header className="anim-1 sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-emerald-100 px-5 py-4">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest leading-none">
                Akun Saya
              </p>
              <h1 className="text-sm font-black text-emerald-950 leading-tight">
                Profil Karyawan
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-5 py-8 space-y-5">
          {/* ── Hero Avatar Card ── */}
          <div className="anim-1 bg-white rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-100 overflow-hidden">
            {/* Banner strip */}
            <div className="h-20 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 relative">
              {/* subtle dot pattern on banner */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, #fff 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              />
            </div>

            {/* Avatar + name */}
            <div className="px-6 pb-6 -mt-10">
              {/* Avatar circle */}
              <div className="avatar-anim w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center border-4 border-white shadow-lg shadow-emerald-200 mb-4">
                <span className="text-white text-2xl font-black tracking-tight">
                  {loading ? (
                    <span className="w-8 h-5 block rounded-lg bg-emerald-300/50 animate-pulse" />
                  ) : (
                    initials
                  )}
                </span>
              </div>

              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-44" />
                  <Skeleton className="h-4 w-56" />
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-black text-emerald-950 leading-tight">
                    {user?.nama || "—"}
                  </h2>
                  <p className="text-sm text-slate-400 font-medium mt-0.5 truncate">
                    {user?.email || "—"}
                  </p>
                </>
              )}

              {/* Role badge */}
              <div className="mt-3 flex items-center gap-2">
                {loading ? (
                  <Skeleton className="h-6 w-28" />
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold
                      ${roleColor.bg} ${roleColor.text} ${roleColor.border}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${roleColor.dot}`}
                    />
                    {roleLabel}
                  </span>
                )}

                {/* ID badge */}
                {!loading && user?.id_karyawan && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-xs font-black text-slate-500">
                    ID #{user.id_karyawan}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Info Fields ── */}
          <div className="anim-2 space-y-2.5">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 mb-3">
              Informasi Pribadi
            </p>

            <div className="anim-3">
              <FieldRow
                loading={loading}
                label="Nama Lengkap"
                value={user?.nama ?? ""}
                highlight
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
              />
            </div>

            <div className="anim-3">
              <FieldRow
                loading={loading}
                label="Email"
                value={user?.email ?? ""}
                highlight
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                }
              />
            </div>
          </div>

          {/* ── Pekerjaan Fields ── */}
          <div className="anim-4 space-y-2.5">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 mb-3">
              Informasi Pekerjaan
            </p>

            <FieldRow
              loading={loading}
              label="Jabatan"
              value={user?.jabatan ?? ""}
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
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              }
            />

            <FieldRow
              loading={loading}
              label="Departemen"
              value={user?.departemen ?? ""}
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              }
            />

            <FieldRow
              loading={loading}
              label="Role Sistem"
              value={roleLabel}
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              }
            />

            <FieldRow
              loading={loading}
              label="ID Karyawan"
              value={user?.id_karyawan ? `#${user.id_karyawan}` : ""}
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
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                  />
                </svg>
              }
            />
          </div>

          {/* ── Read-only notice ── */}
          <div className="anim-5 flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-amber-50 border border-amber-100">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <svg
                className="w-4 h-4 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-xs font-semibold text-amber-700 leading-snug">
              Data profil hanya dapat diubah oleh HR atau Administrator. Hubungi
              tim HR untuk pembaruan data.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center pb-6">
            <p className="text-xs text-slate-300 font-medium">
              HR System · {new Date().getFullYear()}
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
