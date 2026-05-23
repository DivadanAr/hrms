// components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Blocks,
  Wallet,
  X,
  ClockAlert,
  FileUser,
} from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  role: string; // ← tambah prop role
}

type ChildItem = {
  name: string;
  href: string;
  allowedRoles?: string[];
};

type MenuItem = {
  name: string;
  href?: string;
  icon: React.ElementType;
  allowedRoles?: string[];
  children?: ChildItem[];
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const menus: MenuSection[] = [
  {
    title: "GENERAL",
    items: [
      {
        name: "Overview",
        href: "/",
        icon: LayoutDashboard,
        // tidak ada allowedRoles = semua role boleh
      },
      {
        name: "Absensi",
        icon: CalendarCheck,
        allowedRoles: ["HR", "ADMIN"],
        children: [
          {
            name: "Absensi Harian",
            href: "/absensi/harian",
            allowedRoles: ["HR", "ADMIN"],
          },
          {
            name: "Absensi Bulanan",
            href: "/absensi/bulanan",
            allowedRoles: ["HR", "ADMIN"],
          },
        ],
      },
      {
        name: "Resource",
        icon: Blocks,
        allowedRoles: ["HR", "ADMIN"],
        children: [
          {
            name: "Departemen",
            href: "/departemen",
            allowedRoles: ["HR", "ADMIN"],
          },
          { name: "Jabatan", href: "/jabatan", allowedRoles: ["HR", "ADMIN"] },
          {
            name: "Karyawan",
            href: "/karyawan",
            allowedRoles: ["HR", "ADMIN"],
          },
        ],
      },
      {
        name: "Izin Karyawan",
        icon: FileUser,
        href: "/izin",
        allowedRoles: ["HR", "ADMIN"],
      },
      {
        name: "Lembur Karyawan",
        icon: ClockAlert,
        href: "/lembur",
        allowedRoles: ["HR", "ADMIN"],
      },
      {
        name: "Payroll",
        icon: Wallet,
        allowedRoles: ["FINANCE", "ADMIN"],
        children: [
          {
            name: "Komponen Gaji",
            href: "/komponen-gaji",
            allowedRoles: ["FINANCE", "ADMIN"],
          },
          {
            name: "Pengalokasian Gaji",
            href: "/pengalokasian-gaji",
            allowedRoles: ["FINANCE", "ADMIN"],
          },
          {
            name: "Penggajian",
            href: "/penggajian",
            allowedRoles: ["FINANCE", "ADMIN"],
          },
        ],
      },
    ],
  },
];

function canAccess(allowedRoles: string[] | undefined, role: string): boolean {
  if (!allowedRoles) return true;
  return allowedRoles.includes(role);
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  role,
}: SidebarProps) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>("");

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-50 h-screen w-[280px] border-r border-gray-200 bg-white transition-all duration-300 lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex h-[75px] items-center justify-between border-b border-gray-100 px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 font-bold text-white">
            W
          </div>
          <h1 className="text-2xl font-bold text-gray-800">WorkSphere</h1>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
          <X size={20} />
        </button>
      </div>

      {/* Menu */}
      <div className="h-[calc(100vh-75px)] overflow-y-auto px-4 py-6">
        {menus.map((section) => (
          <div key={section.title} className="mb-8">
            <p className="mb-3 px-3 text-xs font-semibold text-gray-400">
              {section.title}
            </p>

            <div className="space-y-1">
              {section.items
                .filter((item) => canAccess(item.allowedRoles, role))
                .map((item) => {
                  const Icon = item.icon;
                  const accessibleChildren = item.children?.filter((child) =>
                    canAccess(child.allowedRoles, role),
                  );
                  const isParentActive =
                    accessibleChildren?.some(
                      (child) => child.href === pathname,
                    ) || item.href === pathname;

                  return (
                    <div key={item.name}>
                      {accessibleChildren && accessibleChildren.length > 0 ? (
                        <button
                          onClick={() => toggleMenu(item.name)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-3 transition-all ${
                            isParentActive
                              ? "bg-emerald-50 text-emerald-600"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={18} />
                            <span className="text-sm font-medium">
                              {item.name}
                            </span>
                          </div>
                          {openMenu === item.name ? (
                            <ChevronDown size={18} />
                          ) : (
                            <ChevronRight size={18} />
                          )}
                        </button>
                      ) : item.href ? (
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                            pathname === item.href
                              ? "bg-emerald-50 text-emerald-600"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <Icon size={18} />
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
                        </Link>
                      ) : null}

                      {accessibleChildren &&
                        accessibleChildren.length > 0 &&
                        openMenu === item.name && (
                          <div className="ml-6 mt-1 space-y-1 border-l border-gray-200 pl-4">
                            {accessibleChildren.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`block rounded-lg px-3 py-2 text-sm transition-all ${
                                  pathname === child.href
                                    ? "bg-emerald-100 font-medium text-emerald-600"
                                    : "text-gray-500 hover:bg-gray-100"
                                }`}
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
