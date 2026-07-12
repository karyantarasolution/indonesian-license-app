"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { LicenseService } from "../lib/license-service"

export interface License {
  id: string
  jenisIzin: string
  namaIzin: string
  lokasiIzin: string
  alamat?: string
  permohonanMasuk: string
  tglPermintaanRekomendasi: string
  tglPermintaanRekomendasiDiserahkan: string
  tglRekomendasiIzinDiterima: string
  tglRekomendasi: string
  tglTerbitIzin: string
  tglPenyerahanIzin: string
  rekomendasiHari: number
  perizinanHari: number
  perizinan: string
  totalSLA: number
  sektor: string
  keterangan: string
  status: "draft" | "dikirim" | "proses" | "rekomendasi" | "disetujui" | "selesai" | "terlambat" | "ditolak"
  createdBy: string
  createdAt: string
  updatedAt: string
  berlakuSampai?: string
  latitude?: string | null
  longitude?: string | null
  // Field baru untuk multi-actor
  trackingCode?: string
  pemohonId?: string
  pemohonNama?: string
  pemohonEmail?: string
  pemohonTelepon?: string
  approvedBy?: string
  approvedAt?: string
  notes?: string
  // Field untuk berkas dan verifikasi
  files?: Array<{
    name: string
    url: string
    type: string
    size: number
    uploadedAt: string
  }>
  verificationStatus?: "pending" | "approved" | "rejected"
  verificationNotes?: string
  verifiedBy?: string
  verifiedAt?: string
}

