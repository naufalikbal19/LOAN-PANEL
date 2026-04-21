-- Jalankan ini sekali untuk setup database
-- mysql -u root -p loan_panel < schema.sql

CREATE DATABASE IF NOT EXISTS loan_panel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE loan_panel;

CREATE TABLE IF NOT EXISTS users (
  id                  INT PRIMARY KEY AUTO_INCREMENT,
  name                VARCHAR(255)   NOT NULL,
  ic                  VARCHAR(20)    UNIQUE,
  phone               VARCHAR(20)    UNIQUE,
  email               VARCHAR(255)   UNIQUE,
  password            VARCHAR(255)   NOT NULL,
  role                ENUM('client','staff','admin') NOT NULL DEFAULT 'client',
  is_active           TINYINT(1)     NOT NULL DEFAULT 1,
  status              ENUM('pending','active','rejected') NOT NULL DEFAULT 'pending',
  member_status          ENUM('normal','suspended','blocked') NOT NULL DEFAULT 'normal',
  credit_score           INT            NOT NULL DEFAULT 500,
  withdrawal_password    VARCHAR(10)    DEFAULT NULL,
  balance                DECIMAL(15,2)  NOT NULL DEFAULT 0,
  ip_client              VARCHAR(45)    DEFAULT NULL,
  avatar                 TEXT           DEFAULT NULL,
  level                  INT            NOT NULL DEFAULT 1,
  gender                 ENUM('male','female','other') DEFAULT NULL,
  bank                   VARCHAR(100)   DEFAULT NULL,
  no_rekening            VARCHAR(50)    DEFAULT NULL,
  birthday               DATE           DEFAULT NULL,
  loan_purpose           VARCHAR(255)   DEFAULT NULL,
  monthly_income         DECIMAL(15,2)  DEFAULT NULL,
  current_address        TEXT           DEFAULT NULL,
  motto                  TEXT           DEFAULT NULL,
  points                 INT            NOT NULL DEFAULT 0,
  consecutive_login_days INT            NOT NULL DEFAULT 0,
  number_of_failures     INT            NOT NULL DEFAULT 0,
  created_at             TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loans (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  user_id      INT NOT NULL,
  amount       DECIMAL(15,2) NOT NULL DEFAULT 0,
  loan_terms   VARCHAR(50)   DEFAULT NULL,
  bank         VARCHAR(100)  DEFAULT NULL,
  no_rekening  VARCHAR(50)   DEFAULT NULL,
  sign_url     TEXT          DEFAULT NULL,
  front_ic_url TEXT          DEFAULT NULL,
  back_ic_url  TEXT          DEFAULT NULL,
  selfie_url   TEXT          DEFAULT NULL,
  keterangan   TEXT          DEFAULT NULL,
  status       ENUM(
    'under_review',
    'loan_approved',
    'credit_frozen',
    'unfrozen_processing',
    'credit_score_low',
    'payment_processing',
    'loan_being_canceled'
  ) NOT NULL DEFAULT 'under_review',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  user_id     INT NOT NULL,
  type        ENUM('withdrawal','credit','debit','adjustment') NOT NULL DEFAULT 'withdrawal',
  amount      DECIMAL(15,2) NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  admin_id    INT NOT NULL,
  admin_name  VARCHAR(255) NOT NULL,
  action      VARCHAR(255) NOT NULL,
  target      VARCHAR(255),
  ip_address  VARCHAR(45),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  `key`      VARCHAR(100) UNIQUE NOT NULL,
  value      TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO settings (`key`, value) VALUES
  ('company_name',    'Pinjaman Barakah'),
  ('company_tagline', 'Pinjaman peribadi terbaik untuk anda'),
  ('logo_url',        ''),
  ('favicon_url',     ''),
  ('support_whatsapp',''),
  ('support_phone',   ''),
  ('keterangan_under_review',        'Permohonan pinjaman anda sedang dalam semakan. Sila tunggu makluman lanjut daripada pihak kami.'),
  ('keterangan_loan_approved',       'Tahniah! Permohonan pinjaman anda telah diluluskan. Dana akan dikreditkan ke akaun anda dalam masa 1-3 hari bekerja.'),
  ('keterangan_credit_frozen',       'Kredit akaun anda telah dibekukan. Sila hubungi Khidmat Pelanggan untuk maklumat lanjut.'),
  ('keterangan_unfrozen_processing', 'Proses penyahbekuan kredit sedang dijalankan. Sila tunggu pengesahan daripada pihak kami.'),
  ('keterangan_credit_score_low',    'Maaf, skor kredit anda tidak mencukupi untuk melayakkan permohonan ini. Sila hubungi Khidmat Pelanggan.'),
  ('keterangan_payment_processing',  'Pembayaran sedang diproses. Dana akan dikreditkan ke akaun anda tidak lama lagi.'),
  ('keterangan_loan_being_canceled', 'Permohonan pinjaman anda sedang dalam proses pembatalan. Sila hubungi Khidmat Pelanggan jika ada pertanyaan.'),
  ('accent_color',  '#c9a84c'),
  ('bg_primary',    '#080808'),
  ('bg_card',       '#161616'),
  ('bg_image_url',  '');

-- Seed: admin default (password: Admin@1234)
INSERT IGNORE INTO users (name, email, password, role, status) VALUES (
  'Super Admin',
  'admin@pinjamanbarakah.my',
  '$2a$12$kuEKaAkO6VaNDfGzmW77leWuMK9Npu3Dr5Y647k/bz6J3WxanAoja',
  'admin',
  'active'
);
