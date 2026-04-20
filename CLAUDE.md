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
- Semua modal guna inline style (bukan Tailwind) — `background: "#111"`, border `#2e2e2e`

---

## Database Schema (`api/schema.sql`)

### Table: `users`
| Column | Type | Default | Notes |
|---|---|---|---|
| id | INT PK AUTO_INCREMENT | — | UID ahli, diformat `#0001` di UI |
| name | VARCHAR(255) | — | Nama penuh |
| ic | VARCHAR(20) UNIQUE | — | Kad Pengenalan |
| phone | VARCHAR(20) UNIQUE | — | Format `01xxxxxxxx` (normalized) |
| email | VARCHAR(255) UNIQUE | — | Untuk admin/staff login sahaja |
| password | VARCHAR(255) | — | bcrypt hash |
| role | ENUM('client','staff','admin') | 'client' | |
| is_active | TINYINT(1) | 1 | |
| status | ENUM('pending','active','rejected') | 'pending' | Status pendaftaran |
| member_status | ENUM('normal','suspended','blocked') | 'normal' | Status operasi akaun |
| credit_score | INT | 500 | Maks 600 |
| withdrawal_password | VARCHAR(10) | NULL | 6-digit, auto-generate semasa register |
| balance | DECIMAL(15,2) | 3000 | Default RM 3000 |
| ip_client | VARCHAR(45) | NULL | IP dicatat semasa register |
| avatar | TEXT | NULL | URL gambar profil |
| level | INT | 1 | |
| gender | ENUM('male','female','other') | NULL | |
| bank | VARCHAR(100) | NULL | |
| no_rekening | VARCHAR(50) | NULL | |
| birthday | DATE | NULL | |
| loan_purpose | VARCHAR(255) | NULL | |
| monthly_income | DECIMAL(15,2) | NULL | |
| current_address | TEXT | NULL | |
| motto | TEXT | NULL | |
| points | INT | 0 | |
| consecutive_login_days | INT | 0 | |
| number_of_failures | INT | 0 | |
| created_at | TIMESTAMP | CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

### Table: `loans`
| Column | Type | Default | Notes |
|---|---|---|---|
| id | INT PK AUTO_INCREMENT | — | Order Number, diformat `#ORD-00001` di UI |
| user_id | INT FK | — | References users.id |
| amount | DECIMAL(15,2) | 0 | Jumlah pinjaman |
| loan_terms | VARCHAR(50) | NULL | Tempoh, cth: "12 Bulan" |
| bank | VARCHAR(100) | NULL | |
| no_rekening | VARCHAR(50) | NULL | |
| sign_url | TEXT | NULL | URL gambar tanda tangan |
| front_ic_url | TEXT | NULL | URL gambar IC depan |
| back_ic_url | TEXT | NULL | URL gambar IC belakang |
| selfie_url | TEXT | NULL | URL gambar selfie |
| keterangan | TEXT | NULL | Nota/keterangan status, auto-fill dari settings template |
| status | ENUM(...) | 'under_review' | Lihat nilai di bawah |
| created_at | TIMESTAMP | CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE | |

**Loan status values:** `under_review`, `loan_approved`, `credit_frozen`, `unfrozen_processing`, `credit_score_low`, `payment_processing`, `loan_being_canceled`

### Table: `admin_logs`
| Column | Type | Notes |
|---|---|---|
| id | INT PK | |
| admin_id | INT FK | References users.id |
| admin_name | VARCHAR(255) | |
| action | VARCHAR(255) | |
| target | VARCHAR(255) | |
| ip_address | VARCHAR(45) | |
| created_at | TIMESTAMP | |

### Table: `settings`
Key-value store. Keys yang dibenarkan:
- `company_name`, `company_tagline`, `logo_url`, `favicon_url`, `support_phone`, `support_whatsapp`
- `keterangan_under_review`, `keterangan_loan_approved`, `keterangan_credit_frozen`
- `keterangan_unfrozen_processing`, `keterangan_credit_score_low`
- `keterangan_payment_processing`, `keterangan_loan_being_canceled`

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
| POST | `/auth/register` | — | Client sahaja → status `pending`, auto-gen `withdrawal_password` (6 digit), catat `ip_client` |
| GET | `/auth/me` | JWT | Info user semasa |

