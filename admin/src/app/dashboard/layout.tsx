"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) router.replace("/login");
  }, [router]);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleMenuToggle = () => {
    if (isMobile) setMobileOpen((p) => !p);
    else setCollapsed((p) => !p);
  };

  const marginLeft = isMobile ? 0 : collapsed ? 64 : 240;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#080808" }}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((p) => !p)}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", marginLeft, transition: "margin-left 0.25s ease", minWidth: 0, overflow: "hidden" }}>
        <Header onMenuToggle={handleMenuToggle} sidebarCollapsed={collapsed} isMobile={isMobile} />
        <main className="admin-main" style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
