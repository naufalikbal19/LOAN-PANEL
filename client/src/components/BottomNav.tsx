"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Headphones, User } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: "/dashboard",         icon: Home,       label: t("nav_home") },
    { href: "/dashboard/wallet",  icon: Wallet,     label: t("nav_wallet") },
    { href: "/dashboard/support", icon: Headphones, label: t("nav_support") },
    { href: "/dashboard/account", icon: User,       label: t("nav_account") },
  ];

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
