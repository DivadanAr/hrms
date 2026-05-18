// components/layout/navbar.tsx
"use client";

import { Bell, Mail, Menu, Search, Settings } from "lucide-react";

interface NavbarProps {
  setSidebarOpen: (value: boolean) => void;
}

export default function Navbar({ setSidebarOpen }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[75px] items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Toggle Sidebar */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg border border-gray-200 p-2 text-gray-600 lg:hidden"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 md:gap-5">
        <button className="text-gray-500">
          <Mail size={20} />
        </button>

        <button className="text-gray-500">
          <Bell size={20} />
        </button>

        <button className="text-gray-500">
          <Settings size={20} />
        </button>

        <div className="h-10 w-10 overflow-hidden rounded-full">
          <img
            src="https://i.pravatar.cc/150?img=12"
            alt="profile"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
