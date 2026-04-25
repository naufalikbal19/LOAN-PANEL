"use client";
import { useEffect, useState } from "react";
import { Menu, Bell, Sun, Moon } from "lucide-react";

interface Props {
  onMenuToggle: () => void;
  sidebarCollapsed: boolean;
  isMobile: boolean;
  theme: "dark" | "light";
  onThemeToggle: () => void;
}

export default function Header({ onMenuToggle, isMobile, theme, onThemeToggle }: Props) {
  const [adminName, setAdminName] = useState("Admin");
  const [adminRole, setAdminRole] = useState("staff");

  useEffect(() => {
    setAdminName(localStorage.getItem("admin_name") || "Admin");
    setAdminRole(localStorage.getItem("admin_role") || "staff");
  }, []);

  return (
    <header style={{
      height: 56,
      background: "var(--nav-bg)",
      borderBottom: "1px solid var(--border-color)",
      display: "flex",
      alignItems: "center",
      padding: isMobile ? "0 14px" : "0 24px",
      gap: 12,
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <button
        onClick={onMenuToggle}
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", padding: 6, borderRadius: 8, flexShrink: 0 }}
      >
        <Menu size={20} />
      </button>

      {isMobile && (
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>Admin Panel</p>
          <p style={{ fontSize: 10, color: "var(--text-secondary)" }}>Pinjaman Barakah</p>
        </div>
      )}

      {!isMobile && <div style={{ flex: 1 }} />}

      {/* Theme toggle */}
      <button
        onClick={onThemeToggle}
        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        style={{ background: "var(--bg-card-inner)", border: "1px solid var(--border-color)", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", padding: "6px 8px", borderRadius: 8, flexShrink: 0, gap: 5, fontSize: 11, fontWeight: 600 }}
      >
        {theme === "dark" ? <Sun size={16} color="#c9a84c" /> : <Moon size={16} />}
        {!isMobile && <span style={{ color: "var(--text-secondary)" }}>{theme === "dark" ? "Light" : "Dark"}</span>}
      </button>

      <button style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", padding: 6, borderRadius: 8, flexShrink: 0 }}>
        <Bell size={18} />
        <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, background: "#c9a84c", borderRadius: "50%", border: "1.5px solid var(--nav-bg)" }} />
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 10, padding: isMobile ? "5px 8px" : "6px 10px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 10, cursor: "pointer", flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, background: "rgba(201,168,76,0.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#c9a84c", flexShrink: 0 }}>
          {adminName.charAt(0).toUpperCase()}
        </div>
        {!isMobile && (
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>{adminName}</p>
            <p style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "capitalize" }}>{adminRole}</p>
          </div>
        )}
      </div>
    </header>
  );
}
