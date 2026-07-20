export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "staff" | "user"
  createdAt: Date
}

export interface Perizinan {
  id: string
  jenisIzin: string
  namaIzin: string
  lokasiIzin: string
  berlakuSampai?: Date | null
  latitude?: string | null
  longitude?: string | null
  permohonanMasuk: Date
  tglPermintaanRekomendasi: Date | null
  tglRekomendasi: Date | null
  tglTerbitIzin: Date | null
  tglPenyerahanIzin: Date | null
  rekomendasiHari: number | null
  perizinan: string
  totalSLA: number
  sektor: string
  keterangan: string
  status: "pending" | "proses" | "selesai" | "ditolak"
  userId: string
  createdAt: Date
  updatedAt: Date
  phoneNumber?: string
  applicantName?: string
  // Added verification status
  verificationStatus?: "not_verified" | "in_review" | "verified" | "rejected"
  verificationId?: string
}


// Added verification interfaces
export interface VerificationItem {
  id: string
  label: string
  description: string
  required: boolean
  category: "dokumen" | "teknis" | "administrasi" | "lokasi"
}

export interface Verification {
  id: string
  perizinanId: string
  verifierId: string
  verifierName: string
  status: "in_review" | "verified" | "rejected"
  items: VerificationItemResult[]
  comments: string
  createdAt: Date
  updatedAt: Date
}

export interface VerificationItemResult {
  itemId: string
  status: "pending" | "approved" | "rejected"
  comments?: string
}

export interface News {
  id: string
  title: string
  content: string
  image?: string
  author: string
  published: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Gallery {
  id: string
  title: string
  description?: string
  image: string // Main/thumbnail image (backward compatibility)
  images?: string[] // Array of images for album/carousel
  category?: string
  published: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  licenseId: string
  trackingCode: string
  pemohonNama: string
  jumlah: number
  metodePembayaran: "transfer" | "tunai" | "va" | "qris"
  statusPembayaran: "pending" | "lunas" | "gagal" | "kadaluarsa"
  tanggalPembayaran?: string
  buktiPembayaran?: string
  keterangan?: string
  createdAt: Date
  updatedAt: Date
}

export interface Testimonial {
  id: string
  nama: string
  jenisIzin: string
  rating: number
  komentar: string
  foto?: string
  published: boolean
  createdAt: Date
}

export interface Tutorial {
  id: string
  judul: string
  deskripsi: string
  icon: string
  langkah: TutorialStep[]
  urutan: number
  published: boolean
  createdAt: Date
}

export interface TutorialStep {
  nomor: number
  judul: string
  konten: string
}

export interface KamusPerizinan {
  id: string
  istilah: string
  pengertian: string
  kategori: string
  published: boolean
  createdAt: Date
}

export interface Complaint {
  id: string
  licenseId?: string
  trackingCode?: string
  nama: string
  email: string
  telepon: string
  kategori: "pengaduan" | "saran" | "pertanyaan" | "testimoni"
  pesan: string
  status: "baru" | "dibaca" | "ditindaklanjuti" | "selesai"
  tanggapan?: string
  createdAt: Date
  updatedAt: Date
}

export interface SurveySchedule {
  id: string
  licenseId: string
  trackingCode: string
  tanggalSurvey: string
  waktuSurvey: string
  lokasi: string
  petugas?: string
  status: "dijadwalkan" | "sedang_survey" | "selesai" | "dibatalkan"
  catatan?: string
  createdAt: Date
  updatedAt: Date
}
