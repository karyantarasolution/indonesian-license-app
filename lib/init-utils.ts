// Initialization utilities for the Indonesian License App

export const initUtils = {
  // Initialize all data
  initializeApp: () => {
    console.log("Initializing app data...")
    
    // Clear all existing data
    localStorage.clear()
    
    // Set default users
    const defaultUsers = [
      {
        id: "1",
        username: "admin",
        email: "admin@perizinan.id",
        role: "admin",
        name: "Administrator",
        phone: "081234567890",
        department: "IT",
        createdAt: "2024-01-01",
        isActive: true,
        password: "admin123",
      },
      {
        id: "2",
        username: "user1",
        email: "user1@perizinan.id",
        role: "user",
        name: "User Perizinan",
        phone: "081234567891",
        department: "Perizinan",
        createdAt: "2024-01-02",
        isActive: true,
        password: "password",
      },
    ]

    // Set default licenses
    const defaultLicenses = [
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
        status: "proses",
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
        status: "draft",
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
        status: "rekomendasi",
        createdBy: "user1",
        createdAt: "2024-08-10",
        updatedAt: "2024-08-10",
      },
    ]

    try {
      localStorage.setItem("users", JSON.stringify(defaultUsers))
      localStorage.setItem("licenses", JSON.stringify(defaultLicenses))
      localStorage.removeItem("currentUser") // Ensure no user is logged in
      
      console.log("✅ App data initialized successfully")
      console.log("Users:", defaultUsers.length)
      console.log("Licenses:", defaultLicenses.length)
      
      return true
    } catch (error) {
      console.error("❌ Error initializing app data:", error)
      return false
    }
  },

  // Check if data exists
  checkDataExists: () => {
    const users = localStorage.getItem("users")
    const licenses = localStorage.getItem("licenses")
    
    console.log("Data check:")
    console.log("- Users exist:", !!users)
    console.log("- Licenses exist:", !!licenses)
    
    return {
      usersExist: !!users,
      licensesExist: !!licenses,
      users: users ? JSON.parse(users) : null,
      licenses: licenses ? JSON.parse(licenses) : null,
    }
  },

  // Test login functionality
  testLogin: () => {
    const users = localStorage.getItem("users")
    if (!users) {
      console.log("❌ No users found")
      return false
    }

    const userList = JSON.parse(users)
    
    // Test admin login
    const adminTest = userList.find((u: any) => u.username === "admin" && u.password === "admin123")
    const userTest = userList.find((u: any) => u.username === "user1" && u.password === "password")
    
    console.log("Login test results:")
    console.log("- Admin login:", adminTest ? "✅ Success" : "❌ Failed")
    console.log("- User login:", userTest ? "✅ Success" : "❌ Failed")
    
    return adminTest && userTest
  },

  // Get current state
  getCurrentState: () => {
    const currentUser = localStorage.getItem("currentUser")
    const users = localStorage.getItem("users")
    const licenses = localStorage.getItem("licenses")
    
    return {
      currentUser: currentUser ? JSON.parse(currentUser) : null,
      users: users ? JSON.parse(users) : [],
      licenses: licenses ? JSON.parse(licenses) : [],
    }
  },
}

// Auto-initialize when this file is imported
if (typeof window !== "undefined") {
  // Check if data exists, if not initialize
  const dataCheck = initUtils.checkDataExists()
  if (!dataCheck.usersExist || !dataCheck.licensesExist) {
    console.log("🔄 Auto-initializing app data...")
    initUtils.initializeApp()
  }
  
  // Make utils available globally
  (window as any).initUtils = initUtils
  
  console.log("🚀 App initialization complete!")
  console.log("Available commands:")
  console.log("- initUtils.initializeApp() - Initialize fresh data")
  console.log("- initUtils.checkDataExists() - Check data status")
  console.log("- initUtils.testLogin() - Test login functionality")
  console.log("- initUtils.getCurrentState() - Get current state")
}
