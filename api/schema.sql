-- Jalankan ini sekali untuk setup database
-- mysql -u root -p loan_panel < schema.sql

CREATE DATABASE IF NOT EXISTS loan_panel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE loan_panel;

CREATE TABLE IF NOT EXISTS users (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(255)   NOT NULL,
  ic          VARCHAR(20)    UNIQUE,
  phone       VARCHAR(20)    UNIQUE,
  email       VARCHAR(255)   UNIQUE,
  password    VARCHAR(255)   NOT NULL,
  role        ENUM('client','staff','admin') NOT NULL DEFAULT 'client',
  is_active   TINYINT(1)     NOT NULL DEFAULT 1,
  status      ENUM('pending','active','rejected') NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loans (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  user_id      INT NOT NULL,
  amount       DECIMAL(15,2) NOT NULL DEFAULT 0,
  bank         VARCHAR(100)  DEFAULT NULL,
  no_rekening  VARCHAR(50)   DEFAULT NULL,
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
  ('support_phone',   '');

-- Seed: admin default (password: Admin@1234)
INSERT IGNORE INTO users (name, email, password, role, status) VALUES (
  'Super Admin',
  'admin@pinjamanbarakah.my',
  '$2a$12$kuEKaAkO6VaNDfGzmW77leWuMK9Npu3Dr5Y647k/bz6J3WxanAoja',
  'admin',
  'active'
);
