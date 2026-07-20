-- Migration: Add testimoni category and rating field
-- Run this if you already have the database created

USE indonesian_license_app;

-- Add testimoni to complaints kategori enum
ALTER TABLE complaints 
  MODIFY COLUMN kategori ENUM('pengaduan', 'saran', 'pertanyaan', 'testimoni') NOT NULL DEFAULT 'pengaduan';

-- Add rating column to complaints
ALTER TABLE complaints 
  ADD COLUMN rating INT NULL AFTER tanggapan;
