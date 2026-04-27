@AGENTS.md

# Loan Panel — Project Context

## Struktur Monorepo

```
loan-panel/           ← repo root
├── client/           → apps.easyloans.my (Next.js, client panel)
├── admin/            → backend.easyloans.my (Next.js, admin dashboard)
├── api/              → api.easyloans.my (Express.js + TypeScript)
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
| balance | DECIMAL(15,2) | 0 | Default 0 — bertambah bila loan apply (= loan amount), jadi 0 selepas withdraw |
| ip_client | VARCHAR(45) | NULL | IP dicatat semasa register |
| avatar | TEXT | NULL | URL gambar profil |
| level | INT | 1 | |
| gender | ENUM('male','female','other') | NULL | |
| bank | VARCHAR(100) | NULL | |
| no_rekening | VARCHAR(50) | NULL | |
| account_name | VARCHAR(100) | NULL | Nama pemegang kad bank (tambah via migration.sql) |
| birthday | DATE | NULL | |
| occupation | VARCHAR(100) | NULL | Pekerjaan semasa (tambah via migration.sql) |
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
| emergency_name | VARCHAR(100) | NULL | Nama kenalan kecemasan (tambah via migration.sql) |
| emergency_phone | VARCHAR(20) | NULL | Telefon kenalan kecemasan (tambah via migration.sql) |
| account_name | VARCHAR(100) | NULL | Nama pemegang kad bank (tambah via migration.sql) |
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

### Table: `transactions`
| Column | Type | Default | Notes |
|---|---|---|---|
| id | INT PK AUTO_INCREMENT | — | |
| user_id | INT FK | — | References users.id |
| type | ENUM('withdrawal','credit','debit','adjustment') | 'withdrawal' | |
| amount | DECIMAL(15,2) | — | |
| description | VARCHAR(255) | NULL | |
| created_at | TIMESTAMP | CURRENT_TIMESTAMP | |

### Table: `messages`
| Column | Type | Default | Notes |
|---|---|---|---|
| id | INT PK AUTO_INCREMENT | — | |
| user_id | INT FK | — | References users.id ON DELETE CASCADE |
| title | VARCHAR(255) | — | Tajuk mesej |
| content | TEXT | — | Kandungan mesej |
| is_read | TINYINT(1) | 0 | 0 = belum dibaca, 1 = dibaca |
| created_at | TIMESTAMP | CURRENT_TIMESTAMP | |

### Table: `settings`
Key-value store. Keys yang dibenarkan:
- `company_name`, `company_tagline`, `logo_url`, `favicon_url`, `support_phone`, `support_whatsapp`
- `keterangan_under_review`, `keterangan_loan_approved`, `keterangan_credit_frozen`
- `keterangan_unfrozen_processing`, `keterangan_credit_score_low`
- `keterangan_payment_processing`, `keterangan_loan_being_canceled`
- **Tema Dark Mode (12 keys):** `dark_accent`, `dark_bg_primary`, `dark_bg_secondary`, `dark_bg_card`, `dark_bg_card_inner`, `dark_text_primary`, `dark_text_secondary`, `dark_text_muted`, `dark_border_color`, `dark_border_light`, `dark_nav_bg`, `dark_bg_image`
- **Tema Light Mode (12 keys):** `light_accent`, `light_bg_primary`, `light_bg_secondary`, `light_bg_card`, `light_bg_card_inner`, `light_text_primary`, `light_text_secondary`, `light_text_muted`, `light_border_color`, `light_border_light`, `light_nav_bg`, `light_bg_image`

### Seed admin default
- Email: `admin@easyloans.my`
- Password: `Admin@1234`

---

## API Endpoints (`api/src/`)

Base URL lokal: `http://localhost:4000`

