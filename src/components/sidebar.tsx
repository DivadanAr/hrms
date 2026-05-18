// components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  LayoutDashboard,
  Settings,
  Blocks,
  Wallet,
  X,
  BriefcaseBusiness,
  UserRoundPlus,
  ClockAlert,
  FileUser,
} from "lucide-react";
import { url } from "inspector";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
}

const menus = [
  {
    title: "GENERAL",
    items: [
      {
        name: "Overview",
        href: "/",
        icon: LayoutDashboard,
      },
      {
        name: "Absensi",
        icon: CalendarCheck,
        children: [
          {
            name: "Absensi Harian",
            href: "/absensi/harian",
          },
          {
            name: "Absensi Bulanan",
            href: "/absensi/bulanan",
          },
        ],
      },
      {
        name: "Resource",
        icon: Blocks,
        children: [
          {
            name: "Departemen",
            href: "/departemen",
          },
          {
            name: "Jabatan",
            href: "/jabatan",
          },
          {
            name: "Karyawan",
            href: "/karyawan",
          },
        ],
      },
      {
        name: "Izin Karyawan",
        icon: FileUser,
        href: "/izin",
      },
      {
        name: "Lembur Karyawan",
        icon: ClockAlert,
        href: "/lembur",
      },
      {
        name: "Payroll",
        icon: Wallet,
        children: [
          {
            name: "Komponen Gaji",
            href: "/komponen-gaji",
          },
          {
            name: "Pengalokasian Gaji",
            href: "/pengalokasian-gaji",
          },
          {
            name: "Penggajian",
            href: "/penggajian",
          },
        ],
      },
    ],
  },

  //   {
  //     title: "MANAGEMENT",
  //     items: [
  //       {
  //         name: "Jobs",
  //         icon: BriefcaseBusiness,
  //         children: [
  //           {
  //             name: "Job List",
  //             href: "/dashboard/jobs",
  //           },
  //           {
  //             name: "Create Job",
  //             href: "/dashboard/jobs/create",
  //           },
  //         ],
  //       },

  //       {
  //         name: "Candidate",
  //         href: "/dashboard/candidate",
  //         icon: UserRoundPlus,
  //       },

  //       {
  //         name: "Calendar",
  //         href: "/dashboard/calendar",
  //         icon: CalendarDays,
  //       },
  //     ],
  //   },

  //   {
  //     title: "SUPPORT",
  //     items: [
  //       {
  //         name: "Help Center",
  //         href: "/dashboard/help-center",
  //         icon: CircleHelp,
  //       },

  //       {
  //         name: "Settings",
  //         href: "/dashboard/settings",
  //         icon: Settings,
  //       },
  //     ],
  //   },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
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

        {/* Close Mobile */}
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
              {section.items.map((item) => {
                const Icon = item.icon;

                const isParentActive =
                  item.children?.some((child) => child.href === pathname) ||
                  item.href === pathname;

                return (
                  <div key={item.name}>
                    {/* Parent Menu */}
                    {item.children ? (
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
                    ) : (
                      <Link
                        href={item.href!}
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                          pathname === item.href
                            ? "bg-emerald-50 text-emerald-600"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Icon size={18} />

                        <span className="text-sm font-medium">{item.name}</span>
                      </Link>
                    )}

                    {/* Sub Menu */}
                    {item.children && openMenu === item.name && (
                      <div className="mt-1 ml-6 space-y-1 border-l border-gray-200 pl-4">
                        {item.children.map((child) => (
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
