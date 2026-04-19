import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Money Lending Sdn Bhd",
  description: "Pinjaman peribadi terbaik untuk anda",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}