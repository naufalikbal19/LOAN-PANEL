"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Headphones, User } from "lucide-react";

const navItems = [
  { href: "/dashboard",          icon: Home,       label: "Laman Utama" },
  { href: "/dashboard/wallet",   icon: Wallet,     label: "Dompet" },
  { href: "/dashboard/support",  icon: Headphones, label: "Sokongan" },
  { href: "/dashboard/account",  icon: User,       label: "Saya" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link key={href} href={href} className={`nav-item ${isActive ? "active" : ""}`}>
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