### Settings (`/settings`)
| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/settings` | — | Public, returns key-value object |
| PUT | `/settings` | JWT admin/staff | `{ settings: { key: value } }` |

### Users/Members (`/users`)
| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/users` | JWT admin/staff | Query: `?status=all\|pending\|active\|rejected`, `?search=` — returns semua kolum termasuk `pending_loans` (subquery COUNT) |
| GET | `/users/:id` | JWT admin/staff | Single client detail |
| PUT | `/users/:id` | JWT admin/staff | Edit semua medan termasuk `new_password` (bcrypt auto-hash), `member_status`, `credit_score`, `balance`, dll |
| DELETE | `/users/:id` | JWT admin only | Delete client |
| PUT | `/users/:id/approve` | JWT admin/staff | Set status → `active` |
| PUT | `/users/:id/reject` | JWT admin/staff | Set status → `rejected` |

### Loans (`/loans`)
| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/loans` | JWT admin/staff | Query: `?status=`, `?search=` — JOIN dengan users (ambil `name`, `phone`, `ic`) |
| GET | `/loans/:id` | JWT admin/staff | Single loan detail |
| PUT | `/loans/:id` | JWT admin/staff | Edit semua medan; jika `phone` berubah → update `users.phone`; jika `ic` dihantar → update `users.ic` |
| DELETE | `/loans/:id` | JWT admin only | Delete loan record |
| PUT | `/loans/:id/status` | JWT admin/staff | Update status sahaja |

### Auth logic
- Login dengan `phone` → role mesti `client`
- Login dengan `email` → role mesti `admin` atau `staff`
- Status `pending` → 403 dengan code `PENDING`
- Status `rejected` → 403 dengan code `REJECTED`
- JWT payload: `{ id, name, role }`

---

## Client (`client/src/`)

### Pages
| Route | File | Status |
|---|---|---|
| `/` | `app/page.tsx` | Redirect → `/sign-in` |
| `/sign-in` | `app/sign-in/page.tsx` | ✅ Connect ke API |
| `/register` | `app/register/page.tsx` | ✅ Isi: nama, IC, telefon, password → status `pending` |
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
1. User isi: nama lengkap, IC, nombor telefon, password
2. API auto-generate `withdrawal_password` (6 digit random), catat `ip_client`, `balance` default RM 3000
3. Status → `pending`, tiada token — redirect ke success page
4. Admin approve di admin dashboard → status jadi `active`
5. Baru boleh login

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
| `/dashboard/console` | `app/dashboard/console/page.tsx` | ✅ Stats (mock data) |
| `/dashboard/admin-management/admin-list` | `...page.tsx` | ✅ UI + mock data |
| `/dashboard/admin-management/admin-log` | `...page.tsx` | ✅ UI + mock data |
| `/dashboard/withdrawal` | `app/dashboard/withdrawal/page.tsx` | ✅ Full CRUD — GET/PUT `/loans`, kolum: UID, Nombor HP, Nominal, Bank, No. Rekening, Tanggal, Status |
| `/dashboard/loans/orderer` | `app/dashboard/loans/orderer/page.tsx` | ✅ Full CRUD — kolum: Order No., Username, Phone, UID, Loan Amount, Loan Terms, Sign, Application Time, Status. View/Edit modal lengkap + keterangan auto-fill dari settings template |
| `/dashboard/member/member-list` | `app/dashboard/member/member-list/page.tsx` | ✅ Semua status (filter dropdown), 23+ medan di View & Edit modal, password boleh ditukar, reg status badge |
| `/dashboard/member/member-approval` | `app/dashboard/member/member-approval/page.tsx` | ✅ UID column, approve/reject pending |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | ✅ Maklumat syarikat + logo + sokongan + **7 template keterangan pinjaman** |

### UID Format Convention
- **User UID**: `#${String(id).padStart(4, "0")}` → `#0001`
- **Loan Order Number**: `#ORD-${String(id).padStart(5, "0")}` → `#ORD-00001`
- Format ini konsisten merentas semua menu (Member List, Withdrawal Records, Loans Orderer, Member Approval)

