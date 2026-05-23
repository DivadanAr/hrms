// components/layout/navbar.tsx
"use client";

import {
  Menu,
  LogOut,
  User,
  ChevronDown,
  Building2,
  Briefcase,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { deleteCookie } from "@/context/cookie";
import { UserData } from "./dashboard-layout-server";

interface NavbarProps {
  setSidebarOpen: (value: boolean) => void;
  userData: UserData;
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

export default function Navbar({ setSidebarOpen, userData }: NavbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown kalau klik di luar
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

  const initials = getInitials(userData.nama);
  const avatarColor = getAvatarColor(userData.role);

  return (
    <header className="sticky top-0 z-30 flex h-[75px] items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg border border-gray-200 p-2 text-gray-600 lg:hidden"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Right — Profile Dropdown */}
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
              {userData.nama || "User"}
            </p>
            <p className="text-xs text-gray-400">
              {ROLE_LABEL[userData.role] ?? userData.role}
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
                  {userData.nama || "—"}
                </p>
                <p className="truncate text-xs text-gray-400">
                  {userData.email || "—"}
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
                    {userData.jabatan || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                <Building2 size={15} className="shrink-0 text-gray-400" />
                <div>
                  <p className="text-[11px] text-gray-400">Departemen</p>
                  <p className="text-sm font-medium text-gray-700">
                    {userData.departemen || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                <User size={15} className="shrink-0 text-gray-400" />
                <div>
                  <p className="text-[11px] text-gray-400">Role</p>
                  <p className="text-sm font-medium text-gray-700">
                    {(ROLE_LABEL[userData.role] ?? userData.role) || "—"}
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
    </header>
  );
}
