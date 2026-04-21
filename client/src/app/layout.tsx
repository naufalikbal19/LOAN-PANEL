import type { Metadata } from "next";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "Pinjaman Barakah",
  description: "Pinjaman peribadi terbaik untuk anda",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <SettingsProvider>
            <div className="app-shell">{children}</div>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
