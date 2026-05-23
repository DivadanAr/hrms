"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  MapPin,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarX2,
  RefreshCcw,
  LogOut,
  User,
  Building2,
  Briefcase,
  ChevronDown,
} from "lucide-react";

import { deleteCookie, getCookie } from "@/context/cookie";
import { useRouter } from "next/navigation";

interface User {
  nama?: string;
  email: string;
  jabatan: string;
  departemen: string;
  role: string;
}

interface OverviewData {
  checkin: string | null;
  checkout: string | null;
  jumlah_kehadiran: number;
  jumlah_tidak_hadir: number;
}

interface HistoryData {
  tanggal: string;
  jam_masuk: string | null;
  jam_pulang: string | null;
  lokasi: string;
  total_jam: string | null;
}
function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

// Warna avatar berdasarkan role
function getAvatarColor(role: string): string {
  const colors: Record<string, string> = {
    HR: "bg-emerald-500",
    FINANCE: "bg-blue-500",
    ADMIN: "bg-violet-500",
    EMPLOYEE: "bg-orange-400",
  };
  return colors[role] ?? "bg-gray-400";
}

const ROLE_LABEL: Record<string, string> = {
  HR: "Human Resource",
  FINANCE: "Finance",
  ADMIN: "Administrator",
  EMPLOYEE: "Employee",
};

