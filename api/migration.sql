-- Jalankan sekali untuk tambah kolum baru
-- mysql -u root loan_panel < migration.sql

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS occupation VARCHAR(100) DEFAULT NULL;

ALTER TABLE loans
  ADD COLUMN IF NOT EXISTS emergency_name  VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20)  DEFAULT NULL;
