-- =====================================================
-- DATABASE SETUP UNTUK INDONESIAN LICENSE APP
-- Menyesuaikan table "licenses" dan "notifications"
-- =====================================================

USE indonesian_license_app;

-- 1. Hapus tabel lama agar bersih (HATI-HATI JIKA ADA DATA PENTING)
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS gallery_images;
DROP TABLE IF EXISTS gallery;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS licenses;
DROP TABLE IF EXISTS users;

-- =====================================================
-- 2. TABEL PENGGUNA (USERS)
-- =====================================================
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  department VARCHAR(255) NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. TABEL PERIZINAN (LICENSES) 
-- Sesuai dengan route API Anda
-- =====================================================
CREATE TABLE licenses (
  id VARCHAR(36) PRIMARY KEY,
  jenis_izin VARCHAR(255) NOT NULL,
  nama_izin VARCHAR(255) NOT NULL,
  lokasi_izin TEXT NOT NULL,
  alamat TEXT NULL,
  permohonan_masuk DATE NOT NULL,
  tgl_permintaan_rekomendasi DATE NULL,
  tgl_permintaan_rekomendasi_diserahkan DATE NULL,
  tgl_rekomendasi_izin_diterima DATE NULL,
  tgl_rekomendasi DATE NULL,
  tgl_terbit_izin DATE NULL,
  tgl_penyerahan_izin DATE NULL,
  rekomendasi_hari INT DEFAULT 0,
  perizinan_hari INT DEFAULT 0,
  total_sla INT DEFAULT 0,
  perizinan VARCHAR(255) NOT NULL,
  sektor VARCHAR(255) NOT NULL,
  keterangan TEXT NULL,
  status VARCHAR(100) DEFAULT 'draft',
  tracking_code VARCHAR(50) NULL UNIQUE,
  berlaku_sampai DATE NULL,
  latitude VARCHAR(50) NULL,
  longitude VARCHAR(50) NULL,
  pemohon_id VARCHAR(255) NULL,
  pemohon_nama VARCHAR(255) NULL,
  pemohon_email VARCHAR(255) NULL,
  pemohon_telepon VARCHAR(50) NULL,
  approved_by VARCHAR(255) NULL,
  approved_at TIMESTAMP NULL,
  notes TEXT NULL,
  files JSON NULL,
  verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  verification_notes TEXT NULL,
  verified_by VARCHAR(255) NULL,
  verified_at TIMESTAMP NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. TABEL NOTIFIKASI (BARU)
-- Dibutuhkan untuk Notifikasi Admin jika ada Update Berkas
-- =====================================================
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL COMMENT 'Contoh: document_edit',
  reference_id VARCHAR(36) NULL COMMENT 'Merujuk ke ID Licenses',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. TABEL BERITA (NEWS)
-- =====================================================
CREATE TABLE news (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  image VARCHAR(500) NULL,
  author VARCHAR(255) NOT NULL DEFAULT 'Admin',
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. TABEL GALERI & FOTO
-- =====================================================
CREATE TABLE gallery (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NULL,
  category VARCHAR(255) NULL,
  image VARCHAR(500) NULL,
  images JSON NULL,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE gallery_images (
  id VARCHAR(36) PRIMARY KEY,
  gallery_id VARCHAR(36) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  image_order INT DEFAULT 0,
  caption VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gallery_id) REFERENCES gallery(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. INSERT AKUN ADMIN BAWAAN
-- Password asli: admin123 (tetapi wajib di-hash untuk aplikasi sesungguhnya)
-- =====================================================
INSERT INTO users (id, username, email, password, name, role, is_active) VALUES
('admin-001', 'admin', 'admin@perizinan.id', 'admin123', 'Administrator', 'admin', TRUE);

-- =====================================================
-- 8. TABEL PEMBAYARAN
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(36) PRIMARY KEY,
  license_id VARCHAR(36) NULL,
  tracking_code VARCHAR(50) NULL,
  pemohon_nama VARCHAR(255) NOT NULL,
  jumlah DECIMAL(15,2) NOT NULL DEFAULT 0,
  metode_pembayaran ENUM('transfer', 'tunai', 'va', 'qris') DEFAULT 'transfer',
  status_pembayaran ENUM('pending', 'dibayar', 'lunas', 'batal', 'gagal', 'kadaluarsa') DEFAULT 'pending',
  tanggal_pembayaran DATE NULL,
  bukti_pembayaran VARCHAR(500) NULL,
  keterangan TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. TABEL TESTIMONI
-- =====================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id VARCHAR(36) PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  jenis_izin VARCHAR(255) NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  komentar TEXT NOT NULL,
  foto VARCHAR(500) NULL,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 10. TABEL TUTORIAL
-- =====================================================
CREATE TABLE IF NOT EXISTS tutorials (
  id VARCHAR(36) PRIMARY KEY,
  judul VARCHAR(500) NOT NULL,
  deskripsi TEXT NULL,
  icon VARCHAR(100) DEFAULT 'BookOpen',
  langkah JSON NULL,
  urutan INT DEFAULT 0,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 11. TABEL KAMUS PERIZINAN
-- =====================================================
CREATE TABLE IF NOT EXISTS kamus_perizinan (
  id VARCHAR(36) PRIMARY KEY,
  istilah VARCHAR(255) NOT NULL,
  pengertian TEXT NOT NULL,
  kategori VARCHAR(100) NOT NULL DEFAULT 'Umum',
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 12. TABEL PENGADUAN
-- =====================================================
CREATE TABLE IF NOT EXISTS complaints (
  id VARCHAR(36) PRIMARY KEY,
  license_id VARCHAR(36) NULL,
  tracking_code VARCHAR(50) NULL,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telepon VARCHAR(50) NULL,
  kategori ENUM('pengaduan', 'saran', 'pertanyaan') NOT NULL DEFAULT 'pengaduan',
  pesan TEXT NOT NULL,
  status ENUM('baru', 'dibaca', 'ditindaklanjuti', 'selesai') DEFAULT 'baru',
  tanggapan TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 13. TABEL JADWAL SURVEY
-- =====================================================
CREATE TABLE IF NOT EXISTS survey_schedules (
  id VARCHAR(36) PRIMARY KEY,
  license_id VARCHAR(36) NULL,
  tracking_code VARCHAR(50) NULL,
  tanggal_survey DATE NOT NULL,
  waktu_survey TIME NOT NULL,
  lokasi TEXT NOT NULL,
  petugas VARCHAR(255) NULL,
  status ENUM('dijadwalkan', 'sedang_survey', 'selesai', 'dibatalkan') DEFAULT 'dijadwalkan',
  catatan TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

