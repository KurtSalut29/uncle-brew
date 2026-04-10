"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-5">{children}</main>
      </div>
    </div>
  );
}
