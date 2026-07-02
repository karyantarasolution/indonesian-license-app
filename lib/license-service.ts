import { config } from './config'
import type { License } from '../contexts/license-context'

// Convert database row to License interface
function dbRowToLicense(row: any): License {
  return {
    id: row.id,
    jenisIzin: row.jenis_izin,
    namaIzin: row.nama_izin,
    lokasiIzin: row.lokasi_izin,
    alamat: row.alamat || undefined,
    permohonanMasuk: row.permohonan_masuk,
    tglPermintaanRekomendasi: row.tgl_permintaan_rekomendasi || '',
    tglPermintaanRekomendasiDiserahkan: row.tgl_permintaan_rekomendasi_diserahkan || '',
    tglRekomendasiIzinDiterima: row.tgl_rekomendasi_izin_diterima || '',
    tglRekomendasi: row.tgl_rekomendasi || '',
    tglTerbitIzin: row.tgl_terbit_izin || '',
    tglPenyerahanIzin: row.tgl_penyerahan_izin || '',
    rekomendasiHari: row.rekomendasi_hari || 0,
    perizinanHari: row.perizinan_hari || 0,
    perizinan: row.perizinan,
    totalSLA: row.total_sla || 0,
    sektor: row.sektor,
    keterangan: (row.keterangan !== null && row.keterangan !== undefined) ? String(row.keterangan) : '',
    status: row.status,
    berlakuSampai: row.berlaku_sampai || null,
    latitude: row.latitude || null,
    longitude: row.longitude || null,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Field baru untuk multi-actor
    trackingCode: row.tracking_code || undefined,
    pemohonId: row.pemohon_id || undefined,
    pemohonNama: row.pemohon_nama || undefined,
    pemohonEmail: row.pemohon_email || undefined,
    pemohonTelepon: row.pemohon_telepon || undefined,
    approvedBy: row.approved_by || undefined,
    approvedAt: row.approved_at || undefined,
    notes: row.notes || undefined,
    // Field untuk berkas dan verifikasi
    files: row.files ? (typeof row.files === 'string' ? JSON.parse(row.files) : row.files) : undefined,
    verificationStatus: row.verification_status || undefined,
    verificationNotes: row.verification_notes || undefined,
    verifiedBy: row.verified_by || undefined,
    verifiedAt: row.verified_at || undefined,
  }
}

// Convert License interface to database row
function licenseToDbRow(license: Omit<License, 'id' | 'createdAt' | 'updatedAt'>): any {
  return {
    jenis_izin: license.jenisIzin,
    nama_izin: license.namaIzin,
    lokasi_izin: license.lokasiIzin,
    alamat: license.alamat || null,
    permohonan_masuk: license.permohonanMasuk,
    tgl_permintaan_rekomendasi: license.tglPermintaanRekomendasi || null,
    tgl_permintaan_rekomendasi_diserahkan: license.tglPermintaanRekomendasiDiserahkan || null,
    tgl_rekomendasi_izin_diterima: license.tglRekomendasiIzinDiterima || null,
    tgl_rekomendasi: license.tglRekomendasi || null,
    tgl_terbit_izin: license.tglTerbitIzin || null,
    tgl_penyerahan_izin: license.tglPenyerahanIzin || null,
    rekomendasi_hari: license.rekomendasiHari || 0,
    perizinan_hari: license.perizinanHari || 0,
    perizinan: license.perizinan,
    total_sla: license.totalSLA || 0,
    sektor: license.sektor,
    keterangan: license.keterangan || '',
    status: license.status,
    berlaku_sampai: license.berlakuSampai || null,
    latitude: license.latitude || null,
    longitude: license.longitude || null,
    created_by: license.createdBy,
    // Field baru untuk multi-actor
    tracking_code: license.trackingCode || null,
    pemohon_id: license.pemohonId || null,
    pemohon_nama: license.pemohonNama || null,
    pemohon_email: license.pemohonEmail || null,
    pemohon_telepon: license.pemohonTelepon || null,
    approved_by: license.approvedBy || null,
    approved_at: license.approvedAt || null,
    notes: license.notes || null,
    // Field untuk berkas dan verifikasi
    files: license.files ? JSON.stringify(license.files) : null,
    verification_status: license.verificationStatus || null,
    verification_notes: license.verificationNotes || null,
    verified_by: license.verifiedBy || null,
    verified_at: license.verifiedAt || null,
  }
}