export default function Home() {
  const [greeting, setGreeting] = useState("");
  const [location, setLocation] = useState("Mengambil lokasi...");
  const [dataUser, setDataUser] = useState<User>({
    nama: "",
    email: "",
    jabatan: "",
    departemen: "",
    role: "",
  });
  const [loadingUser, setLoadingUser] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await deleteCookie("__vxu_KeySid");
    await deleteCookie("__vxu_meta-Us");
    router.push("/login");
  }

  const [overview, setOverview] = useState<OverviewData>({
    checkin: null,
    checkout: null,
    jumlah_kehadiran: 0,
    jumlah_tidak_hadir: 0,
  });

  const [histories, setHistories] = useState<HistoryData[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // ─────────────────────────────────────────────────────
  // FORMAT JAM
  // ─────────────────────────────────────────────────────

  const formatTime = (time: string | null) => {
    if (!time) return "--:--";

    return time.slice(0, 5);
  };

  // ─────────────────────────────────────────────────────
  // GET COOKIE USER
  // ─────────────────────────────────────────────────────

  const getKuki = async () => {
    try {
      const raw = await getCookie("__vxu_meta-Us");

      if (raw) {
        const parsed = JSON.parse(raw);

        setDataUser(parsed);
      }
    } catch (error) {
      console.log("Gagal mengambil cookie user", error);
    } finally {
      setLoadingUser(false);
    }
  };

  // ─────────────────────────────────────────────────────
  // GET OVERVIEW
  // ─────────────────────────────────────────────────────

  const getOverview = async () => {
    try {
      const res = await fetch("/api/mobile/overview");
      const json = await res.json();

      if (json.success) {
        setOverview(json.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ─────────────────────────────────────────────────────
  // GET HISTORY
  // ─────────────────────────────────────────────────────

  const getHistories = async () => {
    try {
      setLoadingHistory(true);

      const res = await fetch("/api/mobile/history");
      const json = await res.json();

      if (json.success) {
        setHistories(json.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // ─────────────────────────────────────────────────────
  // USE EFFECT
  // ─────────────────────────────────────────────────────

  useEffect(() => {
    getKuki();
    getOverview();
    getHistories();

    // Greeting berdasarkan jam
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 11) {
      setGreeting("Selamat Pagi");
    } else if (hour >= 11 && hour < 15) {
      setGreeting("Selamat Siang");
    } else if (hour >= 15 && hour < 18) {
      setGreeting("Selamat Sore");
    } else {
      setGreeting("Selamat Malam");
    }

    // Ambil lokasi user
    if ("geolocation" in navigator) {
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

            setLocation(`${city}, ${country}`);
          } catch (error) {
            setLocation("Lokasi tidak ditemukan");
          }
        },
        () => {
          setLocation("Izin lokasi ditolak");
        },
      );
    }
  }, []);

  let initials: any;
  let avatarColor: any;

  if (dataUser?.nama && dataUser?.role) {
    initials = getInitials(dataUser?.nama);
    avatarColor = getAvatarColor(dataUser?.role);
  }
  return (
    <>
      {/* HEADER */}
      <div className="px-5 pt-8">
        <div className="flex items-start justify-between">
          <div>
            {greeting == "" ? (
              <div className="mt-2 h-3 w-35 animate-pulse rounded-xl bg-gray-300" />
            ) : (
              <p className="text-gray-500 text-sm">{greeting},</p>
            )}

            {loadingUser ? (
              <div className="mt-2 h-7 w-44 animate-pulse rounded-xl bg-gray-300" />
            ) : (
              <h1 className="mt-1 text-2xl font-bold text-gray-900">
                {dataUser?.nama}
              </h1>
            )}
          </div>

          {loadingUser ? (
            <div className="h-9 w-9 items-center justify-center rounded-full mx-2 my-1.5 bg-gray-300 animate-pulse" />
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all hover:bg-gray-50"
              >
                {/* Avatar Inisial */}
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${avatarColor} text-sm font-bold text-white`}
                >
                  {initials}
                </div>

                {/* Nama + Role (hidden di mobile) */}
                <div className="hidden text-left md:block">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">
                    {dataUser?.nama || "loading..."}
                  </p>
                  <p className="text-xs text-gray-400">
                    {ROLE_LABEL[dataUser?.role] ?? dataUser?.role}
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className={`hidden text-gray-400 transition-transform md:block ${open ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown */}
              {open && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60">
                  {/* Header Dropdown */}
                  <div className="flex items-center gap-3 border-b border-gray-100 p-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${avatarColor} text-base font-bold text-white`}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {dataUser?.nama || "—"}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {dataUser?.email || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1 p-3">
                    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                      <Briefcase size={15} className="shrink-0 text-gray-400" />
                      <div>
                        <p className="text-[11px] text-gray-400">Jabatan</p>
                        <p className="text-sm font-medium text-gray-700">
                          {dataUser?.jabatan || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                      <Building2 size={15} className="shrink-0 text-gray-400" />
                      <div>
                        <p className="text-[11px] text-gray-400">Departemen</p>
                        <p className="text-sm font-medium text-gray-700">
                          {dataUser?.departemen || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                      <User size={15} className="shrink-0 text-gray-400" />
                      <div>
                        <p className="text-[11px] text-gray-400">Role</p>
                        <p className="text-sm font-medium text-gray-700">
                          {(ROLE_LABEL[dataUser?.role] ?? dataUser?.role) ||
                            "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 p-3">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DATE & LOCATION */}
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-600">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          <div className="flex w-fit items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-white">
            <MapPin size={16} />

            <span className="text-sm">{location}</span>
          </div>
        </div>

        {/* CARD GRID */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {/* CHECK IN */}
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                <ArrowDownLeft size={18} className="text-emerald-700" />
              </div>

              <div>
                <p className="font-semibold text-gray-800">Check In</p>

                <p className="text-xs text-gray-400">Hari Ini</p>
              </div>
            </div>

            <h2 className="mt-8 text-4xl text-gray-800 font-bold">
              {formatTime(overview.checkin)}
            </h2>
          </div>

          {/* CHECK OUT */}
          <div className="rounded-3xl bg-white p-5 shadow-sm ">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                <ArrowUpRight size={18} className="text-gray-500" />
              </div>

              <div>
                <p className="font-semibold text-gray-700">Check Out</p>

                <p className="text-xs text-gray-400">Hari Ini</p>
              </div>
            </div>

            <h2 className="mt-8 text-4xl text-gray-800 font-bold">
              {formatTime(overview.checkout)}
            </h2>
          </div>

          {/* ABSENCE */}
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                <CalendarX2 size={18} className="text-emerald-700" />
              </div>

              <div>
                <p className="font-semibold text-gray-800">Tidak Hadir</p>

                <p className="text-xs text-gray-400">Bulan Ini</p>
              </div>
            </div>

            <div className="mt-8 flex items-end gap-2">
              <h2 className="text-4xl text-gray-800 font-bold">
                {overview.jumlah_tidak_hadir}
              </h2>

              <span className="mb-1 text-gray-500">Hari</span>
            </div>
          </div>

          {/* TOTAL ATTEND */}
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                <RefreshCcw size={18} className="text-emerald-700" />
              </div>

              <div>
                <p className="font-semibold text-gray-800">Total Hadir</p>

                <p className="text-xs text-gray-400">Bulan Ini</p>
              </div>
            </div>

            <div className="mt-8 flex items-end gap-2">
              <h2 className="text-4xl text-gray-800 font-bold">
                {overview.jumlah_kehadiran}
              </h2>

              <span className="mb-1 text-gray-500">Hari</span>
            </div>
          </div>
        </div>

        {/* ATTENDANCE HISTORY */}
        <div className="mt-8 pb-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Attendance History
            </h2>

            <button className="text-sm font-semibold text-emerald-700">
              See More
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            {loadingHistory ? (
              <>
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="rounded-3xl bg-white p-4 shadow-sm animate-pulse"
                  >
                    <div className="h-24 rounded-2xl bg-gray-100" />
                  </div>
                ))}
              </>
            ) : histories.length === 0 ? (
              <div className="rounded-3xl bg-white p-8 shadow-sm text-center">
                <p className="text-sm text-gray-400">
                  Belum ada riwayat absensi
                </p>
              </div>
            ) : (
              histories.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 rounded-3xl bg-white p-4 shadow-sm"
                >
                  {/* DATE */}
                  <div className="flex h-24 w-20 flex-col items-center justify-center rounded-2xl bg-emerald-700 text-white">
                    <h2 className="text-3xl font-bold">
                      {new Date(item.tanggal).getDate()}
                    </h2>

                    <p>
                      {new Date(item.tanggal).toLocaleDateString("id-ID", {
                        weekday: "short",
                      })}
                    </p>
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-2xl font-bold text-black">
                          {formatTime(item.jam_masuk)}
                        </p>

                        <span className="text-sm text-gray-400">Check In</span>
                      </div>

                      <div>
                        <p className="text-2xl font-bold text-black">
                          {formatTime(item.jam_pulang)}
                        </p>

                        <span className="text-sm text-gray-400">Check Out</span>
                      </div>

                      <div>
                        <p className="text-2xl font-bold text-black">
                          {formatTime(item.total_jam)}
                        </p>

                        <span className="text-sm text-gray-400">
                          Total Hours
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-gray-500">
                      <MapPin size={16} />

                      <span className="text-sm">{item.lokasi || location}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