### Auth (`/auth`)
| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/auth/login` | — | `{ phone, password }` atau `{ email, password }` |
| POST | `/auth/register` | — | Client sahaja → status `pending`, auto-gen `withdrawal_password` (6 digit), catat `ip_client` |
| GET | `/auth/me` | JWT | Info user semasa (termasuk `occupation`, `gender`, `birthday`, dll) |
| PUT | `/auth/profile` | JWT client | Kemaskini profil sendiri (balance default 0 semasa register): `name, ic, gender, birthday, occupation, monthly_income, loan_purpose, current_address`. Birthday format masuk: `DD/MM/YYYY`, disimpan sebagai `YYYY-MM-DD` |

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
| GET | `/loans/stats` | JWT admin/staff | Stats untuk console: totals, problem, inprocess, approved, recent (5 terkini) |
| GET | `/loans/my` | JWT client | Senarai pinjaman sendiri (semua kolum termasuk `emergency_name`, `emergency_phone`, `account_name`, url gambar) |
| POST | `/loans/apply` | JWT client | Submit permohonan → status `under_review`. Set `users.balance = amount`, sync `bank`, `no_rekening`, `account_name` ke users |
| GET | `/loans` | JWT admin/staff | Query: `?status=`, `?search=` — JOIN dengan users (ambil `name`, `phone`, `ic`) |
| GET | `/loans/:id` | JWT admin/staff | Single loan detail |
| PUT | `/loans/:id` | JWT admin/staff | Edit semua medan termasuk `account_name`; jika `phone` berubah → update `users.phone`; jika `ic` dihantar → update `users.ic` |
| DELETE | `/loans/:id` | JWT admin only | Delete loan record |
| PUT | `/loans/:id/status` | JWT admin/staff | Update status sahaja |

### Upload (`/upload`)
| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/upload` | JWT | Upload satu imej (field: `file`). Max 5MB. Returns `{ url: "/uploads/filename.ext" }`. File disimpan di `api/uploads/`. URL penuh = `${API_URL}/uploads/filename.ext` |

Static files: `GET /uploads/:filename` — public, tanpa auth. Served dari folder `api/uploads/`.

### Transactions (`/transactions`)
| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/transactions/my` | JWT client | Senarai transaksi sendiri |
| POST | `/transactions/withdraw` | JWT client | Withdraw baki: verifikasi `withdrawal_password`, check `loan_approved`, deduct balance, insert transaction. Returns `{ amount }` |
| GET | `/transactions` | JWT admin/staff | Semua transaksi + user info. Query `?user_id=`, `?search=` |
| POST | `/transactions` | JWT admin/staff | Manual add transaction — **TIDAK** adjust `users.balance` (balance diedit manual oleh admin) |
| PUT | `/transactions/:id` | JWT admin/staff | Edit type/amount/description |
| DELETE | `/transactions/:id` | JWT admin/staff | Delete transaction |

**Withdraw rules:** hanya boleh jika ada loan dengan status `loan_approved` DAN `users.balance > 0`. Balance menjadi 0 selepas withdraw.

### Messages (`/messages`)
| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/messages/my` | JWT client | Senarai mesej sendiri, terurut terkini |
| PUT | `/messages/my/:id/read` | JWT client | Tandakan mesej sebagai dibaca |
| GET | `/messages` | JWT admin/staff | Semua mesej + user info (JOIN users) |
| POST | `/messages` | JWT admin/staff | Hantar mesej: `{ user_id, title, content }` atau `{ broadcast: true, title, content }` untuk semua ahli aktif |
| DELETE | `/messages/:id` | JWT admin/staff | Padam mesej |

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
| `/dashboard` | `app/dashboard/page.tsx` | ✅ Data sebenar dari API — papar status & jumlah pinjaman terkini |
| `/dashboard/wallet` | `app/dashboard/wallet/page.tsx` | ✅ Balance sebenar dari API + sejarah pinjaman |
| `/dashboard/apply` | `app/dashboard/apply/page.tsx` | ✅ Borang 4 langkah: Pinjaman → Dokumen (upload IC+selfie) → Maklumat Pribadi → Tandatangan virtual |
| `/dashboard/account` | `app/dashboard/account/page.tsx` | ✅ Logout berfungsi |
| `/dashboard/account/personal-info` | `app/dashboard/account/personal-info/page.tsx` | ✅ View profil + dokumen pinjaman (IC, selfie) |
| `/dashboard/account/change-password` | `app/dashboard/account/change-password/page.tsx` | ✅ Redirect ke khidmat pelanggan (WhatsApp/Telefon dari settings) |
| `/dashboard/account/withdrawal` | `app/dashboard/account/withdrawal/page.tsx` | ✅ Papar maklumat bank pengeluaran: nama bank, nombor akaun, **nama pemegang kad** |
| `/dashboard/account/transaction-history` | `app/dashboard/account/transaction-history/page.tsx` | ✅ Senarai transaksi + loan status events (merged & sorted by date) |
| `/dashboard/account/loan-contract` | `app/dashboard/account/loan-contract/page.tsx` | ✅ Page penuh kontrak pinjaman (nama, IC, jumlah, kadar, tandatangan) |
| `/dashboard/account/repayment` | `app/dashboard/account/repayment/page.tsx` | ✅ Butiran bayaran balik: jumlah, faedah, tempoh, tarikh bayaran seterusnya, status. Button → Loan Contract |
| `/dashboard/account/messages` | `app/dashboard/account/messages/page.tsx` | ✅ Senarai mesej dari admin. Unread badge + expand on tap + auto mark-as-read |
| `/dashboard/support` | `app/dashboard/support/page.tsx` | ✅ Papar maklumat sokongan dari settings |

