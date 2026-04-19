import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Panel — Pinjaman Barakah",
  description: "Portal Pentadbir Pinjaman Barakah",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