### Member List — Medan View/Edit Modal
View modal (read-only): UID, Nama Lengkap, IC, Gender, Birthday, Phone Number, IP Client, Current Address, Login Password (tersembunyi ••••••••), Withdrawal Password, Credit Score, Balance, Points, Level, Consecutive Login Days, Number of Failures, Pending Approval, Bank, Nomor Rekening, Monthly Income, Loan Purpose, Motto, Avatar, Status (member_status)

Edit modal (semua boleh diedit kecuali UID): sama seperti atas + Password Baru (kosong = tidak berubah), member_status radio (Normal/Suspended/Blocked)

### Loans Orderer — Keterangan Auto-fill
- Edit modal: apabila admin klik mana-mana status, medan Keterangan auto-diisi dengan template dari `/settings`
- Template boleh dikonfigurasikan di Settings page → "Template Keterangan Pinjaman"
- Staff boleh edit keterangan secara manual selepas auto-fill

### Loans Orderer — Dokumen Gambar
View modal paparkan 4 gambar dalam grid 2×2:
- Tanda Tangan (`sign_url`)
- Front IC (`front_ic_url`)
- Back IC (`back_ic_url`)
- Selfie (`selfie_url`)

Edit modal: 4 input URL dengan preview gambar kecil

### Components
- `src/components/Sidebar.tsx` — Collapsible sidebar dengan sub-menus (Member, Loans)
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
- [ ] Console: Connect ke API sebenar (sekarang mock data — stats & recent loans)
- [ ] Admin List: CRUD sebenar (tambah/edit/padam admin/staff)
- [ ] Admin Log: Connect ke API (admin_logs table sudah ada)
- [x] Withdrawal Records: ✅ Full CRUD connected ke `/loans`
- [x] Loans/Orderer: ✅ Full CRUD + keterangan auto-fill + dokumen gambar
- [x] Member List: ✅ 23+ medan, view/edit/delete, password change
- [x] Member Approval: ✅ Approve/reject dengan UID
- [x] Settings: ✅ Syarikat + logo + sokongan + keterangan templates

### Client
- [ ] Halaman Personal Info (view/edit profil)
- [ ] Change Password
- [ ] Apply Now — borang permohonan pinjaman (mencipta rekod `loans` dengan status `under_review`; termasuk upload tanda tangan virtual, gambar IC depan/belakang, selfie)
- [ ] Paparan status pinjaman di dashboard (semak `keterangan` dari API)
- [ ] Multilanguage toggle (Melayu / English / Chinese)
- [ ] Dashboard guna data sebenar dari API (sekarang sebahagian mock)

### API
- [ ] Loans — endpoint untuk client (submit permohonan, semak status sendiri)
- [ ] Upload gambar (sign, IC, selfie) — perlu storage solution (local atau S3/Cloudinary)
- [x] User management endpoints ✅
- [x] Loans admin endpoints ✅
- [x] Settings keterangan templates ✅

## Bahasa
- UI dalam Bahasa Melayu (utama) + English
- Istilah: Nombor Telefon, Kata Laluan, Daftar, Log Masuk, Dompet, Akaun, Pinjaman, Pengeluaran

## Penting — Konsistensi Data Antara Menu
Semua menu (Member List, Withdrawal Records, Loans Orderer, Member Approval) menggunakan data dari **table yang sama** (`users` dan `loans`) melalui API. Perubahan di satu menu automatik tercermin di menu lain — tiada data duplikasi.

- Phone Number pada Withdrawal Records & Orderer diambil JOIN dari `users.phone`
- Jika admin edit phone di Orderer/Withdrawal → `users.phone` dikemaskini terus
- UID (`users.id`) adalah rujukan universal merentas semua menu
