import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fungsi untuk menghitung selisih hari antara dua tanggal (semua hari)
export function calculateDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // Pastikan tanggal valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
  
  // Hitung semua hari (termasuk weekend)
  return calculateAllDays(start, end)
}

// Fungsi untuk menghitung semua hari (termasuk weekend)
function calculateAllDays(startDate: Date, endDate: Date): number {
  // Normalisasi waktu ke awal hari
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  
  // Jika tanggal sama, return 1 hari
  if (start.getTime() === end.getTime()) {
    return 1
  }
  
  // Hitung selisih dalam milidetik
  const timeDiff = end.getTime() - start.getTime()
  
  // Konversi ke hari (1 hari = 24 * 60 * 60 * 1000 ms)
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  
  // Return jumlah hari (tidak perlu +1 karena sudah menghitung selisih yang benar)
  // Contoh: 8 Jan ke 9 Jan = 1 hari, 8 Jan ke 10 Jan = 2 hari
  return daysDiff
}

// Fungsi untuk menghitung Rekomendasi Hari otomatis
export function calculateRekomendasiHari(license: any): number {
  // Jika sudah ada nilai rekomendasiHari, gunakan itu
  if (license.rekomendasiHari !== undefined && license.rekomendasiHari !== null) {
    return license.rekomendasiHari
  }
  
  // Hitung otomatis dari Tanda Terima Berkas Permohonan Rekomendasi sampai Rekomendasi Terbit
  if (license.tglPermintaanRekomendasiDiserahkan && license.tglRekomendasi) {
    return calculateDays(license.tglPermintaanRekomendasiDiserahkan, license.tglRekomendasi)
  }
  
  return 0
}

// Fungsi untuk menghitung Perizinan Hari otomatis
export function calculatePerizinanHari(license: any): number {
  // Jika sudah ada nilai perizinanHari, gunakan itu
  if (license.perizinanHari !== undefined && license.perizinanHari !== null) {
    return license.perizinanHari
  }
  
  // Hitung sebagai jumlah dua segmen:
  // 1) Permohonan Masuk -> Surat Pengantar Rekomendasi
  // 2) Terbit Izin -> Penyerahan Izin
  let total = 0

  if (license.permohonanMasuk && license.tglPermintaanRekomendasi) {
    total += calculateDays(license.permohonanMasuk, license.tglPermintaanRekomendasi)
  }

  if (license.tglTerbitIzin && license.tglPenyerahanIzin) {
    total += calculateDays(license.tglTerbitIzin, license.tglPenyerahanIzin)
  }

  return total
}

// Fungsi untuk menghitung Total SLA otomatis
export function calculateTotalSLA(license: any): number {
  // Jika sudah ada nilai totalSLA, gunakan itu
  if (license.totalSLA !== undefined && license.totalSLA !== null) {
    return license.totalSLA
  }
  
  // Hitung otomatis dari Rekomendasi (Hari) + Perizinan (Hari)
  const rekomendasiHari = calculateRekomendasiHari(license)
  const perizinanHari = calculatePerizinanHari(license)
  
  return rekomendasiHari + perizinanHari
}
