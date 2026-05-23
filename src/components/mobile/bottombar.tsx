"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, ScanLine, Clock3, User } from "lucide-react";

const menus = [
  {
    name: "Home",
    href: "/mobile/home",
    icon: Home,
  },
  {
    name: "Izin",
    href: "/mobile/izin",
    icon: FileText,
  },
  {
    name: "Absensi",
    href: "/mobile/absensi",
    icon: ScanLine,
    center: true,
  },
  {
    name: "Lembur",
    href: "/mobile/lembur",
    icon: Clock3,
  },
  {
    name: "Profile",
    href: "/mobile/profile",
    icon: User,
  },
];

export default function BottomBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="relative flex items-center justify-between w-full max-w-md px-6 pt-3 pb-5 bg-white border-t shadow-[0_-5px_25px_rgba(0,0,0,0.06)] rounded-t-[28px]">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const active = pathname === menu.href;

          // BUTTON TENGAH
          if (menu.center) {
            return (
              <Link
                key={menu.name}
                href={menu.href}
                className="relative -mt-10"
              >
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-emerald-600 shadow-lg border-8 border-white transition hover:scale-105">
                  <Icon size={30} className="text-white" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={menu.name}
              href={menu.href}
              className="flex flex-col items-center gap-1 min-w-[60px]"
            >
              <Icon
                size={24}
                className={`transition ${
                  active ? "text-emerald-600" : "text-gray-400"
                }`}
              />

              <span
                className={`text-xs font-medium ${
                  active ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                {menu.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
