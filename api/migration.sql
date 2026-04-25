-- Jalankan sekali untuk tambah kolum baru
-- mysql -u root loan_panel < migration.sql
-- Catatan: Error "Duplicate column name" boleh diabaikan (kolum sudah ada)

ALTER TABLE users ADD COLUMN occupation VARCHAR(100) DEFAULT NULL;
ALTER TABLE loans ADD COLUMN emergency_name  VARCHAR(100) DEFAULT NULL;
ALTER TABLE loans ADD COLUMN emergency_phone VARCHAR(20)  DEFAULT NULL;
ALTER TABLE loans ADD COLUMN account_name    VARCHAR(100) DEFAULT NULL;
ALTER TABLE users ADD COLUMN account_name    VARCHAR(100) DEFAULT NULL;

-- Balance default tukar ke 0 (hanya affect NEW users)
ALTER TABLE users MODIFY COLUMN balance DECIMAL(15,2) NOT NULL DEFAULT 0;

-- Jadual transaksi baru
CREATE TABLE IF NOT EXISTS transactions (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  user_id     INT NOT NULL,
  type        ENUM('withdrawal','credit','debit','adjustment') NOT NULL DEFAULT 'withdrawal',
  amount      DECIMAL(15,2) NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tambah status transfer_failed ke loans
ALTER TABLE loans MODIFY COLUMN status ENUM(
  'under_review','loan_approved','credit_frozen',
  'unfrozen_processing','credit_score_low','payment_processing',
  'loan_being_canceled','transfer_failed'
) NOT NULL DEFAULT 'under_review';

-- Jadual sejarah status pinjaman
CREATE TABLE IF NOT EXISTS loan_status_history (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  loan_id    INT NOT NULL,
  user_id    INT NOT NULL,
  status     VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tambah keterangan ke sejarah status pinjaman
ALTER TABLE loan_status_history ADD COLUMN IF NOT EXISTS keterangan TEXT NULL;

-- Jadual mesej baru
CREATE TABLE IF NOT EXISTS messages (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  user_id    INT NOT NULL,
  title      VARCHAR(255) NOT NULL,
  content    TEXT NOT NULL,
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
