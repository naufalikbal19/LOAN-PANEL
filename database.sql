/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE IF NOT EXISTS `loan_panel` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `loan_panel`;

CREATE TABLE IF NOT EXISTS `admin_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `admin_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `admin_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `admin_logs` (`id`, `admin_id`, `admin_name`, `action`, `target`, `ip_address`, `created_at`) VALUES
	(1, 1, 'Super Admin', 'Luluskan ahli', '01234567', '::1', '2026-04-19 16:47:10'),
	(2, 1, 'Super Admin', 'Log masuk', 'Portal Admin', '::1', '2026-04-20 03:23:15'),
	(3, 1, 'Super Admin', 'Kemaskini tetapan', 'company_name, company_tagline, logo_url, favicon_url, support_phone, support_whatsapp', '::1', '2026-04-20 03:45:21'),
	(4, 1, 'Super Admin', 'Log masuk', 'Portal Admin', '::1', '2026-04-20 03:45:45'),
	(5, 1, 'Super Admin', 'Kemaskini tetapan', 'company_name, company_tagline, logo_url, favicon_url, support_phone, support_whatsapp', '::1', '2026-04-20 03:46:00'),
	(6, 1, 'Super Admin', 'Luluskan ahli', 'test sad', '::1', '2026-04-20 04:11:05');

CREATE TABLE IF NOT EXISTS `loans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `loan_terms` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `no_rekening` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sign_url` text COLLATE utf8mb4_unicode_ci,
  `front_ic_url` text COLLATE utf8mb4_unicode_ci,
  `back_ic_url` text COLLATE utf8mb4_unicode_ci,
  `selfie_url` text COLLATE utf8mb4_unicode_ci,
  `keterangan` text COLLATE utf8mb4_unicode_ci,
  `status` enum('under_review','loan_approved','credit_frozen','unfrozen_processing','credit_score_low','payment_processing','loan_being_canceled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'under_review',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `loans_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `settings` (`id`, `key`, `value`, `updated_at`) VALUES
	(1, 'company_name', 'Pinjaman Barakah', '2026-04-20 03:46:00'),
	(2, 'company_tagline', 'Pinjaman peribadi terbaik untuk anda', '2026-04-19 16:07:36'),
	(3, 'logo_url', '', '2026-04-19 16:07:36'),
	(4, 'favicon_url', '', '2026-04-19 16:07:36'),
	(5, 'support_whatsapp', '', '2026-04-19 16:07:36'),
	(6, 'support_phone', '', '2026-04-19 16:07:36'),
	(19, 'keterangan_under_review', 'Permohonan pinjaman anda sedang dalam semakan. Sila tunggu makluman lanjut daripada pihak kami.', '2026-04-20 04:30:36'),
	(20, 'keterangan_loan_approved', 'Tahniah! Permohonan pinjaman anda telah diluluskan. Dana akan dikreditkan ke akaun anda dalam masa 1-3 hari bekerja.', '2026-04-20 04:30:36'),
	(21, 'keterangan_credit_frozen', 'Kredit akaun anda telah dibekukan. Sila hubungi Khidmat Pelanggan untuk maklumat lanjut.', '2026-04-20 04:30:36'),
	(22, 'keterangan_unfrozen_processing', 'Proses penyahbekuan kredit sedang dijalankan. Sila tunggu pengesahan daripada pihak kami.', '2026-04-20 04:30:36'),
	(23, 'keterangan_credit_score_low', 'Maaf, skor kredit anda tidak mencukupi untuk melayakkan permohonan ini. Sila hubungi Khidmat Pelanggan.', '2026-04-20 04:30:36'),
	(24, 'keterangan_payment_processing', 'Pembayaran sedang diproses. Dana akan dikreditkan ke akaun anda tidak lama lagi.', '2026-04-20 04:30:36'),
	(25, 'keterangan_loan_being_canceled', 'Permohonan pinjaman anda sedang dalam proses pembatalan. Sila hubungi Khidmat Pelanggan jika ada pertanyaan.', '2026-04-20 04:30:36');

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ic` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('client','staff','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'client',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `status` enum('pending','active','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `member_status` enum('normal','suspended','blocked') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `credit_score` int NOT NULL DEFAULT '500',
  `withdrawal_password` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `balance` decimal(15,2) NOT NULL DEFAULT '3000.00',
  `ip_client` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` text COLLATE utf8mb4_unicode_ci,
  `level` int NOT NULL DEFAULT '1',
  `gender` enum('male','female','other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `no_rekening` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `loan_purpose` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `monthly_income` decimal(15,2) DEFAULT NULL,
  `current_address` text COLLATE utf8mb4_unicode_ci,
  `motto` text COLLATE utf8mb4_unicode_ci,
  `points` int NOT NULL DEFAULT '0',
  `consecutive_login_days` int NOT NULL DEFAULT '0',
  `number_of_failures` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ic` (`ic`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `name`, `ic`, `phone`, `email`, `password`, `role`, `is_active`, `status`, `member_status`, `credit_score`, `withdrawal_password`, `balance`, `ip_client`, `avatar`, `level`, `gender`, `bank`, `no_rekening`, `birthday`, `loan_purpose`, `monthly_income`, `current_address`, `motto`, `points`, `consecutive_login_days`, `number_of_failures`, `created_at`, `updated_at`) VALUES
	(1, 'Super Admin', NULL, NULL, 'admin@pinjamanbarakah.my', '$2a$12$kuEKaAkO6VaNDfGzmW77leWuMK9Npu3Dr5Y647k/bz6J3WxanAoja', 'admin', 1, 'active', 'normal', 500, NULL, 3000.00, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, '2026-04-19 15:36:20', '2026-04-19 15:55:57'),
	(2, '01234567', '01234567', '01234567', NULL, '$2a$12$MPR30G0SWhsEaokSrEbf2OF2vKdujAFWQJ3eVLwudhtW3BVuH2/Hq', 'client', 1, 'active', 'normal', 500, NULL, 3000.00, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, '2026-04-19 15:59:33', '2026-04-19 16:47:10'),
	(3, 'test sad', '54646546', '65456465', NULL, '$2a$12$90355qdu0zpfRLDtfnNA8eHEM2ahH9bgLZ0kQBPv052EqVvsXZBFO', 'client', 1, 'active', 'normal', 500, '864658', 3000.00, '::1', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, '2026-04-20 04:10:53', '2026-04-20 04:11:05');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
