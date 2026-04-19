"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) router.replace("/login");
  }, [router]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080808" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((p) => !p)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", marginLeft: collapsed ? 64 : 240, transition: "margin-left 0.25s ease", minWidth: 0 }}>
        <Header onMenuToggle={() => setCollapsed((p) => !p)} sidebarCollapsed={collapsed} />
        <main style={{ flex: 1, padding: 28, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
