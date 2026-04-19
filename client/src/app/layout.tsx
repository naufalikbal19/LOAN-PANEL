import type { Metadata } from "next";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";

export const metadata: Metadata = {
  title: "Pinjaman Barakah",
  description: "Pinjaman peribadi terbaik untuk anda",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SettingsProvider>
          <div className="app-shell">{children}</div>
        </SettingsProvider>
      </body>
    </html>
  );
}
