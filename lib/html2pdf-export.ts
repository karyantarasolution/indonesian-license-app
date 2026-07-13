import type { License } from "@/contexts/license-context";
import { format } from "date-fns";

export const getKopSuratHTML = (title: string, subtitle: string) => `
  <div style="text-align: center; border-bottom: 3px solid black; padding-bottom: 10px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center;">
    <div style="flex: 0 0 80px;">
      <img src="/logo.png" alt="Logo Tapin" style="width: 70px; height: auto;" />
    </div>
    <div style="flex: 1;">
      <h2 style="margin: 0; font-size: 18px; font-weight: bold;">PEMERINTAH KABUPATEN TAPIN</h2>
      <h3 style="margin: 5px 0; font-size: 16px;">DINAS PENANAMAN MODAL DAN PELAYANAN<br/>(DPMPTSP) KABUPATEN TAPIN</h3>
      <p style="margin: 0; font-size: 12px;">Rantau, Kabupaten Tapin</p>
    </div>
    <div style="flex: 0 0 80px;"></div>
  </div>
  <div style="text-align: center; margin-bottom: 20px;">
    <h4 style="margin: 0; font-size: 16px; text-decoration: underline;">${title}</h4>
    <p style="margin: 5px 0 0; font-size: 12px;">${subtitle}</p>
  </div>
`;

export const getTableStyle = () => `
  <style>
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; page-break-inside: auto; }
    tr { page-break-inside: avoid; page-break-after: auto; }
    th, td { border: 1px solid #333; padding: 6px; text-align: left; }
    th { background-color: #f3f4f6; font-weight: bold; text-align: center; }
  </style>
`;

export async function exportHtmlToPDF(
  htmlContent: string,
  filename: string,
  orientation: "portrait" | "landscape" = "landscape"
) {
  if (typeof window === "undefined") return;

  const html2pdf = (await import("html2pdf.js")).default;
  
  const element = document.createElement("div");
  element.innerHTML = htmlContent;
  element.style.padding = "20px";
  element.style.fontFamily = "Arial, sans-serif";
  element.style.color = "#000";
  element.style.backgroundColor = "#ffffff";
  
  // Override oklch CSS variables with hex fallbacks to prevent html2canvas parse error
  const hexOverrides = `
    --background: #ffffff; --foreground: #262626; --card: #ffffff; --card-foreground: #262626;
    --popover: #ffffff; --popover-foreground: #262626; --primary: #333333; --primary-foreground: #fafafa;
    --secondary: #f5f5f5; --secondary-foreground: #333333; --muted: #f5f5f5; --muted-foreground: #8c8c8c;
    --accent: #f5f5f5; --accent-foreground: #333333; --destructive: #dc3545; --destructive-foreground: #dc3545;
    --border: #e5e5e5; --input: #e5e5e5; --ring: #8c8c8c;
  `;
  const overrideStyle = document.createElement("style");
  overrideStyle.textContent = `:root { ${hexOverrides} }`;
  element.prepend(overrideStyle);
  
  const opt = {
    margin: 10,
    filename: filename + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
    jsPDF: { unit: 'mm', format: 'a4', orientation: orientation }
  };

  await html2pdf().set(opt).from(element).save();
}

// 1. Laporan Performa SLA
export async function exportSLAPerformanceHtml(data: License[], filename = "laporan-performa-sla") {
  const tableRows = data.map((license, index) => {
    const isOverdue = license.totalSLA > 14;
    const selisihHari = license.totalSLA - 14;
    const tanggalMasuk = license.permohonanMasuk ? new Date(license.permohonanMasuk) : null;
    const tanggalSelesai = license.tglPenyerahanIzin ? new Date(license.tglPenyerahanIzin) : null;
    
    return `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td>${license.namaIzin || '-'}</td>
        <td style="text-align: center;">${tanggalMasuk ? format(tanggalMasuk, 'dd/MM/yyyy') : '-'}</td>
        <td style="text-align: center;">${tanggalSelesai ? format(tanggalSelesai, 'dd/MM/yyyy') : '-'}</td>
        <td style="text-align: center;">${license.totalSLA || 0} hari</td>
        <td style="text-align: center;">14 hari</td>
        <td style="text-align: center; color: ${isOverdue ? 'red' : 'green'}; font-weight: ${isOverdue ? 'bold' : 'normal'};${isOverdue ? 'color:red;' : ''}">${isOverdue ? 'Terlambat' : 'Tepat Waktu'}</td>
        <td style="text-align: center;">${isOverdue ? '+' + selisihHari + ' hari' : selisihHari + ' hari'}</td>
      </tr>
    `;
  }).join('');

  const html = `
    ${getTableStyle()}
    ${getKopSuratHTML("DETAIL LAPORAN PERFORMA SLA", "Analisis detail performa SLA untuk setiap perizinan")}
    <p style="text-align: center; font-size: 11px; margin-top: -10px; margin-bottom: 20px;">Tanggal Laporan: ${format(new Date(), 'dd MMMM yyyy')}</p>
    
    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Nama Izin</th>
          <th>Tanggal Masuk</th>
          <th>Tanggal Selesai</th>
          <th>Durasi Aktual</th>
          <th>Target SLA</th>
          <th>Status SLA</th>
          <th>Selisih Hari</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
    
    <div style="font-size: 11px; margin-top: 20px;">
      <strong>Ringkasan:</strong>
      <ul style="list-style: none; padding-left: 0;">
        <li>Total Perizinan: ${data.length}</li>
        <li>Tepat Waktu: ${data.filter(l => l.totalSLA <= 14).length}</li>
        <li>Terlambat: ${data.filter(l => l.totalSLA > 14).length}</li>
      </ul>
    </div>
  `;

  await exportHtmlToPDF(html, filename, "landscape");
}