interface LicenseContextType {
  licenses: License[]
  isLoading: boolean
  addLicense: (license: Omit<License, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateLicense: (id: string, license: Partial<License> & { is_applicant_edit?: boolean }) => Promise<void>
  deleteLicense: (id: string) => Promise<void>
  getLicenseById: (id: string) => License | undefined
  getLicensesByStatus: (status: License["status"]) => License[]
  getOverdueLicenses: () => License[]
  refreshLicenses: () => Promise<void>
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined)

// Sample data
const sampleLicenses: License[] = [
  {
    id: "1",
    jenisIzin: "Izin Perdagangan",
    namaIzin: "Izin Toko Elektronik ABC",
    lokasiIzin: "Jl. Sudirman No. 123, Jakarta",
    permohonanMasuk: "2024-01-15",
    tglPermintaanRekomendasi: "2024-01-16",
    tglPermintaanRekomendasiDiserahkan: "2024-01-17",
    tglRekomendasiIzinDiterima: "2024-01-19",
    tglRekomendasi: "2024-01-20",
    tglTerbitIzin: "2024-01-25",
    tglPenyerahanIzin: "2024-01-26",
    rekomendasiHari: 4,
    perizinanHari: 10,
    perizinan: "Dinas Perdagangan",
    totalSLA: 14,
    sektor: "Perdagangan",
    keterangan: "Proses berjalan lancar",
    status: "selesai",
    createdBy: "admin",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-26",
  },
  {
    id: "2",
    jenisIzin: "Izin Mendirikan Bangunan (IMB)",
    namaIzin: "IMB Gedung Perkantoran XYZ",
    lokasiIzin: "Jl. Thamrin No. 456, Jakarta",
    permohonanMasuk: "2024-02-01",
    tglPermintaanRekomendasi: "2024-02-02",
    tglPermintaanRekomendasiDiserahkan: "",
    tglRekomendasiIzinDiterima: "",
    tglRekomendasi: "",
    tglTerbitIzin: "",
    tglPenyerahanIzin: "",
    rekomendasiHari: 0,
    perizinanHari: 0,
    perizinan: "Dinas Tata Ruang",
    totalSLA: 21,
    sektor: "Konstruksi",
    keterangan: "Menunggu verifikasi dokumen",
    status: "terlambat",
    createdBy: "user1",
    createdAt: "2024-02-01",
    updatedAt: "2024-02-02",
  },
  {
    id: "3",
    jenisIzin: "Izin Perdagangan",
    namaIzin: "Izin Warung Makan Sederhana",
    lokasiIzin: "Jl. Mangga Dua No. 789, Jakarta",
    permohonanMasuk: "2024-03-10",
    tglPermintaanRekomendasi: "2024-03-12",
    tglPermintaanRekomendasiDiserahkan: "2024-03-13",
    tglRekomendasiIzinDiterima: "2024-03-15",
    tglRekomendasi: "2024-03-16",
    tglTerbitIzin: "2024-03-20",
    tglPenyerahanIzin: "2024-03-21",
    rekomendasiHari: 4,
    perizinanHari: 10,
    perizinan: "Dinas Perdagangan",
    totalSLA: 11,
    sektor: "Perdagangan",
    keterangan: "Proses selesai tepat waktu",
    status: "selesai",
    createdBy: "admin",
    createdAt: "2024-03-10",
    updatedAt: "2024-03-21",
  },
  {
    id: "4",
    jenisIzin: "Izin Kesehatan",
    namaIzin: "Izin Klinik Sehat",
    lokasiIzin: "Jl. Kesehatan No. 321, Jakarta",
    permohonanMasuk: "2024-04-05",
    tglPermintaanRekomendasi: "2024-04-06",
    tglPermintaanRekomendasiDiserahkan: "2024-04-07",
    tglRekomendasiIzinDiterima: "2024-04-10",
    tglRekomendasi: "2024-04-11",
    tglTerbitIzin: "2024-04-15",
    tglPenyerahanIzin: "2024-04-16",
    rekomendasiHari: 5,
    perizinanHari: 10,
    perizinan: "Dinas Kesehatan",
    totalSLA: 11,
    sektor: "Kesehatan",
    keterangan: "Proses berjalan lancar",
    status: "selesai",
    createdBy: "user1",
    createdAt: "2024-04-05",
    updatedAt: "2024-04-16",
  },
  {
    id: "5",
    jenisIzin: "Izin Pariwisata",
    namaIzin: "Izin Hotel Grand",
    lokasiIzin: "Jl. Pariwisata No. 654, Jakarta",
    permohonanMasuk: "2024-05-20",
    tglPermintaanRekomendasi: "2024-05-21",
    tglPermintaanRekomendasiDiserahkan: "",
    tglRekomendasiIzinDiterima: "",
    tglRekomendasi: "",
    tglTerbitIzin: "",
    tglPenyerahanIzin: "",
    rekomendasiHari: 0,
    perizinanHari: 0,
    perizinan: "Dinas Pariwisata",
    totalSLA: 25,
    sektor: "Pariwisata",
    keterangan: "Dokumen masih dalam review",
    status: "terlambat",
    createdBy: "admin",
    createdAt: "2024-05-20",
    updatedAt: "2024-05-20",
  },
  {
    id: "6",
    jenisIzin: "Izin Perikanan",
    namaIzin: "Izin Budidaya Ikan Lele",
    lokasiIzin: "Jl. Perikanan No. 987, Jakarta",
    permohonanMasuk: "2024-06-01",
    tglPermintaanRekomendasi: "2024-06-02",
    tglPermintaanRekomendasiDiserahkan: "2024-06-03",
    tglRekomendasiIzinDiterima: "2024-06-05",
    tglRekomendasi: "2024-06-06",
    tglTerbitIzin: "2024-06-10",
    tglPenyerahanIzin: "2024-06-11",
    rekomendasiHari: 4,
    perizinanHari: 9,
    perizinan: "Dinas Perikanan",
    totalSLA: 10,
    sektor: "Perikanan",
    keterangan: "Proses selesai cepat",
    status: "selesai",
    createdBy: "user1",
    createdAt: "2024-06-01",
    updatedAt: "2024-06-11",
  },
  {
    id: "7",
    jenisIzin: "Izin Pendidikan",
    namaIzin: "Izin Kursus Komputer",
    lokasiIzin: "Jl. Pendidikan No. 147, Jakarta",
    permohonanMasuk: "2024-07-15",
    tglPermintaanRekomendasi: "2024-07-16",
    tglPermintaanRekomendasiDiserahkan: "2024-07-17",
    tglRekomendasiIzinDiterima: "2024-07-19",
    tglRekomendasi: "2024-07-20",
    tglTerbitIzin: "2024-07-25",
    tglPenyerahanIzin: "2024-07-26",
    rekomendasiHari: 4,
    perizinanHari: 10,
    perizinan: "Dinas Pendidikan",
    totalSLA: 11,
    sektor: "Pendidikan",
    keterangan: "Proses normal",
    status: "selesai",
    createdBy: "admin",
    createdAt: "2024-07-15",
    updatedAt: "2024-07-26",
  },
  {
    id: "8",
    jenisIzin: "Izin Pertanian",
    namaIzin: "Izin Kebun Sayur Organik",
    lokasiIzin: "Jl. Pertanian No. 258, Jakarta",
    permohonanMasuk: "2024-08-10",
    tglPermintaanRekomendasi: "2024-08-11",
    tglPermintaanRekomendasiDiserahkan: "",
    tglRekomendasiIzinDiterima: "",
    tglRekomendasi: "",
    tglTerbitIzin: "",
    tglPenyerahanIzin: "",
    rekomendasiHari: 0,
    perizinanHari: 0,
    perizinan: "Dinas Pertanian",
    totalSLA: 30,
    sektor: "Pertanian",
    keterangan: "Menunggu survey lokasi",
    status: "terlambat",
    createdBy: "user1",
    createdAt: "2024-08-10",
    updatedAt: "2024-08-10",
  },
]

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const [licenses, setLicenses] = useState<License[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadLicenses = useCallback(async () => {
    try {
      setIsLoading(true)
      const fetchedLicenses = await LicenseService.getLicenses()
      
      // Update status otomatis untuk perizinan dengan totalSLA > 14
      const updatedLicenses = fetchedLicenses.map((license: License) => {
        if (license.totalSLA > 14 && license.status !== "selesai") {
          return { ...license, status: "terlambat" as const }
        }
        return license
      })
      
      setLicenses(updatedLicenses)
      
      // Save to localStorage as backup
      localStorage.setItem("licenses", JSON.stringify(updatedLicenses))
    } catch (error) {
      console.error("Error loading licenses:", error)
      // Fallback to localStorage
      const savedLicenses = localStorage.getItem("licenses")
      if (savedLicenses) {
        const parsedLicenses = JSON.parse(savedLicenses)
        setLicenses(parsedLicenses)
      } else {
        // Use sample data as last resort
        setLicenses(sampleLicenses)
        localStorage.setItem("licenses", JSON.stringify(sampleLicenses))
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLicenses()
  }, [loadLicenses])

  // Auto-refresh when window gains focus (user switches back to tab)
  useEffect(() => {
    const handleFocus = () => {
      loadLicenses()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [loadLicenses])

  // Auto-refresh every 30 seconds to catch new entries
  useEffect(() => {
    const interval = setInterval(() => {
      loadLicenses()
    }, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [loadLicenses])

  // Setup real-time subscription
  useEffect(() => {
    const unsubscribe = LicenseService.subscribeToLicenses((updatedLicenses) => {
      setLicenses(updatedLicenses)
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const addLicense = async (licenseData: Omit<License, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newLicense = await LicenseService.addLicense(licenseData)
      // Tambahkan data baru di awal array agar muncul di urutan pertama
      setLicenses(prev => [newLicense, ...prev])
    } catch (error) {
      console.error("Error adding license:", error)
      // Fallback to local state update
      // Generate tracking code jika belum ada
      const trackingCode = licenseData.trackingCode || LicenseService.generateTrackingCode()
      const newLicense: License = {
        ...licenseData,
        trackingCode: trackingCode,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      }
      // Tambahkan data baru di awal array agar muncul di urutan pertama
      setLicenses(prev => [newLicense, ...prev])
      localStorage.setItem("licenses", JSON.stringify([newLicense, ...licenses]))
    }
  }

  const updateLicense = async (id: string, licenseData: Partial<License> & { is_applicant_edit?: boolean }) => {
    try {
      console.log("Updating license in context:", id, licenseData);
      const updatedLicense = await LicenseService.updateLicense(id, licenseData)
      if (updatedLicense) {
        console.log("Updated license received:", updatedLicense);
        setLicenses(prev => {
          const newLicenses = prev.map(license => 
            license.id === id ? updatedLicense : license
          );
          console.log("State updated, new licenses count:", newLicenses.length);
          // Update localStorage juga
          localStorage.setItem("licenses", JSON.stringify(newLicenses));
          return newLicenses;
        });
      } else {
        console.warn("No updated license returned, updating state directly");
        // Fallback: update state langsung jika tidak ada response
        setLicenses(prev => {
          const newLicenses = prev.map(license =>
            license.id === id ? { ...license, ...licenseData, updatedAt: new Date().toISOString().split("T")[0] } : license,
          );
          localStorage.setItem("licenses", JSON.stringify(newLicenses));
          return newLicenses;
        });
      }
    } catch (error) {
      console.error("Error updating license:", error)
      // Fallback to local state update
      setLicenses(prev => {
        const newLicenses = prev.map((license) =>
          license.id === id ? { ...license, ...licenseData, updatedAt: new Date().toISOString().split("T")[0] } : license,
        );
        localStorage.setItem("licenses", JSON.stringify(newLicenses));
        return newLicenses;
      });
    }
  }

  const deleteLicense = async (id: string) => {
    try {
      await LicenseService.deleteLicense(id)
      setLicenses(prev => prev.filter(license => license.id !== id))
    } catch (error) {
      console.error("Error deleting license:", error)
      // Fallback to local state update
      const newLicenses = licenses.filter((license) => license.id !== id)
      setLicenses(newLicenses)
      localStorage.setItem("licenses", JSON.stringify(newLicenses))
    }
  }

  const getLicenseById = (id: string) => {
    return licenses.find((license) => license.id === id)
  }

  const getLicensesByStatus = (status: License["status"]) => {
    return licenses.filter((license) => license.status === status)
  }

  const getOverdueLicenses = () => {
    return licenses.filter((license) => {
      // Perizinan dengan status "terlambat"
      if (license.status === "terlambat") return true
      
      // Perizinan dengan totalSLA > 14 hari (melebihi batas maksimal)
      if (license.totalSLA > 14) return true
      
      return false
    })
  }

  const refreshLicenses = useCallback(async () => {
    await loadLicenses()
  }, [loadLicenses])

  return (
    <LicenseContext.Provider
      value={{
        licenses,
        isLoading,
        addLicense,
        updateLicense,
        deleteLicense,
        getLicenseById,
        getLicensesByStatus,
        getOverdueLicenses,
        refreshLicenses,
      }}
    >
      {children}
    </LicenseContext.Provider>
  )
}

export function useLicenses() {
  const context = useContext(LicenseContext)
  if (context === undefined) {
    throw new Error("useLicenses must be used within a LicenseProvider")
  }
  return context
}