export class LicenseService {
  // Get all licenses
  static async getLicenses(): Promise<License[]> {
    // Helper function to sort licenses by createdAt DESC (newest first)
    const sortLicensesByDate = (licenses: License[]): License[] => {
      return licenses.sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate; // DESC order (newest first)
      });
    };

    if (config.useLocalStorage) {
      // Fallback to localStorage
      const savedLicenses = localStorage.getItem('licenses')
      const licenses = savedLicenses ? JSON.parse(savedLicenses) : []
      return sortLicensesByDate(licenses)
    }

    // Gunakan MySQL sebagai database utama
    if (config.useMySQL) {
      try {
        const response = await fetch(`${config.mysql.apiUrl}/licenses`)
        const result = await response.json()
        
        if (result.success && result.data) {
          const licenses = Array.isArray(result.data) ? result.data.map(dbRowToLicense) : []
          // API sudah mengurutkan, tapi kita pastikan lagi untuk konsistensi
          return sortLicensesByDate(licenses)
        } else {
          throw new Error(result.error || 'Failed to fetch from MySQL')
        }
      } catch (error) {
        console.warn('Error fetching licenses from MySQL, falling back to localStorage:', error instanceof Error ? error.message : error)
        // Fallback to localStorage
        const savedLicenses = localStorage.getItem('licenses')
        const licenses = savedLicenses ? JSON.parse(savedLicenses) : []
        return sortLicensesByDate(licenses)
      }
    }

    // Jika MySQL tidak dikonfigurasi, gunakan localStorage
    const savedLicenses = localStorage.getItem('licenses')
    const licenses = savedLicenses ? JSON.parse(savedLicenses) : []
    return sortLicensesByDate(licenses)
  }

  // Generate tracking code
  static generateTrackingCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Add new license
  static async addLicense(license: Omit<License, 'id' | 'createdAt' | 'updatedAt'>): Promise<License> {
    // Generate tracking code jika belum ada
    const trackingCode = license.trackingCode || LicenseService.generateTrackingCode();
    
    const newLicense: License = {
      ...license,
      trackingCode: trackingCode,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }

    if (config.useLocalStorage) {
      // Fallback to localStorage
      const savedLicenses = localStorage.getItem('licenses')
      const licenses = savedLicenses ? JSON.parse(savedLicenses) : []
      const updatedLicenses = [...licenses, newLicense]
      localStorage.setItem('licenses', JSON.stringify(updatedLicenses))
      return newLicense
    }

    // Gunakan MySQL sebagai database utama
    if (config.useMySQL) {
      try {
        const dbRow = licenseToDbRow(license)
        const response = await fetch(`${config.mysql.apiUrl}/licenses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dbRow),
        })
        const result = await response.json()
        
        if (result.success && result.data) {
          return dbRowToLicense(result.data)
        } else {
          throw new Error(result.error || 'Failed to add to MySQL')
        }
      } catch (error) {
        console.error('Error adding license to MySQL, falling back to localStorage:', error)
        // Fallback to localStorage
        const savedLicenses = localStorage.getItem('licenses')
        const licenses = savedLicenses ? JSON.parse(savedLicenses) : []
        const updatedLicenses = [...licenses, newLicense]
        localStorage.setItem('licenses', JSON.stringify(updatedLicenses))
        return newLicense
      }
    }

    // Jika MySQL tidak dikonfigurasi, gunakan localStorage
    const savedLicenses = localStorage.getItem('licenses')
    const licenses = savedLicenses ? JSON.parse(savedLicenses) : []
    const updatedLicenses = [...licenses, newLicense]
    localStorage.setItem('licenses', JSON.stringify(updatedLicenses))
    return newLicense
  }

  // Update license
  static async updateLicense(id: string, updates: Partial<License> & { is_applicant_edit?: boolean }): Promise<License | null> {
    if (config.useLocalStorage) {
      // Fallback to localStorage
      const savedLicenses = localStorage.getItem('licenses')
      const licenses = savedLicenses ? JSON.parse(savedLicenses) : []
      const updatedLicenses = licenses.map((license: License) =>
        license.id === id 
          ? { ...license, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
          : license
      )
      localStorage.setItem('licenses', JSON.stringify(updatedLicenses))
      const foundLicenseLocal = updatedLicenses.find((license: License) => license.id === id) || null
      
      // Buat notifikasi secara manual jika dari pemohon
      if (updates.is_applicant_edit && foundLicenseLocal) {
        try {
          const tCode = foundLicenseLocal.trackingCode || 'Tidak diketahui';
          const pemohonName = foundLicenseLocal.pemohonNama || 'Pemohon';
          fetch('/api/mysql/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: 'Pembaruan Dokumen Pemohon',
              message: `Data atas nama ${pemohonName} telah di edit (Kode Tracking: ${tCode})`,
              type: 'document_edit',
              reference_id: id
            })
          }).catch(e => console.error("Local notification error:", e));
        } catch (e) {
          console.error("Failed creating local notification", e);
        }
      }
      return foundLicenseLocal;
    }

    const dbUpdates: any = {}
    if (updates.jenisIzin) dbUpdates.jenis_izin = updates.jenisIzin
    if (updates.namaIzin) dbUpdates.nama_izin = updates.namaIzin
    if (updates.lokasiIzin) dbUpdates.lokasi_izin = updates.lokasiIzin
    if (updates.alamat !== undefined) dbUpdates.alamat = updates.alamat || null
    if (updates.permohonanMasuk) dbUpdates.permohonan_masuk = updates.permohonanMasuk
    if (updates.tglPermintaanRekomendasi !== undefined) dbUpdates.tgl_permintaan_rekomendasi = updates.tglPermintaanRekomendasi
    if (updates.tglPermintaanRekomendasiDiserahkan !== undefined) dbUpdates.tgl_permintaan_rekomendasi_diserahkan = updates.tglPermintaanRekomendasiDiserahkan
    if (updates.tglRekomendasiIzinDiterima !== undefined) dbUpdates.tgl_rekomendasi_izin_diterima = updates.tglRekomendasiIzinDiterima
    if (updates.tglRekomendasi !== undefined) dbUpdates.tgl_rekomendasi = updates.tglRekomendasi
    if (updates.tglTerbitIzin !== undefined) dbUpdates.tgl_terbit_izin = updates.tglTerbitIzin
    if (updates.tglPenyerahanIzin !== undefined) dbUpdates.tgl_penyerahan_izin = updates.tglPenyerahanIzin
    if (updates.rekomendasiHari !== undefined) dbUpdates.rekomendasi_hari = updates.rekomendasiHari
    if (updates.perizinanHari !== undefined) dbUpdates.perizinan_hari = updates.perizinanHari
    if (updates.perizinan) dbUpdates.perizinan = updates.perizinan
    if (updates.totalSLA !== undefined) dbUpdates.total_sla = updates.totalSLA
    if (updates.sektor) dbUpdates.sektor = updates.sektor
    // Keterangan bisa string kosong, jadi gunakan !== undefined dan simpan string kosong sebagai string kosong
    if (updates.keterangan !== undefined) dbUpdates.keterangan = updates.keterangan === "" ? null : updates.keterangan
    if (updates.status) dbUpdates.status = updates.status
    if (updates.berlakuSampai !== undefined) dbUpdates.berlaku_sampai = updates.berlakuSampai || null
    if (updates.latitude !== undefined) dbUpdates.latitude = updates.latitude || null
    if (updates.longitude !== undefined) dbUpdates.longitude = updates.longitude || null
    if (updates.createdBy) dbUpdates.created_by = updates.createdBy
    // Field untuk verifikasi
    if (updates.verificationStatus) dbUpdates.verification_status = updates.verificationStatus
    if (updates.verificationNotes !== undefined) dbUpdates.verification_notes = updates.verificationNotes || null
    if (updates.verifiedBy) dbUpdates.verified_by = updates.verifiedBy
    if (updates.verifiedAt) dbUpdates.verified_at = updates.verifiedAt
    // Files (berkas) support
    if (updates.files !== undefined) dbUpdates.files = updates.files ? JSON.stringify(updates.files) : null
    
    if (updates.is_applicant_edit) dbUpdates.is_applicant_edit = true;

    // Gunakan MySQL sebagai database utama
    if (config.useMySQL) {
      try {
        const response = await fetch(`${config.mysql.apiUrl}/licenses/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dbUpdates),
        })
        const result = await response.json()
        
        if (result.success && result.data) {
          return dbRowToLicense(result.data)
        } else {
          throw new Error(result.error || 'Failed to update in MySQL')
        }
      } catch (error) {
        console.error('Error updating license in MySQL, falling back to localStorage:', error)
        // Fallback to localStorage
        const savedLicenses = localStorage.getItem('licenses')
        const licenses = savedLicenses ? JSON.parse(savedLicenses) : []
        const updatedLicenses = licenses.map((license: License) =>
          license.id === id 
            ? { ...license, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
            : license
        )
        localStorage.setItem('licenses', JSON.stringify(updatedLicenses))
        const foundLicense = updatedLicenses.find((license: License) => license.id === id) || null;
        
        // Buat notifikasi secara manual jika dari pemohon, karena fallback ke local storage
        if (updates.is_applicant_edit && foundLicense) {
          try {
            const tCode = foundLicense.trackingCode || 'Tidak diketahui';
            const pemohonName = foundLicense.pemohonNama || 'Pemohon';
            fetch('/api/mysql/notifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: 'Pembaruan Dokumen Pemohon',
                message: `Data atas nama ${pemohonName} telah di edit (Kode Tracking: ${tCode})`,
                type: 'document_edit',
                reference_id: id
              })
            }).catch(e => console.error("Fallback notification error:", e));
          } catch (e) {
            console.error("Failed creating fallback notification", e);
          }
        }
        
        return foundLicense;
      }
    }

    // Jika MySQL tidak dikonfigurasi, gunakan localStorage
    const savedLicenses = localStorage.getItem('licenses')
    const licenses = savedLicenses ? JSON.parse(savedLicenses) : []
    const updatedLicenses = licenses.map((license: License) =>
      license.id === id 
        ? { ...license, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
        : license
    )
    localStorage.setItem('licenses', JSON.stringify(updatedLicenses))
    const foundLicenseLocal = updatedLicenses.find((license: License) => license.id === id) || null;
    
    // Buat notifikasi secara manual jika dari pemohon (kondisi non-MySQL)
    if (updates.is_applicant_edit && foundLicenseLocal) {
      try {
        const tCode = foundLicenseLocal.trackingCode || 'Tidak diketahui';
        const pemohonName = foundLicenseLocal.pemohonNama || 'Pemohon';
        fetch('/api/mysql/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Pembaruan Dokumen Pemohon',
            message: `Data atas nama ${pemohonName} telah di edit (Kode Tracking: ${tCode})`,
            type: 'document_edit',
            reference_id: id
          })
        }).catch(e => console.error("Local notification error:", e));
      } catch (e) {
        console.error("Failed creating local notification", e);
      }
    }
    
    return foundLicenseLocal;
  }

  // Delete license
  static async deleteLicense(id: string): Promise<boolean> {
    if (config.useLocalStorage) {
      // Fallback to localStorage
      const savedLicenses = localStorage.getItem('licenses')
      const licenses = savedLicenses ? JSON.parse(savedLicenses) : []
      const updatedLicenses = licenses.filter((license: License) => license.id !== id)
      localStorage.setItem('licenses', JSON.stringify(updatedLicenses))
      return true
    }

    // Gunakan MySQL sebagai database utama
    if (config.useMySQL) {
      try {
        const response = await fetch(`${config.mysql.apiUrl}/licenses/${id}`, {
          method: 'DELETE',
        })
        const result = await response.json()
        
        if (result.success) {
          return true
        } else {
          throw new Error(result.error || 'Failed to delete from MySQL')
        }
      } catch (error) {
        console.error('Error deleting license from MySQL, falling back to localStorage:', error)
        // Fallback to localStorage
        const savedLicenses = localStorage.getItem('licenses')
        const licenses = savedLicenses ? JSON.parse(savedLicenses) : []
        const updatedLicenses = licenses.filter((license: License) => license.id !== id)
        localStorage.setItem('licenses', JSON.stringify(updatedLicenses))
        return true
      }
    }

    // Jika MySQL tidak dikonfigurasi, gunakan localStorage
    const savedLicenses = localStorage.getItem('licenses')
    const licenses = savedLicenses ? JSON.parse(savedLicenses) : []
    const updatedLicenses = licenses.filter((license: License) => license.id !== id)
    localStorage.setItem('licenses', JSON.stringify(updatedLicenses))
    return true
  }

  // Subscribe to changes (polling untuk MySQL dan localStorage)
  static subscribeToLicenses(callback: (licenses: License[]) => void) {
    // Gunakan polling mechanism untuk MySQL dan localStorage
    const pollInterval = setInterval(async () => {
      const licenses = await this.getLicenses()
      callback(licenses)
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(pollInterval)
  }
}