### Apply Now — Flow (4 Langkah)
1. **Langkah 1 — Pinjaman**: Pilih jumlah (RM 3,000–200,000 slider), tempoh (6–120 bulan), bank, nombor akaun, **nama pemegang kad**
2. **Langkah 2 — Dokumen**: Upload Hadapan IC, Belakang IC, Selfie (imej, max 5MB each via `POST /upload`)
3. **Langkah 3 — Maklumat Pribadi**: Nama, IC, Jantina, Tarikh Lahir, Pekerjaan, Pendapatan, Tujuan Pinjaman, Alamat, Kenalan Kecemasan (auto-fill dari `/auth/me`)
4. **Langkah 4 — Tandatangan**: Canvas virtual signature → submit semua ke `PUT /auth/profile` + `POST /loans/apply`

### Theme System (Light/Dark Mode)
- Toggle button (☀/🌙) floating di sudut kanan atas setiap halaman dashboard
- State disimpan di `localStorage.theme` (`"dark"` atau `"light"`)
- Toggle menambah/buang class `.light` pada `<html>`
- CSS variables di `globals.css`: `:root {}` = dark mode, `.light {}` = light mode (background putih, teks hitam, gold lebih gelap)
- Context: `src/context/ThemeContext.tsx` — `useTheme()` hook → `{ theme, toggle }`

### Components & Lib
- `src/components/BottomNav.tsx` — 4-tab bottom nav
- `src/components/CompanyLogo.tsx` — Dynamic logo (guna `logo_url` dari settings; fallback ke gold bar chart)
- `src/context/SettingsContext.tsx` — Fetch `/settings` sekali, provide ke semua pages. Update favicon dinamik.
- `src/lib/api.ts` — `apiFetch<T>(path, init?)` helper: auto-attach JWT dari `localStorage.token`, throw on non-OK
- `src/lib/phone.ts` — `normalizePhone()` + `validatePhone()` shared utility
- `src/lib/utils.ts` — shadcn cn()

### Phone Normalization (client + API)
Terima: `01x`, `1x`, `+60x`, `60x` → normalize ke `01xxxxxxxx`
Minimum: 5 digit selepas normalisasi

### localStorage keys (client)
- `token` — JWT
- `user_name` — nama user
- `user_phone` — nombor telefon

### Wallet — Loan Details & Contract
- Wallet page papar **Butiran Pinjaman** card: order number, status badge, jumlah, tempoh, bank, no. akaun, tarikh mohon
- Button **View Contract** buka popup kontrak (putih, 85vh scrollable) dengan data sebenar (nama, IC, jumlah, kadar faedah 0.70%, bayaran bulanan, tandatangan `sign_url`)
- Bayaran bulanan dikira: `amount × (1 + 0.007 × months) / months`

### Register flow
1. User isi: nama lengkap, IC, nombor telefon, password
2. API auto-generate `withdrawal_password` (6 digit random), catat `ip_client`, `balance` default **0** (bukan 3000)
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
| `/dashboard/console` | `app/dashboard/console/page.tsx` | ✅ Stats sebenar dari `GET /loans/stats` — jumlah keseluruhan, bermasalah, dalam proses, diluluskan + 5 pinjaman terkini |
| `/dashboard/admin-management/admin-list` | `...page.tsx` | ✅ UI + mock data |
| `/dashboard/admin-management/admin-log` | `...page.tsx` | ✅ UI + mock data |
| `/dashboard/withdrawal` | `app/dashboard/withdrawal/page.tsx` | ✅ Full CRUD — GET/PUT `/loans`, kolum: UID, Nombor HP, Nominal, Bank, No. Rekening, Tanggal, Status. View/Edit modal termasuk **Nama Pemegang Kad** |
| `/dashboard/loans/orderer` | `app/dashboard/loans/orderer/page.tsx` | ✅ Full CRUD — kolum: Order No., Username, Phone, UID, Loan Amount, Loan Terms, Sign, Application Time, Status. View/Edit modal lengkap + keterangan auto-fill + **Nama Pemegang Kad** |
| `/dashboard/member/member-list` | `app/dashboard/member/member-list/page.tsx` | ✅ Semua status (filter dropdown), 24+ medan di View & Edit modal termasuk **Nama Pemegang Kad**, password boleh ditukar, reg status badge |
| `/dashboard/member/member-approval` | `app/dashboard/member/member-approval/page.tsx` | ✅ UID column, approve/reject pending |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | ✅ Maklumat syarikat + logo + sokongan + 7 template keterangan + **tema warna Dark/Light mode** (12 var setiap tema, color picker, **Reset ke Default button**, **live phone mockup preview**) |
| `/dashboard/transaction` | `app/dashboard/transaction/page.tsx` | ✅ CRUD sejarah transaksi semua klien — tambah/edit/padam, filter nama/telefon/UID, **searchable client picker** |
| `/dashboard/messages` | `app/dashboard/messages/page.tsx` | ✅ Hantar & urus mesej kepada ahli — send ke **Ahli Tertentu** (searchable picker) atau **Broadcast** semua ahli aktif. Table: unread dot, expand row, delete |

