@AGENTS.md

# Loan Panel — Project Context

Projek panel pinjaman untuk syarikat lending Malaysia. UI dirujuk dari https://apps.mysolutionlending.com/

## Tech Stack
- Next.js (TypeScript, App Router, `src/` dir, `@/*` alias)
- Tailwind CSS v4
- shadcn/ui — Nova preset (Radix + Lucide icons + Geist font)
- lucide-react + framer-motion
- Node.js v24

## Design System

**Tema: Hitam & Gold (mobile-first, max-width 430px)**

CSS variables (globals.css):
- `--bg-primary: #080808`
- `--bg-secondary: #0f0f0f`
- `--bg-card: #161616`
- `--bg-card-inner: #1e1e1e`
- `--accent-blue: #c9a84c` (gold — main accent, variable name kept for compatibility)
- `--accent-blue-light: #e2c060`
- `--accent-blue-hover: #a88a38`
- `--accent-green: #22c55e`
- `--accent-gold: #c9a84c`
- `--text-secondary: #888888`
- `--text-muted: #484848`
- `--border-color: #242424`
- `--border-light: #2e2e2e`
- `--nav-bg: #0c0c0c`
- Font: Plus Jakarta Sans (Google Fonts)

**Penting:** Warna accent utama adalah GOLD (`#c9a84c`), bukan biru. Variable `--accent-blue` mengandungi nilai gold — ini disengajakan untuk keserasian.

Hardcoded colors yang digunakan dalam components:
- Gradient cards: `linear-gradient(135deg,#1a1a1a 0%,#0a0a0a 100%)`
- Gold rgba: `rgba(201,168,76,...)` — gunakan ini, bukan `rgba(59,109,255,...)`

## Halaman yang Sudah Dibuat

| Route | File | Nama |
|---|---|---|
| `/` | `src/app/page.tsx` | Redirect ke `/sign-in` |
| `/sign-in` | `src/app/sign-in/page.tsx` | Login (Nombor Telefon + Kata Laluan) |
| `/register` | `src/app/register/page.tsx` | Daftar (Nama, IC, Telefon, Password) |
| `/dashboard` | `src/app/dashboard/page.tsx` | Laman Utama |
| `/dashboard/wallet` | `src/app/dashboard/wallet/page.tsx` | Dompet |
| `/dashboard/account` | `src/app/dashboard/account/page.tsx` | SAYA (My Account) |
| `/dashboard/support` | `src/app/dashboard/support/page.tsx` | Perkhidmatan Pelanggan |

## Components

- `src/components/BottomNav.tsx` — 4-tab bottom nav (Laman Utama, Dompet, Sokongan, Saya)
- `src/components/ui/button.tsx` — shadcn button
- `src/lib/utils.ts` — shadcn utils

## Custom CSS Classes (globals.css)

`.card`, `.btn-primary`, `.btn-outline`, `.input-field`, `.input-label`, `.bottom-nav`, `.nav-item`, `.badge-verified`, `.badge-excellent`, `.badge-available`, `.menu-item`, `.menu-item-left`, `.menu-icon-box`, `.apply-btn`, `.payment-grid`, `.payment-item`, `.payment-logo`, `.info-banner`, `.page-header`, `.page-title`, `.page-subtitle`, `.section-label`, `.app-shell`, `.page-content`

Animations: `.animate-fade-in-up`, `.animate-delay-1` hingga `.animate-delay-5`

## Layout Structure

```
layout.tsx
  <html>
    <body>
      <div class="app-shell">   ← max-width 430px, centered
        {children}
      </div>
    </body>
  </html>

dashboard/layout.tsx
  <div class="page-content">   ← padding-bottom 90px (space for BottomNav)
    {children}
  </div>
  <BottomNav />
```

## Bahasa
- UI dalam Bahasa Melayu (utama) + English
- Istilah: Nombor Telefon, Kata Laluan, Daftar, Log Masuk, Dompet, Akaun

## Deployment Architecture

**Platform:** AAPanel
**2 Domain, 1 Database dikongsi:**

| Domain | Fungsi |
|---|---|
| `pinjamanbarakah.my` | Client-facing panel (projek ini) |
| `backend.pinjamanbarakah.my` | Staff / Admin dashboard (projek berasingan) |

**Implikasi untuk Backend API:**
- Gunakan **1 API** yang dikongsi oleh kedua frontend — bukan 2 API berasingan
- Auth berbasis **JWT dengan field `role`**: `client` vs `staff` / `admin`
- **CORS** mesti allow kedua-dua domain
- Rancang endpoint supaya boleh serve keperluan client **dan** admin
- Admin dashboard adalah projek Next.js berasingan atau dalam monorepo

## Fitur Belum Dibuat (potential next steps)
- Halaman-halaman dalam menu Account (Personal Info, Change Password, dll)
- Fungsi Apply Now / permohonan pinjaman
- Backend / auth sebenar
- Multilanguage toggle (Melayu / English / Chinese)