// 2. Laporan Status Perizinan
export async function exportStatusPerizinanHtml(data: License[], overdueLicenses: License[], filename = "laporan-status-perizinan") {
  const tableRows = data.map((license, index) => {
    const tanggalMasuk = license.permohonanMasuk ? new Date(license.permohonanMasuk) : null;
    const durasiProses = tanggalMasuk ? Math.floor((new Date().getTime() - tanggalMasuk.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const estimasiSelesai = tanggalMasuk ? new Date(tanggalMasuk.getTime() + 14 * 24 * 60 * 60 * 1000) : null;
    
    let statusText = license.status || '-';
    if (license.verificationStatus === 'rejected') statusText = 'Ditolak';
    else if (license.status === 'draft') statusText = 'Draft';
    else if (license.status === 'proses') statusText = 'Dalam Proses';
    else if (license.status === 'rekomendasi') statusText = 'Menunggu Rekomendasi';
    else if (license.status === 'selesai') statusText = 'Selesai';

    return `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td>${license.namaIzin || '-'}</td>
        <td>${license.jenisIzin || '-'}</td>
        <td>${license.sektor || '-'}</td>
        <td style="text-align: center; font-weight: bold;">${statusText.toUpperCase()}</td>
        <td style="text-align: center;">${tanggalMasuk ? format(tanggalMasuk, 'dd/MM/yyyy') : '-'}</td>
        <td style="text-align: center;">${durasiProses} hari</td>
        <td style="text-align: center;">${estimasiSelesai ? format(estimasiSelesai, 'dd/MM/yyyy') : '-'}</td>
      </tr>
    `;
  }).join('');

  const html = `
    ${getTableStyle()}
    ${getKopSuratHTML("DETAIL LAPORAN STATUS PERIZINAN", "Overview lengkap status semua perizinan dengan timeline progress")}
    <p style="text-align: center; font-size: 11px; margin-top: -10px; margin-bottom: 20px;">Tanggal Laporan: ${format(new Date(), 'dd MMMM yyyy')}</p>
    
    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Nama Izin</th>
          <th>Jenis Izin</th>
          <th>Sektor</th>
          <th>Status Saat Ini</th>
          <th>Tanggal Masuk</th>
          <th>Durasi Proses</th>
          <th>Estimasi Selesai</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;

  await exportHtmlToPDF(html, filename, "landscape");
}

// 3. Laporan Analisis Sektor
export async function exportAnalisisSektorHtml(data: License[], sectorData: { sector: string; count: number }[], overdueLicenses: License[], filename = "laporan-analisis-sektor") {
  const tableRows = sectorData.map(({ sector, count }, index) => {
    const sectorLicenses = data.filter((l) => l.sektor === sector);
    const selesai = sectorLicenses.filter((l) => l.status === "selesai").length;
    const dalamProses = sectorLicenses.filter((l) => l.status === "proses" || l.status === "rekomendasi").length;
    const terlambat = sectorLicenses.filter((l) => overdueLicenses.some((ol) => ol.id === l.id)).length;
    const tingkatPenyelesaian = count > 0 ? Math.round((selesai / count) * 100) : 0;

    return `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td>${sector}</td>
        <td style="text-align: center;">${count}</td>
        <td style="text-align: center;">${selesai}</td>
        <td style="text-align: center;">${dalamProses}</td>
        <td style="text-align: center;">${terlambat}</td>
        <td style="text-align: center;">${tingkatPenyelesaian}%</td>
      </tr>
    `;
  }).join('');

  const html = `
    ${getTableStyle()}
    ${getKopSuratHTML("DETAIL LAPORAN ANALISIS SEKTOR", "Analisis perizinan berdasarkan jenis izin")}
    <p style="text-align: center; font-size: 11px; margin-top: -10px; margin-bottom: 20px;">Tanggal Laporan: ${format(new Date(), 'dd MMMM yyyy')}</p>
    
    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Nama Sektor</th>
          <th>Total Permohonan</th>
          <th>Selesai</th>
          <th>Dalam Proses</th>
          <th>Terlambat</th>
          <th>Tingkat Penyelesaian</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;

  await exportHtmlToPDF(html, filename, "portrait");
}

// 4. Laporan Izin Expired
export async function exportIzinExpiredHtml(data: License[], filename = "laporan-izin-expired") {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiredData = data.filter(l => l.status === "selesai" && l.berlakuSampai).map(license => {
    const validUntil = new Date(license.berlakuSampai!);
    validUntil.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((validUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { ...license, diffDays };
  }).filter(l => l.diffDays <= 30).sort((a, b) => a.diffDays - b.diffDays);

  const tableRows = expiredData.map((license, index) => {
    const isExpired = license.diffDays < 0;
    return `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td>${license.namaIzin || '-'}</td>
        <td>${license.pemohonNama || '-'}</td>
        <td style="text-align: center;">${license.berlakuSampai ? format(new Date(license.berlakuSampai), 'dd/MM/yyyy') : '-'}</td>
        <td style="text-align: center; color: ${isExpired ? 'red' : 'orange'}; font-weight: bold;">
          ${isExpired ? 'Expired (' + Math.abs(license.diffDays) + ' hari lalu)' : 'Sisa ' + license.diffDays + ' hari'}
        </td>
      </tr>
    `;
  }).join('');

  const html = `
    ${getTableStyle()}
    ${getKopSuratHTML("LAPORAN IZIN EXPIRED", "Daftar Izin Yang Telah Habis atau Mendekati Masa Berlaku")}
    <p style="text-align: center; font-size: 11px; margin-top: -10px; margin-bottom: 20px;">Tanggal Laporan: ${format(new Date(), 'dd MMMM yyyy')}</p>
    
    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Nama Izin</th>
          <th>Nama Pemohon</th>
          <th>Berlaku Sampai</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows.length > 0 ? tableRows : '<tr><td colspan="5" style="text-align: center;">Tidak ada izin expired/mendekati expired</td></tr>'}
      </tbody>
    </table>
  `;

  await exportHtmlToPDF(html, filename, "portrait");
}

// 5. Laporan Daftar Pemohon
export async function exportDaftarPemohonHtml(data: License[], filename = "laporan-daftar-pemohon") {
  const tableRows = data.map((license, index) => {
    return `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td>${license.pemohonNama || '-'}</td>
        <td>${license.pemohonTelepon || '-'}</td>
        <td>${license.alamat || '-'}</td>
        <td>${license.namaIzin || '-'}</td>
        <td style="text-align: center;">${license.status.toUpperCase()}</td>
      </tr>
    `;
  }).join('');

  const html = `
    ${getTableStyle()}
    ${getKopSuratHTML("LAPORAN DAFTAR PEMOHON", "Rekapitulasi Data Pemohon Izin")}
    <p style="text-align: center; font-size: 11px; margin-top: -10px; margin-bottom: 20px;">Tanggal Laporan: ${format(new Date(), 'dd MMMM yyyy')}</p>
    
    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Nama Pemohon</th>
          <th>Kontak</th>
          <th>Alamat</th>
          <th>Nama Izin</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;

  await exportHtmlToPDF(html, filename, "landscape");
}

// 6. Laporan Permohonan Ditolak
export async function exportPermohonanDitolakHtml(data: License[], filename = "laporan-permohonan-ditolak") {
  const rejectedLicenses = data.filter(l => l.verificationStatus === "rejected");

  const tableRows = rejectedLicenses.map((license, index) => {
    const tanggalMasuk = license.permohonanMasuk ? format(new Date(license.permohonanMasuk), 'dd/MM/yyyy') : '-';
    return `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td>${license.trackingCode || '-'}</td>
        <td>${license.pemohonNama || '-'}</td>
        <td>${license.namaIzin || '-'}</td>
        <td style="text-align: center;">${tanggalMasuk}</td>
        <td>${license.verificationNotes || 'Tidak ada alasan yang dicantumkan'}</td>
      </tr>
    `;
  }).join('');

  const html = `
    ${getTableStyle()}
    ${getKopSuratHTML("LAPORAN PERMOHONAN DITOLAK", "Daftar Permohonan Perizinan Yang Ditolak")}
    <p style="text-align: center; font-size: 11px; margin-top: -10px; margin-bottom: 20px;">Tanggal Laporan: ${format(new Date(), 'dd MMMM yyyy')}</p>
    
    <div style="font-size: 11px; margin-bottom: 15px;">
      <strong>Total Permohonan Ditolak:</strong> ${rejectedLicenses.length} dari ${data.length} permohonan
    </div>

    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Kode Tracking</th>
          <th>Nama Pemohon</th>
          <th>Jenis Izin</th>
          <th>Tanggal</th>
          <th>Alasan Penolakan</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows.length > 0 ? tableRows : '<tr><td colspan="6" style="text-align: center;">Tidak ada permohonan yang ditolak</td></tr>'}
      </tbody>
    </table>
  `;

  await exportHtmlToPDF(html, filename, "landscape");
}