### UID Format Convention
- **User UID**: `#${String(id).padStart(4, "0")}` → `#0001`
- **Loan Order Number**: `#ORD-${String(id).padStart(5, "0")}` → `#ORD-00001`
- Format ini konsisten merentas semua menu (Member List, Withdrawal Records, Loans Orderer, Member Approval)

### Member List — Medan View/Edit Modal
View modal (read-only): UID, Nama Lengkap, IC, Gender, Birthday, Phone Number, IP Client, Current Address, Login Password (tersembunyi ••••••••), Withdrawal Password, Credit Score, Balance, Points, Level, Consecutive Login Days, Number of Failures, Pending Approval, Bank, Nomor Rekening, **Nama Pemegang Kad**, Monthly Income, Loan Purpose, Motto, Avatar, Status (member_status)

Edit modal (semua boleh diedit kecuali UID): sama seperti atas + Password Baru (kosong = tidak berubah), member_status radio (Normal/Suspended/Blocked)

**Nota:** `account_name` disimpan di `users` table dan disync dari `loans` table bila loan apply. Admin boleh edit dari Member List, Loans Orderer, atau Withdrawal Records — semua update table yang sama.

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

### Admin — Mobile Responsive
- **Sidebar**: Di layar < 768px, bertukar jadi drawer overlay (slide dari kiri). Hamburger di Header membukanya, backdrop atau ✕ menutupnya.
- **Header**: Di mobile, papar nama app di tengah; sembunyikan nama admin (hanya tunjuk inisial avatar).
- **Main content**: `marginLeft = 0` di mobile (tiada sidebar offset). Padding turun dari 28px → 14px.
- **Tables**: `min-width: 640px` pada mobile — scroll mendatar.
- **CSS class**: `admin-main` untuk responsive padding. Modal boleh dibuat bottom-sheet dengan class `admin-modal-overlay` + `admin-modal-inner`.

### Client — Native App Feel
- **Viewport**: `viewport-fit=cover` — sokong notch. `maximum-scale` dan `user-scalable` **DIBUANG** (menyebabkan iOS scroll block apabila ada `position: fixed` element).
- **Safe area insets**: Bottom nav + page content guna `env(safe-area-inset-bottom)` — iPhone X+, Android notch.
- **iOS input zoom fix**: Semua `input`/`textarea` `font-size: 16px` — Safari tidak zoom.
- **Touch targets**: Butang/nav item minimum 44px.
- **PWA**: `apple-mobile-web-app-capable`, `status-bar-style: black-translucent` — fullscreen bila save ke home screen.

### Components
- `src/components/Sidebar.tsx` — Collapsible desktop sidebar + mobile drawer overlay (backdrop + ✕ button)
- `src/components/Header.tsx` — Top bar responsive: full name di desktop, inisial avatar di mobile
- `src/components/StatsCard.tsx` — Card statistik untuk console

### localStorage keys (admin)
- `admin_token` — JWT
- `admin_role` — 'admin' atau 'staff'
- `admin_name` — nama admin

---

## Environment Files

### `client/.env.local`
```
# Lokal:
NEXT_PUBLIC_API_URL=http://localhost:4000
# Production (semasa di server):
NEXT_PUBLIC_API_URL=https://api.easyloans.my
```

### `admin/.env.local`
```
# Lokal:
NEXT_PUBLIC_API_URL=http://localhost:4000
# Production (semasa di server):
NEXT_PUBLIC_API_URL=https://api.easyloans.my
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
CLIENT_ORIGIN=https://apps.easyloans.my
ADMIN_ORIGIN=https://backend.easyloans.my
```

---

## Deployment Architecture

