@AGENTS.md

# Loan Panel — Project Context

## Struktur Monorepo

```
loan-panel/           ← repo root
├── client/           → pinjamanbarakah.my (Next.js, client panel)
├── admin/            → backend.pinjamanbarakah.my (Next.js, admin dashboard)
├── api/              → shared backend API (Express.js + TypeScript)
├── CLAUDE.md
└── AGENTS.md
```

Run dev servers:
- Client: `cd client && npm run dev` → http://localhost:3000
- Admin:  `cd admin && npm run dev`  → http://localhost:3001
- API:    `cd api && npm run dev`    → http://localhost:4000

## Tech Stack

### Client & Admin (Next.js)
- Next.js 16 (TypeScript, App Router, `src/` dir, `@/*` alias)
- Tailwind CSS v4
- lucide-react
- Node.js v24

### API (Express)
- Express.js + TypeScript
- `tsx watch` for dev (no compile step)
- mysql2 + bcryptjs + jsonwebtoken + express-validator
- `npm run build` → compiles to `dist/`

### Database
- MySQL (Laragon lokal: `D:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe`)
- Database: `loan_panel`
- Schema: `api/schema.sql`

---

## Design System

**Tema: Hitam & Gold**

### Client (mobile-first, max-width 430px)
CSS variables (`client/src/app/globals.css`):
- `--bg-primary: #080808`
- `--bg-secondary: #0f0f0f`
- `--bg-card: #161616`
- `--bg-card-inner: #1e1e1e`
- `--accent-blue: #c9a84c` ← GOLD, bukan biru (kept for compat)
- `--accent-blue-light: #e2c060`
- `--accent-blue-hover: #a88a38`
- `--accent-green: #22c55e`
- `--accent-gold: #c9a84c`
- `--text-secondary: #888888`
- `--text-muted: #484848`
- `--border-color: #242424`
- `--border-light: #2e2e2e`
- Font: Plus Jakarta Sans (Google Fonts)

**Penting:** `--accent-blue` mengandungi nilai GOLD — disengajakan untuk keserasian.
Gold rgba: `rgba(201,168,76,...)` — gunakan ini, bukan `rgba(59,109,255,...)`

### Admin (desktop-first, full width)
- Sidebar kiri fixed (collapsible), header top
- CSS variables dalam `admin/src/app/globals.css` (sama tema hitam & gold)
- Background admin: `#0c0c0c` sidebar, `#080808` main, `#111` cards

---

## Database Schema (`api/schema.sql`)

### Table: `users`
| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| name | VARCHAR(255) | |
| ic | VARCHAR(20) UNIQUE | Kad Pengenalan |
| phone | VARCHAR(20) UNIQUE | Format `01xxxxxxxx` (normalized) |
| email | VARCHAR(255) UNIQUE | Untuk admin/staff login |
| password | VARCHAR(255) | bcrypt hash |
| role | ENUM('client','staff','admin') | DEFAULT 'client' |
| is_active | TINYINT(1) | DEFAULT 1 |
| status | ENUM('pending','active','rejected') | DEFAULT 'pending' |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### Table: `settings`
Key-value store. Keys: `company_name`, `company_tagline`, `logo_url`, `favicon_url`, `support_phone`, `support_whatsapp`

### Seed admin default
- Email: `admin@pinjamanbarakah.my`
- Password: `Admin@1234`

---

## API Endpoints (`api/src/`)

Base URL lokal: `http://localhost:4000`

### Auth (`/auth`)
| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/auth/login` | — | `{ phone, password }` atau `{ email, password }` |
| POST | `/auth/register` | — | Client sahaja, status → `pending` |
| GET | `/auth/me` | JWT | Info user semasa |

### Settings (`/settings`)
| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/settings` | — | Public, returns key-value object |
| PUT | `/settings` | JWT admin/staff | `{ settings: { key: value } }` |

