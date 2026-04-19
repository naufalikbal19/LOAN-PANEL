"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardList, Wallet, Settings,
  ChevronDown, ChevronRight, LogOut, Shield, UserCheck,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: { label: string; href: string }[];
}

const nav: NavItem[] = [
  { label: "Console",            icon: LayoutDashboard, href: "/dashboard/console" },
  {
    label: "Admin Management", icon: Shield,
    children: [
      { label: "Admin List", href: "/dashboard/admin-management/admin-list" },
      { label: "Admin Log",  href: "/dashboard/admin-management/admin-log" },
    ],
  },
  { label: "Withdrawal Records", icon: Wallet,         href: "/dashboard/withdrawal" },
  {
    label: "Loans", icon: ClipboardList,
    children: [
      { label: "Orderer", href: "/dashboard/loans/orderer" },
    ],
  },
  {
    label: "Member", icon: Users,
    children: [
      { label: "Member List",     href: "/dashboard/member/member-list" },
      { label: "Member Approval", href: "/dashboard/member/member-approval" },
    ],
  },
  { label: "Settings",           icon: Settings,       href: "/dashboard/settings" },
];

interface Props { collapsed: boolean; onToggle: () => void; }

export default function Sidebar({ collapsed, onToggle }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<string[]>(() => nav.filter((i) => i.children).map((i) => i.label));

  const toggleMenu = (label: string) => {
    setOpenMenus((p) => p.includes(label) ? p.filter((l) => l !== label) : [...p, label]);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_role");
    localStorage.removeItem("admin_name");
    router.push("/login");
  };

  return (
    <aside style={{
      width: collapsed ? 64 : 240,
      minHeight: "100vh",
      background: "#0c0c0c",
      borderRight: "1px solid #1e1e1e",
      display: "flex",
      flexDirection: "column",
      transition: "width 0.25s ease",
      overflow: "hidden",
      flexShrink: 0,
      position: "fixed",
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 50,
    }}>
      {/* Brand */}
      <div style={{ padding: collapsed ? "20px 0" : "20px 20px", borderBottom: "1px solid #1e1e1e", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", justifyContent: collapsed ? "center" : "flex-start" }} onClick={onToggle}>
        <div style={{ width: 34, height: 34, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Shield size={18} color="#c9a84c" strokeWidth={1.5} />
        </div>
        {!collapsed && (
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>Admin Panel</p>
            <p style={{ fontSize: 10, color: "#888" }}>Pinjaman Barakah</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto", overflowX: "hidden" }}>
        {nav.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.children;
          const isOpen = openMenus.includes(item.label);
          const parentActive = item.children?.some((c) => isActive(c.href)) || (item.href && isActive(item.href));

          if (hasChildren) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => !collapsed && toggleMenu(item.label)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: collapsed ? "10px 0" : "10px 16px",
                    background: parentActive ? "rgba(201,168,76,0.08)" : "transparent",
                    border: "none", cursor: "pointer", color: parentActive ? "#c9a84c" : "#888",
                    transition: "all 0.15s", justifyContent: collapsed ? "center" : "flex-start",
                    borderLeft: parentActive ? "2px solid #c9a84c" : "2px solid transparent",
                  }}
                >
                  <Icon size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                  {!collapsed && <>
                    <span style={{ fontSize: 13, fontWeight: 600, flex: 1, textAlign: "left" }}>{item.label}</span>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </>}
                </button>
                {!collapsed && isOpen && item.children?.map((child) => (
                  <Link key={child.href} href={child.href} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px 8px 44px", color: isActive(child.href) ? "#c9a84c" : "#666", fontSize: 12, fontWeight: isActive(child.href) ? 700 : 500, textDecoration: "none", background: isActive(child.href) ? "rgba(201,168,76,0.06)" : "transparent", transition: "all 0.15s", borderLeft: isActive(child.href) ? "2px solid #c9a84c" : "2px solid transparent" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: isActive(child.href) ? "#c9a84c" : "#444", flexShrink: 0 }} />
                    {child.label}
                  </Link>
                ))}
              </div>
            );
          }

          return (
            <Link key={item.href} href={item.href!} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: collapsed ? "10px 0" : "10px 16px",
              color: isActive(item.href!) ? "#c9a84c" : "#888",
              textDecoration: "none", transition: "all 0.15s",
              background: isActive(item.href!) ? "rgba(201,168,76,0.08)" : "transparent",
              borderLeft: isActive(item.href!) ? "2px solid #c9a84c" : "2px solid transparent",
              justifyContent: collapsed ? "center" : "flex-start",
            }}>
              <Icon size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ borderTop: "1px solid #1e1e1e", padding: collapsed ? "12px 0" : "12px 16px" }}>
        <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "8px 0" : "8px 10px", background: "transparent", border: "none", cursor: "pointer", color: "#ef4444", borderRadius: 8, transition: "all 0.15s", justifyContent: collapsed ? "center" : "flex-start" }}>
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!collapsed && <span style={{ fontSize: 13, fontWeight: 600 }}>Log Keluar</span>}
        </button>
      </div>
    </aside>
  );
}