**Platform:** AAPanel (Linux VPS, ~961MB RAM + 4GB swap)
**3 Domain, 1 Database, 3 PM2 processes:**

| Domain | Folder | PM2 Name | Port |
|---|---|---|---|
| `apps.easyloans.my` | `client/` | `loan-client` | 3000 |
| `backend.easyloans.my` | `admin/` | `loan-admin` | 3001 |
| `api.easyloans.my` | `api/` | `loan-api` | 4000 |

Nginx reverse proxy di AAPanel — semua request diproxy ke port masing-masing. **Jangan** letak `location ~ .*\.(js|css)?$` atau static file rules untuk Next.js — biarkan Next.js serve sendiri melalui proxy.

### Update deployment (setiap kali ada perubahan):
```bash
git pull origin master

# API sahaja berubah:
cd api && npm install && pm2 restart loan-api

# Client berubah (RAM terhad — stop dulu):
pm2 stop loan-admin loan-api
cd client && npm install && NODE_OPTIONS="--max-old-space-size=512" npm run build
pm2 restart loan-client && pm2 restart loan-admin loan-api

# Schema DB berubah:
mysql -u loan_panel -p[password] loan_panel < api/migration.sql && pm2 restart loan-api
```

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
- [x] Settings: ✅ Syarikat + logo + sokongan + keterangan templates + tema warna Dark/Light (24 keys)
- [x] Transaction: ✅ CRUD transaksi semua klien + searchable client picker
- [x] Messages: ✅ Hantar mesej ke ahli tertentu atau broadcast; table dengan expand row
- [x] Mobile responsive: ✅ Sidebar drawer overlay pada mobile, header compact, padding responsive

### Client
- [x] Halaman Personal Info ✅ — view profil + dokumen IC/selfie dari pinjaman terkini
- [x] Change Password page ✅ — redirect ke khidmat pelanggan (WhatsApp/Telefon dari settings)
- [x] Apply Now ✅ — borang 4-langkah dengan upload dokumen + tandatangan virtual. Cegah pinjaman berganda.
- [x] Paparan status pinjaman di dashboard ✅ — data sebenar dari `/loans/my`
- [x] Dashboard data sebenar ✅ — balance, loan status, order number dari API
- [x] Wallet ✅ — balance, loan details card, View Contract popup, withdraw modal, sejarah transaksi & pinjaman
- [x] Withdrawal account page ✅ — maklumat bank dari users + loans
- [x] Transaction History ✅ — senarai transaksi + summary
- [x] Loan Contract ✅ — page penuh kontrak dengan data sebenar + tandatangan
- [x] Repayment ✅ — butiran bayaran + tarikh bayaran seterusnya (auto-10hb) + button View Contract
- [x] Messages ✅ — senarai mesej dari admin, unread badge, expand + auto mark-as-read
- [x] Mobile app feel ✅ — safe areas, iOS zoom fix, touch targets 44px, PWA meta, momentum scroll
- [ ] Multilanguage toggle (Melayu / English / Chinese)

### API
- [x] Client loan endpoints ✅ — `GET /loans/my`, `POST /loans/apply` (set balance = amount, cegah duplikat)
- [x] Upload gambar ✅ — `POST /upload` (multer, local storage di `api/uploads/`, max 5MB)
- [x] Client profile update ✅ — `PUT /auth/profile`
- [x] Transactions CRUD ✅ — `GET/POST/PUT/DELETE /transactions` (admin), `GET /transactions/my` + `POST /transactions/withdraw` (client)
- [x] Messages CRUD ✅ — `GET/POST/DELETE /messages` (admin, broadcast support), `GET /messages/my` + `PUT /messages/my/:id/read` (client)
- [x] User management endpoints ✅
- [x] Loans admin endpoints ✅
- [x] Settings tema warna ✅ — 24 keys dark/light mode

## Bahasa
- UI dalam Bahasa Melayu (utama) + English
- Istilah: Nombor Telefon, Kata Laluan, Daftar, Log Masuk, Dompet, Akaun, Pinjaman, Pengeluaran

## Penting — Konsistensi Data Antara Menu
Semua menu (Member List, Withdrawal Records, Loans Orderer, Member Approval) menggunakan data dari **table yang sama** (`users` dan `loans`) melalui API. Perubahan di satu menu automatik tercermin di menu lain — tiada data duplikasi.

- Phone Number pada Withdrawal Records & Orderer diambil JOIN dari `users.phone`
- Jika admin edit phone di Orderer/Withdrawal → `users.phone` dikemaskini terus
- UID (`users.id`) adalah rujukan universal merentas semua menu
