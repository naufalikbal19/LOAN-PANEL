import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import ScreenProtect from "@/components/ScreenProtect";

export const metadata: Metadata = {
  title: "Pinjaman Barakah",
  description: "Pinjaman peribadi terbaik untuk anda",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Pinjaman Barakah" },
  formatDetection: { telephone: false },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#080808",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <SettingsProvider>
              <ScreenProtect />
              <div className="app-shell">{children}</div>
            </SettingsProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
