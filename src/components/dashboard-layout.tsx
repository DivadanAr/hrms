// components/layout/dashboard-layout.tsx
"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import { UserData } from "./dashboard-layout-server";

export default function DashboardLayout({
  children,
  role,
  userData,
}: {
  children: React.ReactNode;
  role: string;
  userData: UserData;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] lg:ml-[280px]">
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-all lg:hidden ${
          sidebarOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        role={role}
      />
      <div className="flex flex-1 flex-col">
        <Navbar setSidebarOpen={setSidebarOpen} userData={userData} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
