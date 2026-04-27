"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardList, Wallet, Settings,
  ChevronDown, ChevronRight, LogOut, Shield, ArrowLeftRight, MessageSquare, X, ImageIcon, CalendarCheck,
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
  { label: "Transaction",  icon: ArrowLeftRight, href: "/dashboard/transaction" },
  { label: "Repayment",   icon: CalendarCheck,  href: "/dashboard/repayment" },
  { label: "Messages",    icon: MessageSquare,  href: "/dashboard/messages" },
  { label: "Media",        icon: ImageIcon,      href: "/dashboard/media" },
  { label: "Settings",     icon: Settings,       href: "/dashboard/settings" },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, isMobile, mobileOpen, onMobileClose }: Props) {
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

  // On mobile: always full-width drawer, slide in/out
  const sidebarWidth = isMobile ? 280 : collapsed ? 64 : 240;
  const transform = isMobile ? (mobileOpen ? "translateX(0)" : "translateX(-100%)") : "none";

  const handleNavClick = () => {
    if (isMobile) onMobileClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 199, backdropFilter: "blur(2px)" }}
        />
      )}

      <aside style={{
        width: sidebarWidth,
        minHeight: "100vh",
        background: "var(--nav-bg)",
        borderRight: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.3s ease, width 0.25s ease",
        overflow: "hidden",
        flexShrink: 0,
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 200,
        transform,
      }}>
        {/* Brand */}
        <div style={{ padding: "16px 16px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 10, justifyContent: (collapsed && !isMobile) ? "center" : "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: 1 }} onClick={(!isMobile && !collapsed) ? onToggle : undefined}>
            <div style={{ width: 34, height: 34, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Shield size={18} color="#c9a84c" strokeWidth={1.5} />
            </div>
            {(isMobile || !collapsed) && (
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>Admin Panel</p>
                <p style={{ fontSize: 10, color: "var(--text-secondary)" }}>Pinjaman Barakah</p>
              </div>
            )}
          </div>
          {isMobile && (
            <button onClick={onMobileClose} style={{ background: "var(--bg-card-inner)", border: "1px solid var(--border-color)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", flexShrink: 0 }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto", overflowX: "hidden" }}>
          {nav.map((item) => {
            const Icon = item.icon;
            const hasChildren = !!item.children;
            const isOpen = openMenus.includes(item.label);
            const parentActive = item.children?.some((c) => isActive(c.href)) || (item.href && isActive(item.href));
            const showLabel = isMobile || !collapsed;

            if (hasChildren) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => showLabel && toggleMenu(item.label)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: showLabel ? "11px 16px" : "11px 0",
                      background: parentActive ? "rgba(201,168,76,0.08)" : "transparent",
                      border: "none", cursor: "pointer", color: parentActive ? "#c9a84c" : "var(--text-secondary)",
                      transition: "all 0.15s", justifyContent: showLabel ? "flex-start" : "center",
                      borderLeft: parentActive ? "2px solid #c9a84c" : "2px solid transparent",
                    }}
                  >
                    <Icon size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                    {showLabel && <>
                      <span style={{ fontSize: 13, fontWeight: 600, flex: 1, textAlign: "left" }}>{item.label}</span>
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </>}
                  </button>
                  {showLabel && isOpen && item.children?.map((child) => (
                    <Link key={child.href} href={child.href} onClick={handleNavClick} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px 9px 44px", color: isActive(child.href) ? "#c9a84c" : "var(--text-secondary)", fontSize: 13, fontWeight: isActive(child.href) ? 700 : 500, textDecoration: "none", background: isActive(child.href) ? "rgba(201,168,76,0.06)" : "transparent", transition: "all 0.15s", borderLeft: isActive(child.href) ? "2px solid #c9a84c" : "2px solid transparent" }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: isActive(child.href) ? "#c9a84c" : "var(--text-muted)", flexShrink: 0 }} />
                      {child.label}
                    </Link>
                  ))}
                </div>
              );
            }

            return (
              <Link key={item.href} href={item.href!} onClick={handleNavClick} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: showLabel ? "11px 16px" : "11px 0",
                color: isActive(item.href!) ? "#c9a84c" : "var(--text-secondary)",
                textDecoration: "none", transition: "all 0.15s",
                background: isActive(item.href!) ? "rgba(201,168,76,0.08)" : "transparent",
                borderLeft: isActive(item.href!) ? "2px solid #c9a84c" : "2px solid transparent",
                justifyContent: showLabel ? "flex-start" : "center",
              }}>
                <Icon size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                {showLabel && <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ borderTop: "1px solid var(--border-color)", padding: (isMobile || !collapsed) ? "12px 16px" : "12px 0" }}>
          <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: (isMobile || !collapsed) ? "8px 10px" : "8px 0", background: "transparent", border: "none", cursor: "pointer", color: "#ef4444", borderRadius: 8, transition: "all 0.15s", justifyContent: (isMobile || !collapsed) ? "flex-start" : "center" }}>
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {(isMobile || !collapsed) && <span style={{ fontSize: 13, fontWeight: 600 }}>Log Keluar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
