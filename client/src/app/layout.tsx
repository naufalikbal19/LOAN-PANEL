import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "Pinjaman Barakah",
  description: "Pinjaman peribadi terbaik untuk anda",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Pinjaman Barakah" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#080808",
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
