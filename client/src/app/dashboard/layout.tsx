"use client";
import BottomNav from "@/components/BottomNav";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Tukar ke Light Mode" : "Tukar ke Dark Mode"}
      style={{
        position: "fixed",
        top: 16,
        right: "max(16px, calc(50vw - 199px))",
        zIndex: 200,
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "var(--accent-blue)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
        transition: "all 0.2s",
      }}
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeToggle />
      <div className="page-content">{children}</div>
      <BottomNav />
    </>
  );
}
