-- Migration: Fix payment status ENUM to include 'dibayar' and 'batal'
-- Run this if you already have the payments table created

ALTER TABLE payments 
MODIFY COLUMN status_pembayaran ENUM('pending', 'dibayar', 'lunas', 'batal', 'gagal', 'kadaluarsa') DEFAULT 'pending';
