export class NotificationService {
  static async createNotification(title: string, message: string, type: string, referenceId?: string) {
    try {
      const res = await fetch('/api/mysql/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          type,
          reference_id: referenceId || null
        })
      });
      const result = await res.json();
      return result.success;
    } catch (e) {
      console.error('Failed to create notification:', e);
      return false;
    }
  }

  static async notifyNewLicense(licenseName: string, jenisIzin: string, licenseId: string) {
    return this.createNotification(
      'Permohonan Izin Baru',
      `Terdapat permohonan izin baru: ${licenseName} (${jenisIzin})`,
      'new_license',
      licenseId
    );
  }

  static async notifyDocumentEdit(pemohonName: string, trackingCode: string, licenseId: string) {
    return this.createNotification(
      'Pembaruan Dokumen Pemohon',
      `Data atas nama ${pemohonName} telah di edit (Kode Tracking: ${trackingCode})`,
      'document_edit',
      licenseId
    );
  }

  static async notifySLAWarning(licenseName: string, totalSLA: number, licenseId: string) {
    const isOverdue = totalSLA > 14;
    return this.createNotification(
      isOverdue ? 'SLA Terlambat' : 'Peringatan SLA',
      `${licenseName} - Total SLA: ${totalSLA} hari${isOverdue ? ' (MELEBIHI BATAS 14 HARI)' : ''}`,
      'sla_warning',
      licenseId
    );
  }

  static async notifyLicenseExpired(licenseName: string, pemohonNama: string, licenseId: string) {
    return this.createNotification(
      'Izin Telah Expired',
      `Izin ${licenseName} atas nama ${pemohonNama} telah habis masa berlaku`,
      'license_expired',
      licenseId
    );
  }

  static async notifyLicenseVerified(licenseName: string, status: string, licenseId: string) {
    return this.createNotification(
      `Verifikasi Berkas: ${status === 'approved' ? 'Disetujui' : 'Ditolak'}`,
      `Berkas perizinan ${licenseName} telah ${status === 'approved' ? 'disetujui' : 'ditolak'}`,
      'verification',
      licenseId
    );
  }

  static async notifyPaymentReceived(pemohonNama: string, trackingCode: string, jumlah: number) {
    return this.createNotification(
      'Pembayaran Diterima',
      `Pembayaran dari ${pemohonNama} (${trackingCode}) sebesar Rp ${jumlah.toLocaleString('id-ID')} telah diterima`,
      'payment',
      undefined
    );
  }

  static async notifyNewComplaint(nama: string, kategori: string, complaintId: string) {
    return this.createNotification(
      'Pengaduan Baru',
      `Pengaduan baru dari ${nama} dengan kategori "${kategori}"`,
      'complaint',
      complaintId
    );
  }
}