### Users/Members (`/users`)
| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/users` | JWT admin/staff | Query: `?status=pending\|active\|rejected\|all`, `?search=` |
| GET | `/users/:id` | JWT admin/staff | Single client detail |
| PUT | `/users/:id` | JWT admin/staff | Edit `{ name, phone, ic, status }` |
| DELETE | `/users/:id` | JWT admin only | Delete client |
| PUT | `/users/:id/approve` | JWT admin/staff | Set status → `active` (must be pending) |
| PUT | `/users/:id/reject` | JWT admin/staff | Set status → `rejected` (must be pending) |

### Auth logic
- Login dengan `phone` → role mesti `client`
- Login dengan `email` → role mesti `admin` atau `staff`
- Status `pending` → 403 "Akaun anda belum diverifikasi. Sila hubungi Khidmat Pelanggan."
- Status `rejected` → 403 "Permohonan akaun anda telah ditolak."
- JWT payload: `{ id, name, role }`

---

## Client (`client/src/`)

### Pages
| Route | File | Status |
|---|---|---|
| `/` | `app/page.tsx` | Redirect → `/sign-in` |
| `/sign-in` | `app/sign-in/page.tsx` | ✅ Connect ke API |
| `/register` | `app/register/page.tsx` | ✅ Wishlist flow (pending approval) |
| `/dashboard` | `app/dashboard/page.tsx` | ✅ Guna settings context |
| `/dashboard/wallet` | `app/dashboard/wallet/page.tsx` | UI sahaja |
| `/dashboard/account` | `app/dashboard/account/page.tsx` | ✅ Logout berfungsi |
| `/dashboard/support` | `app/dashboard/support/page.tsx` | UI sahaja |

### Components & Lib
- `src/components/BottomNav.tsx` — 4-tab bottom nav
- `src/components/CompanyLogo.tsx` — Dynamic logo (guna `logo_url` dari settings; fallback ke gold bar chart)
- `src/context/SettingsContext.tsx` — Fetch `/settings` sekali, provide ke semua pages. Update favicon dinamik.
- `src/lib/phone.ts` — `normalizePhone()` + `validatePhone()` shared utility
- `src/lib/utils.ts` — shadcn cn()

### Phone Normalization (client + API)
Terima: `01x`, `1x`, `+60x`, `60x` → normalize ke `01xxxxxxxx`
Minimum: 5 digit selepas normalisasi

### localStorage keys (client)
- `token` — JWT
- `user_name` — nama user
- `user_phone` — nombor telefon

### Register flow
1. User daftar → API simpan dengan `status='pending'`
2. Tiada token diberikan — redirect ke success page
3. Admin approve di admin dashboard → status jadi `active`
4. Baru boleh login

---

## Admin (`admin/src/`)

### Layout
- `app/dashboard/layout.tsx` — Sidebar + Header, redirect ke `/login` jika tiada token
- Sidebar collapsible, sub-menus untuk Admin Management dan Loans

### Pages
| Route | File | Status |
|---|---|---|
| `/login` | `app/login/page.tsx` | ✅ Connect ke API |
| `/dashboard` | `app/dashboard/page.tsx` | Redirect → `/dashboard/console` |
| `/dashboard/console` | `app/dashboard/console/page.tsx` | ✅ Stats + recent loans (mock data) |
| `/dashboard/admin-management/admin-list` | `...page.tsx` | ✅ UI + mock data |
| `/dashboard/admin-management/admin-log` | `...page.tsx` | ✅ UI + mock data |
| `/dashboard/withdrawal` | `app/dashboard/withdrawal/page.tsx` | 🔲 Skeleton (struktur jadual belum diset) |
| `/dashboard/loans/orderer` | `app/dashboard/loans/orderer/page.tsx` | 🔲 Skeleton (struktur jadual belum diset) |
| `/dashboard/member/member-list` | `app/dashboard/member/member-list/page.tsx` | ✅ Connect ke API (search, filter, view, edit, delete) |
| `/dashboard/member/member-approval` | `app/dashboard/member/member-approval/page.tsx` | ✅ Connect ke API (approve/reject pending) |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | ✅ Connect ke API (GET+PUT /settings) |

### Components
- `src/components/Sidebar.tsx` — Collapsible sidebar dengan sub-menus (termasuk Member)
- `src/components/Header.tsx` — Top bar dengan admin name + bell
- `src/components/StatsCard.tsx` — Card statistik untuk console

### localStorage keys (admin)
- `admin_token` — JWT
- `admin_role` — 'admin' atau 'staff'
- `admin_name` — nama admin

---

## Environment Files

### `client/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### `admin/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### `api/.env`
```
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=loan_panel
JWT_SECRET=dev_secret_tukar_di_production_12345
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=https://pinjamanbarakah.my
ADMIN_ORIGIN=https://backend.pinjamanbarakah.my
```

---

## Deployment Architecture

**Platform:** AAPanel
**2 Domain, 1 Database:**

| Domain | Folder | Port |
|---|---|---|
| `pinjamanbarakah.my` | `client/` | 3000 |
| `backend.pinjamanbarakah.my` | `admin/` | 3001 |
| `api.pinjamanbarakah.my` | `api/` | 4000 |

Tukar `.env.local` kedua-dua client & admin kepada `NEXT_PUBLIC_API_URL=https://api.pinjamanbarakah.my` untuk production.

---

## Fitur Belum Dibuat / TODO

### Admin Dashboard
- [ ] Console: Connect ke API sebenar (sekarang mock data)
- [ ] Admin List: CRUD sebenar (tambah/edit/padam admin)
- [ ] Admin Log: Connect ke API (perlu buat log table di DB)
- [ ] Withdrawal Records: Definisi jadual + CRUD
- [ ] Loans/Orderer: Definisi jadual + approve/reject pinjaman
- [x] Member List: Senarai client, search, filter, view detail, edit, delete ✅
- [x] Member Approval: Approve/reject pendaftaran pending ✅

### Client
- [ ] Halaman Personal Info, Change Password
- [ ] Apply Now / permohonan pinjaman
- [ ] Multilanguage toggle (Melayu / English / Chinese)
- [ ] Dashboard guna data sebenar dari API (sekarang sebahagian mock)

### API
- [ ] Admin log middleware (catat semua action admin ke DB)
- [ ] Loans endpoints
- [ ] Withdrawal endpoints
- [x] User management endpoints (GET/PUT/DELETE /users, approve/reject) ✅

## Bahasa
- UI dalam Bahasa Melayu (utama) + English
- Istilah: Nombor Telefon, Kata Laluan, Daftar, Log Masuk, Dompet, Akaun
