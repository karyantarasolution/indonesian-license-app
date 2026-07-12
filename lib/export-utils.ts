import type { License } from "@/contexts/license-context";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// ==================== LETTERHEAD FUNCTION ====================
/**
 * Adds a government letterhead to the PDF document
 * Includes the official header with logo and agency information
 */
async function addLetterhead(
  doc: jsPDF,
  title: string,
  subtitle: string = "",
): Promise<void> {
  const pageWidth = doc.internal.pageSize.width;
  const margin = 10;
  const logoWidth = 22;
  const logoHeight = 22;
  const textStartX = margin + logoWidth + 2; // Logo + very small gap

  // White background for letterhead
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 55, "F");

  // Load and add logo
  try {
    const response = await fetch("/logo.png");
    const blob = await response.blob();
    const reader = new FileReader();

    await new Promise<void>((resolve) => {
      reader.onload = (e) => {
        const imgData = e.target?.result as string;
        doc.addImage(imgData, "PNG", margin, 8, logoWidth, logoHeight);
        resolve();
      };
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Failed to load logo:", err);
  }

  // Calculate text center position accounting for logo area
  const textAreaWidth = pageWidth - (textStartX + margin);
  const textCenter = textStartX + textAreaWidth / 2;

  // Letterhead text
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("PEMERINTAH KABUPATEN TAPIN", textCenter, 12, { align: "center" });

  doc.setFontSize(10);
  doc.text("DINAS PENANAMAN MODAL DAN PELAYANAN", textCenter, 19, {
    align: "center",
  });

  doc.setFontSize(9);
  doc.text("(DPMPTSP) KABUPATEN TAPIN", textCenter, 25, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Rantau, Kabupaten Tapin", textCenter, 31, { align: "center" });

  // Bottom decorative line - Black
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.line(margin, 37, pageWidth - margin, 37);

  // Title section
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(title, pageWidth / 2, 46, { align: "center" });

  // Subtitle if provided
  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(subtitle, pageWidth / 2, 53, { align: "center" });
  }
}

// ==================== EXPORT EXCEL ====================
export async function exportToExcel(
  data: License[],
  filename = "perizinan-data",
) {
  console.log("[fix] Starting Excel export with data:", data.length, "items");

  try {
    const wb = XLSX.utils.book_new();

    const headerData = [
      ["WAKTU LAYANAN (SERVICE LEVEL AGREEMENT)"],
      ["PERIZINAN NON ELEKTRONIK"],
      ["DPMPTSP KABUPATEN TAPIN"],
      ["2025"],
      [""], // Empty row for spacing
      [
        "NO",
        "JENIS IZIN",
        "NAMA IZIN",
        "ALAMAT",
        "SEKTOR",
        "TANGGAL PEMOHON MASUK",
        "TANGGAL PERMINTAAN REKOMENDASI",
        "TANGGAL PERMINTAAN REKOMENDASI DI SERAHKAN",
        "TANGGAL REKOMENDASI",
        "TANGGAL REKOMENDASI IZIN DITERIMA",
        "TANGGAL TERBIT IZIN",
        "TANGGAL PENYERAHAN IZIN",
        "REKOMENDASI HARI",
        "PERIZINAN (HARI)",
        "TOTAL SLA",
        "STATUS",
        "KETERANGAN",
      ],
    ];

    const licenseData = data.map((license, index) => {
      // Tentukan status: prioritas untuk verificationStatus === "rejected"
      const statusText =
        license.verificationStatus === "rejected"
          ? "ditolak"
          : license.status || "";

      // Tentukan keterangan: jika ditolak, tampilkan alasan penolakan
      const keteranganText =
        license.verificationStatus === "rejected" && license.verificationNotes
          ? license.verificationNotes
          : license.keterangan || "";

      return [
        index + 1,
        license.jenisIzin || "",
        license.namaIzin || "",
        license.lokasiIzin || "",
        license.sektor || "",
        license.permohonanMasuk || "",
        license.tglPermintaanRekomendasi || "",
        license.tglPermintaanRekomendasiDiserahkan || "",
        license.tglRekomendasi || "",
        license.tglRekomendasiIzinDiterima || "",
        license.tglTerbitIzin || "",
        license.tglPenyerahanIzin || "",
        license.rekomendasiHari || "",
        license.perizinanHari || "",
        license.totalSLA || "",
        statusText,
        keteranganText,
      ];
    });

    const allData = [...headerData, ...licenseData];
    const ws = XLSX.utils.aoa_to_sheet(allData);

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 16 } }, // WAKTU LAYANAN
      { s: { r: 1, c: 0 }, e: { r: 1, c: 16 } }, // PERIZINAN NON ELEKTRONIK
      { s: { r: 2, c: 0 }, e: { r: 2, c: 16 } }, // DPMPTSP KABUPATEN TAPIN
      { s: { r: 3, c: 0 }, e: { r: 3, c: 16 } }, // 2025
    ];

    ws["!cols"] = [
      { wch: 5 }, // NO
      { wch: 20 }, // JENIS IZIN
      { wch: 30 }, // NAMA IZIN
      { wch: 25 }, // ALAMAT
      { wch: 20 }, // SEKTOR
      { wch: 25 }, // TANGGAL PEMOHON MASUK
      { wch: 30 }, // TANGGAL PERMINTAAN REKOMENDASI
      { wch: 35 }, // TANGGAL PERMINTAAN REKOMENDASI DI SERAHKAN
      { wch: 25 }, // TANGGAL REKOMENDASI
      { wch: 30 }, // TANGGAL REKOMENDASI IZIN DITERIMA
      { wch: 25 }, // TANGGAL TERBIT IZIN
      { wch: 25 }, // TANGGAL PENYERAHAN IZIN
      { wch: 20 }, // REKOMENDASI HARI
      { wch: 20 }, // PERIZINAN (HARI)
      { wch: 15 }, // TOTAL SLA
      { wch: 15 }, // STATUS
      { wch: 40 }, // KETERANGAN
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Data Perizinan");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    return { blob, filename: `${filename}.xlsx` };
  } catch (err) {
    console.error("Excel export error:", err);
    throw err;
  }
}

// ==================== EXPORT PDF ====================
export async function exportToPDF(
  data: License[],
  filename = "perizinan-data",
) {
  console.log("[fix] Starting PDF export with data:", data.length, "items");

  try {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a3",
    });

    const pageWidth = doc.internal.pageSize.width;

    // Add letterhead
    await addLetterhead(
      doc,
      "LAPORAN LAYANAN PERIZINAN NON ELEKTRONIK",
      "Service Level Agreement (SLA) Monitoring",
    );

    const headers = [
      "NO",
      "JENIS IZIN",
      "NAMA IZIN",
      "ALAMAT",
      "SEKTOR",
      "TANGGAL PEMOHON MASUK",
      "TANGGAL PERMINTAAN REKOMENDASI I",
      "TANGGAL PERMINTAAN REKOMENDASI DI SERAHKAN",
      "TANGGAL REKOMENDASI I",
      "TANGGAL REKOMENDASI IZIN DITERIMA",
      "TANGGAL TERBIT IZIN",
      "TANGGAL PENYERAHAN IZIN",
      "REKOMENDASI (HARI)",
      "PERIZINAN (HARI)",
      "TOTAL SLA",
      "STATUS",
      "KETERANGAN",
    ];

    const formatDateForPDF = (dateString: string | null | undefined) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID");
      } catch {
        return "";
      }
    };

    const tableData = data.map((license, index) => {
      // Tentukan status: prioritas untuk verificationStatus === "rejected"
      const statusText =
        license.verificationStatus === "rejected"
          ? "ditolak"
          : license.status || "";

      // Tentukan keterangan: jika ditolak, tampilkan alasan penolakan
      const keteranganText =
        license.verificationStatus === "rejected" && license.verificationNotes
          ? license.verificationNotes
          : license.keterangan || "";

      return [
        index + 1,
        license.jenisIzin || "",
        license.namaIzin || "",
        license.lokasiIzin || "",
        license.sektor || "",
        formatDateForPDF(license.permohonanMasuk),
        formatDateForPDF(license.tglPermintaanRekomendasi),
        formatDateForPDF(license.tglPermintaanRekomendasiDiserahkan),
        formatDateForPDF(license.tglRekomendasi),
        formatDateForPDF(license.tglRekomendasiIzinDiterima),
        formatDateForPDF(license.tglTerbitIzin),
        formatDateForPDF(license.tglPenyerahanIzin),
        license.rekomendasiHari || 0,
        license.perizinanHari || 0,
        license.totalSLA || 0,
        statusText,
        keteranganText,
      ];
    });

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 70,
      tableLineColor: [255, 255, 255], // Hide outer table border (white)
      tableLineWidth: 0, // Remove outer table border
      styles: {
        fontSize: 8, // Increased from 7 to 8 for better readability
        cellPadding: 2.5, // Increased padding for better spacing
        overflow: "linebreak",
        cellWidth: "wrap",
        textColor: [0, 0, 0], // Set text color to black
        lineColor: [128, 128, 128], // Set border color to dark gray
        lineWidth: 0.5, // Set border width
        halign: "center", // Center align all text
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        fontSize: 8, // Increased from 7 to 8
        cellPadding: 3,
        lineColor: [128, 128, 128], // Set border color to dark gray
        lineWidth: 0.5, // Set border width
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 14 }, // NO - increased for better visibility
        1: { halign: "center", cellWidth: 26 }, // JENIS IZIN - increased width
        2: { halign: "center", cellWidth: 34 }, // NAMA IZIN - increased width
        3: { halign: "center", cellWidth: 28 }, // ALAMAT - increased width
        4: { halign: "center", cellWidth: 22 }, // SEKTOR - increased width
        5: { halign: "center", cellWidth: 24 }, // TANGGAL PEMOHON MASUK - increased width
        6: { halign: "center", cellWidth: 26 }, // TANGGAL PERMINTAAN REKOMENDASI - increased width
        7: { halign: "center", cellWidth: 28 }, // TANGGAL PERMINTAAN REKOMENDASI DI SERAHKAN - increased width
        8: { halign: "center", cellWidth: 24 }, // TANGGAL REKOMENDASI - increased width
        9: { halign: "center", cellWidth: 26 }, // TANGGAL REKOMENDASI IZIN DITERIMA - increased width
        10: { halign: "center", cellWidth: 24 }, // TANGGAL TERBIT IZIN - increased width
        11: { halign: "center", cellWidth: 24 }, // TANGGAL PENYERAHAN IZIN - increased width
        12: { halign: "center", cellWidth: 18 }, // REKOMENDASI HARI - increased width
        13: { halign: "center", cellWidth: 18 }, // PERIZINAN (HARI) - increased width
        14: { halign: "center", cellWidth: 18 }, // TOTAL SLA - increased width
        15: { halign: "center", cellWidth: 20 }, // STATUS - increased width
        16: { halign: "center", cellWidth: 32 }, // KETERANGAN - increased width
      },
      margin: { left: 8, right: 8 }, // Reduced margins for more table space
      tableWidth: "auto",
    });

    // Add notes section
    const finalY = (doc as any).lastAutoTable.finalY || 70;
    const notesY = finalY + 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Catatan :", 8, notesY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(
      "• REKOMENDASI (Hari) = TGL PERMINTAAN REKOM s/d TGL REKOMENDASI TERBIT",
      8,
      notesY + 5,
    );
    doc.text(
      "• PERIZINAN (Hari) = TGL PERMOHONAN MASUK s/d TGL TERBIT IZIN",
      8,
      notesY + 10,
    );
    doc.text(
      "• TOTAL SLA (Hari) = TGL PERMOHONAN MASUK s/d TGL PENYERAHAN IZIN",
      8,
      notesY + 15,
    );

    // Add TTD (Signature) section
    const ttdY = (doc as any).lastAutoTable.finalY + 50;
    const ttdCenter = pageWidth / 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Rantau, ______________________", ttdCenter + 40, ttdY, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("KEPALA DINAS DPMPTSP", ttdCenter + 40, ttdY + 8, { align: "center" });
    doc.text("KABUPATEN TAPIN", ttdCenter + 40, ttdY + 16, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("_________________________", ttdCenter + 40, ttdY + 35, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text("H. Nama Kepala Dinas, S.STP, M.Si", ttdCenter + 40, ttdY + 42, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("NIP. 19700101 199001 1 001", ttdCenter + 40, ttdY + 48, { align: "center" });

    const pdfBlob = new Blob([doc.output("blob")], { type: "application/pdf" });
    return { blob: pdfBlob, filename: `${filename}.pdf` };
  } catch (err) {
    console.error("PDF export error:", err);
    throw err;
  }
}

// ==================== EXPORT SLA PERFORMANCE TABLE TO PDF ====================
export async function exportSLAPerformanceToPDF(
  data: License[],
  filename = "laporan-performa-sla",
) {
  console.log(
    "[export] Starting SLA Performance PDF export with data:",
    data.length,
    "items",
  );

  try {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.width;

    // Add letterhead
    await addLetterhead(
      doc,
      "DETAIL LAPORAN PERFORMA SLA",
      "Analisis detail performa SLA untuk setiap perizinan",
    );

    doc.setFontSize(9);
    const dateStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    doc.text(`Tanggal Laporan: ${dateStr}`, pageWidth / 2, 65, {
      align: "center",
    });

    const headers = [
      "No",
      "Nama Izin",
      "Tanggal Masuk",
      "Tanggal Selesai",
      "Durasi Aktual",
      "Target SLA",
      "Status SLA",
      "Selisih Hari",
      "Penyebab Keterlambatan",
    ];

    const tableData = data.map((license, index) => {
      const isOverdue = license.totalSLA > 14;
      const selisihHari = license.totalSLA - 14;
      const tanggalMasuk = license.permohonanMasuk
        ? new Date(license.permohonanMasuk)
        : null;
      const tanggalSelesai = license.tglPenyerahanIzin
        ? new Date(license.tglPenyerahanIzin)
        : null;

      return [
        index + 1,
        license.namaIzin || "",
        tanggalMasuk ? tanggalMasuk.toLocaleDateString("id-ID") : "-",
        tanggalSelesai ? tanggalSelesai.toLocaleDateString("id-ID") : "-",
        `${license.totalSLA || 0} hari`,
        "14 hari",
        isOverdue ? "Terlambat" : "Tepat Waktu",
        isOverdue ? `+${selisihHari} hari` : `${selisihHari} hari`,
        isOverdue ? license.keterangan || "Dokumen tidak lengkap" : "-",
      ];
    });

    // Calculate wider table width - almost full width with small margins
    const availableWidth = pageWidth - 10; // 5mm margin on each side
    const totalColumnWidth = 15 + 40 + 25 + 25 + 20 + 18 + 22 + 20 + 35; // Original widths
    const scaleFactor = availableWidth / totalColumnWidth;

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 72,
      tableLineColor: [255, 255, 255],
      tableLineWidth: 0,
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        overflow: "linebreak",
        textColor: [0, 0, 0],
        lineColor: [128, 128, 128],
        lineWidth: 0.5,
        halign: "center",
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        fontSize: 8,
        cellPadding: 3,
        lineColor: [128, 128, 128],
        lineWidth: 0.5,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 * scaleFactor }, // No
        1: { halign: "left", cellWidth: 40 * scaleFactor }, // Nama Izin
        2: { halign: "center", cellWidth: 25 * scaleFactor }, // Tanggal Masuk
        3: { halign: "center", cellWidth: 25 * scaleFactor }, // Tanggal Selesai
        4: { halign: "center", cellWidth: 20 * scaleFactor }, // Durasi Aktual
        5: { halign: "center", cellWidth: 18 * scaleFactor }, // Target SLA
        6: { halign: "center", cellWidth: 22 * scaleFactor }, // Status SLA
        7: { halign: "center", cellWidth: 20 * scaleFactor }, // Selisih Hari
        8: { halign: "left", cellWidth: 35 * scaleFactor }, // Penyebab Keterlambatan
      },
      margin: { left: 5, right: 5 },
      tableWidth: availableWidth,
    });

    // Add summary statistics
    const finalY = (doc as any).lastAutoTable.finalY || 72;
    const summaryY = finalY + 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Ringkasan:", 8, summaryY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    const tepatWaktu = data.filter((l) => l.totalSLA <= 14).length;
    const terlambat = data.filter((l) => l.totalSLA > 14).length;
    const total = data.length;
    const persentaseTepatWaktu =
      total > 0 ? Math.round((tepatWaktu / total) * 100) : 0;

    const licensesWithSLA = data.filter((l) => l.totalSLA > 0);
    const avgSLA =
      licensesWithSLA.length > 0
        ? licensesWithSLA.reduce((sum, l) => sum + l.totalSLA, 0) /
          licensesWithSLA.length
        : 0;

    doc.text(`• Total Perizinan: ${total}`, 8, summaryY + 6);
    doc.text(
      `• Tepat Waktu: ${tepatWaktu} (${persentaseTepatWaktu}%)`,
      8,
      summaryY + 11,
    );
    doc.text(
      `• Terlambat: ${terlambat} (${total > 0 ? Math.round((terlambat / total) * 100) : 0}%)`,
      8,
      summaryY + 16,
    );
    doc.text(
      `• Rata-rata SLA: ${Math.round(avgSLA * 10) / 10} hari`,
      8,
      summaryY + 21,
    );
    doc.text(`• Target SLA: 14 hari maksimal`, 8, summaryY + 26);

    // Add TTD (Signature) section
    const ttdY = (doc as any).lastAutoTable.finalY + 50;
    const ttdCenter = pageWidth / 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Rantau, ______________________", ttdCenter + 40, ttdY, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("KEPALA DINAS DPMPTSP", ttdCenter + 40, ttdY + 8, { align: "center" });
    doc.text("KABUPATEN TAPIN", ttdCenter + 40, ttdY + 16, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("_________________________", ttdCenter + 40, ttdY + 35, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text("H. Nama Kepala Dinas, S.STP, M.Si", ttdCenter + 40, ttdY + 42, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("NIP. 19700101 199001 1 001", ttdCenter + 40, ttdY + 48, { align: "center" });

    const pdfBlob = new Blob([doc.output("blob")], { type: "application/pdf" });
    return { blob: pdfBlob, filename: `${filename}.pdf` };
  } catch (err) {
    console.error("SLA Performance PDF export error:", err);
    throw err;
  }
}

// ==================== EXPORT STATUS PERIZINAN TABLE TO PDF ====================
export async function exportStatusPerizinanToPDF(
  data: License[],
  overdueLicenses: License[],
  filename = "laporan-status-perizinan",
) {
  console.log(
    "[export] Starting Status Perizinan PDF export with data:",
    data.length,
    "items",
  );

  try {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = doc.internal.pageSize.width;

    // Add letterhead
    await addLetterhead(
      doc,
      "DETAIL LAPORAN STATUS PERIZINAN",
      "Overview lengkap status semua perizinan dengan timeline progress",
    );

    doc.setFontSize(9);
    const dateStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    doc.text(`Tanggal Laporan: ${dateStr}`, pageWidth / 2, 65, {
      align: "center",
    });

    const headers = [
      "No",
      "Nama Izin",
      "Jenis Izin",
      "Sektor",
      "Status Saat Ini",
      "Tanggal Masuk",
      "Durasi Proses",
      "Estimasi Selesai",
      "Prioritas",
      "Petugas Penanggung Jawab",
    ];

    // Calculate wider table width - almost full width with small margins
    const availableWidth = pageWidth - 10; // 5mm margin on each side
    const totalColumnWidth = 12 + 35 + 25 + 20 + 22 + 22 + 18 + 22 + 18 + 30; // Original widths
    const scaleFactor = availableWidth / totalColumnWidth;

    const tableData = data.map((license, index) => {
      const tanggalMasuk = license.permohonanMasuk
        ? new Date(license.permohonanMasuk)
        : null;
      const isOverdue = overdueLicenses.some((ol) => ol.id === license.id);
      const durasiProses = tanggalMasuk
        ? Math.floor(
            (new Date().getTime() - tanggalMasuk.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 0;
      const estimasiSelesai = tanggalMasuk
        ? new Date(tanggalMasuk.getTime() + 14 * 24 * 60 * 60 * 1000)
        : null;

      const getPrioritas = () => {
        if (isOverdue) return "Tinggi";
        if (license.status === "proses" && durasiProses > 10) return "Sedang";
        if (license.status === "draft") return "Rendah";
        return "Normal";
      };

      const getStatus = () => {
        // Prioritas: Jika verificationStatus ditolak, tampilkan "Ditolak"
        if (license.verificationStatus === "rejected") {
          return "Ditolak";
        }

        if (license.status === "draft") return "Draft";
        if (license.status === "proses") return "Dalam Proses";
        if (license.status === "rekomendasi") return "Menunggu Rekomendasi";
        if (license.status === "selesai") return "Selesai";
        return license.status || "-";
      };

      return [
        index + 1,
        license.namaIzin || "",
        license.jenisIzin || "",
        license.sektor || "-",
        getStatus(),
        tanggalMasuk ? tanggalMasuk.toLocaleDateString("id-ID") : "-",
        `${durasiProses} hari`,
        estimasiSelesai ? estimasiSelesai.toLocaleDateString("id-ID") : "-",
        getPrioritas(),
        license.createdBy || "Petugas Perizinan",
      ];
    });

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 72,
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: "linebreak",
        textColor: [0, 0, 0],
        lineColor: [128, 128, 128],
        lineWidth: 0.5,
        halign: "center",
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        fontSize: 7,
        cellPadding: 2.5,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 * scaleFactor }, // No
        1: { halign: "left", cellWidth: 35 * scaleFactor }, // Nama Izin
        2: { halign: "left", cellWidth: 25 * scaleFactor }, // Jenis Izin
        3: { halign: "left", cellWidth: 20 * scaleFactor }, // Sektor
        4: { halign: "center", cellWidth: 22 * scaleFactor }, // Status Saat Ini
        5: { halign: "center", cellWidth: 22 * scaleFactor }, // Tanggal Masuk
        6: { halign: "center", cellWidth: 18 * scaleFactor }, // Durasi Proses
        7: { halign: "center", cellWidth: 22 * scaleFactor }, // Estimasi Selesai
        8: { halign: "center", cellWidth: 18 * scaleFactor }, // Prioritas
        9: { halign: "left", cellWidth: 30 * scaleFactor }, // Petugas Penanggung Jawab
      },
      margin: { left: 5, right: 5 },
      tableWidth: availableWidth,
    });

    // Add TTD (Signature) section
    const ttdY = (doc as any).lastAutoTable.finalY + 50;
    const ttdCenter = pageWidth / 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Rantau, ______________________", ttdCenter + 40, ttdY, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("KEPALA DINAS DPMPTSP", ttdCenter + 40, ttdY + 8, { align: "center" });
    doc.text("KABUPATEN TAPIN", ttdCenter + 40, ttdY + 16, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("_________________________", ttdCenter + 40, ttdY + 35, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text("H. Nama Kepala Dinas, S.STP, M.Si", ttdCenter + 40, ttdY + 42, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("NIP. 19700101 199001 1 001", ttdCenter + 40, ttdY + 48, { align: "center" });

    const pdfBlob = new Blob([doc.output("blob")], { type: "application/pdf" });
    return { blob: pdfBlob, filename: `${filename}.pdf` };
  } catch (err) {
    console.error("Status Perizinan PDF export error:", err);
    throw err;
  }
}

// ==================== EXPORT ANALISIS SEKTOR TABLE TO PDF ====================
export async function exportAnalisisSektorToPDF(
  data: License[],
  sectorData: { sector: string; count: number }[],
  overdueLicenses: License[],
  filename = "laporan-analisis-sektor",
) {
  console.log("[export] Starting Analisis Sektor PDF export");

  try {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = doc.internal.pageSize.width;

    // Add letterhead
    await addLetterhead(
      doc,
      "DETAIL LAPORAN ANALISIS SEKTOR",
      "Analisis perizinan berdasarkan jenis izin dengan performa dan tren",
    );

    doc.setFontSize(9);
    const dateStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    doc.text(`Tanggal Laporan: ${dateStr}`, pageWidth / 2, 65, {
      align: "center",
    });

    const headers = [
      "No",
      "Nama Sektor",
      "Total Permohonan",
      "Selesai",
      "Dalam Proses",
      "Terlambat",
      "Rata-rata SLA",
      "Tingkat Penyelesaian",
      "Tren Bulan Ini",
      "Kompleksitas",
    ];

    // Calculate wider table width - almost full width with small margins
    const availableWidth = pageWidth - 10; // 5mm margin on each side
    const totalColumnWidth = 15 + 35 + 20 + 18 + 20 + 18 + 20 + 22 + 20 + 20; // Original widths
    const scaleFactor = availableWidth / totalColumnWidth;

    const tableData = sectorData.map(({ sector, count }, index) => {
      const sectorLicenses = data.filter((l) => l.sektor === sector);
      const selesai = sectorLicenses.filter(
        (l) => l.status === "selesai",
      ).length;
      const dalamProses = sectorLicenses.filter(
        (l) => l.status === "proses" || l.status === "rekomendasi",
      ).length;
      const terlambat = sectorLicenses.filter((l) =>
        overdueLicenses.some((ol) => ol.id === l.id),
      ).length;

      const licensesWithSLA = sectorLicenses.filter((l) => l.totalSLA > 0);
      const avgSLA =
        licensesWithSLA.length > 0
          ? licensesWithSLA.reduce((sum, l) => sum + l.totalSLA, 0) /
            licensesWithSLA.length
          : 0;

      const tingkatPenyelesaian =
        count > 0 ? Math.round((selesai / count) * 100) : 0;

      const getKompleksitas = () => {
        if (avgSLA > 12) return "Tinggi";
        if (avgSLA > 8) return "Sedang";
        return "Rendah";
      };

      return [
        index + 1,
        sector,
        count.toString(),
        selesai.toString(),
        dalamProses.toString(),
        terlambat.toString(),
        `${Math.round(avgSLA * 10) / 10} hari`,
        `${tingkatPenyelesaian}%`,
        "N/A", // Tren bulan ini tidak bisa dihitung dengan data statis
        getKompleksitas(),
      ];
    });

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 72,
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        overflow: "linebreak",
        textColor: [0, 0, 0],
        lineColor: [128, 128, 128],
        lineWidth: 0.5,
        halign: "center",
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        fontSize: 8,
        cellPadding: 3,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 * scaleFactor }, // No
        1: { halign: "left", cellWidth: 35 * scaleFactor }, // Nama Sektor
        2: { halign: "center", cellWidth: 20 * scaleFactor }, // Total Permohonan
        3: { halign: "center", cellWidth: 18 * scaleFactor }, // Selesai
        4: { halign: "center", cellWidth: 20 * scaleFactor }, // Dalam Proses
        5: { halign: "center", cellWidth: 18 * scaleFactor }, // Terlambat
        6: { halign: "center", cellWidth: 20 * scaleFactor }, // Rata-rata SLA
        7: { halign: "center", cellWidth: 22 * scaleFactor }, // Tingkat Penyelesaian
        8: { halign: "center", cellWidth: 20 * scaleFactor }, // Tren Bulan Ini
        9: { halign: "center", cellWidth: 20 * scaleFactor }, // Kompleksitas
      },
      margin: { left: 5, right: 5 },
      tableWidth: availableWidth,
    });

    // Add TTD (Signature) section
    const ttdY = (doc as any).lastAutoTable.finalY + 50;
    const ttdCenter = pageWidth / 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Rantau, ______________________", ttdCenter + 40, ttdY, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("KEPALA DINAS DPMPTSP", ttdCenter + 40, ttdY + 8, { align: "center" });
    doc.text("KABUPATEN TAPIN", ttdCenter + 40, ttdY + 16, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("_________________________", ttdCenter + 40, ttdY + 35, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text("H. Nama Kepala Dinas, S.STP, M.Si", ttdCenter + 40, ttdY + 42, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("NIP. 19700101 199001 1 001", ttdCenter + 40, ttdY + 48, { align: "center" });

    const pdfBlob = new Blob([doc.output("blob")], { type: "application/pdf" });
    return { blob: pdfBlob, filename: `${filename}.pdf` };
  } catch (err) {
    console.error("Analisis Sektor PDF export error:", err);
    throw err;
  }
}

// ==================== EXPORT PERIODE WAKTU TABLE TO PDF ====================
export async function exportPeriodeWaktuToPDF(
  periodData: Array<{ period: string; licenses: License[] }>,
  overdueLicenses: License[],
  filename = "laporan-periode-waktu",
) {
  console.log("[export] Starting Periode Waktu PDF export");

  try {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = doc.internal.pageSize.width;

    // Add letterhead
    await addLetterhead(
      doc,
      "DETAIL LAPORAN PERIODE WAKTU",
      "Analisis trend dan pola perizinan berdasarkan waktu dengan perbandingan performa",
    );

    doc.setFontSize(9);
    const dateStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    doc.text(`Tanggal Laporan: ${dateStr}`, pageWidth / 2, 65, {
      align: "center",
    });

    const headers = [
      "No",
      "Periode",
      "Total Permohonan",
      "Permohonan Selesai",
      "Permohonan Terlambat",
      "Rata-rata SLA",
      "Tingkat Penyelesaian",
      "Perbandingan Bulan Lalu",
      "Target vs Realisasi",
      "Catatan Khusus",
    ];

    // Calculate wider table width - almost full width with small margins
    const availableWidth = pageWidth - 10; // 5mm margin on each side
    const totalColumnWidth = 12 + 30 + 20 + 22 + 22 + 18 + 22 + 25 + 22 + 30; // Original widths
    const scaleFactor = availableWidth / totalColumnWidth;

    const tableData = periodData.map(
      ({ period, licenses: periodLicenses }, index) => {
        const total = periodLicenses.length;
        const selesai = periodLicenses.filter(
          (l) => l.status === "selesai",
        ).length;
        const terlambat = periodLicenses.filter((l) =>
          overdueLicenses.some((ol) => ol.id === l.id),
        ).length;

        const licensesWithSLA = periodLicenses.filter((l) => l.totalSLA > 0);
        const avgSLA =
          licensesWithSLA.length > 0
            ? licensesWithSLA.reduce((sum, l) => sum + l.totalSLA, 0) /
              licensesWithSLA.length
            : 0;

        const tingkatPenyelesaian =
          total > 0 ? Math.round((selesai / total) * 100) : 0;
        const targetPenyelesaian = 90;
        const pencapaianTarget = Math.round(
          (tingkatPenyelesaian / targetPenyelesaian) * 100,
        );

        const getCatatanKhusus = () => {
          if (tingkatPenyelesaian >= 95) return "Performa excellent";
          if (tingkatPenyelesaian >= 85) return "Performa baik";
          if (tingkatPenyelesaian >= 70) return "Performa cukup";
          if (terlambat > total * 0.2) return "Banyak keterlambatan";
          return "Perlu perhatian";
        };

        return [
          index + 1,
          period,
          total.toString(),
          selesai.toString(),
          terlambat.toString(),
          `${Math.round(avgSLA * 10) / 10} hari`,
          `${tingkatPenyelesaian}%`,
          "N/A", // Perbandingan bulan lalu tidak bisa dihitung dengan data statis
          `${pencapaianTarget}%`,
          getCatatanKhusus(),
        ];
      },
    );

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 72,
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: "linebreak",
        textColor: [0, 0, 0],
        lineColor: [128, 128, 128],
        lineWidth: 0.5,
        halign: "center",
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        fontSize: 7,
        cellPadding: 2.5,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 * scaleFactor }, // No
        1: { halign: "left", cellWidth: 30 * scaleFactor }, // Periode
        2: { halign: "center", cellWidth: 20 * scaleFactor }, // Total Permohonan
        3: { halign: "center", cellWidth: 22 * scaleFactor }, // Permohonan Selesai
        4: { halign: "center", cellWidth: 22 * scaleFactor }, // Permohonan Terlambat
        5: { halign: "center", cellWidth: 18 * scaleFactor }, // Rata-rata SLA
        6: { halign: "center", cellWidth: 22 * scaleFactor }, // Tingkat Penyelesaian
        7: { halign: "center", cellWidth: 25 * scaleFactor }, // Perbandingan Bulan Lalu
        8: { halign: "center", cellWidth: 22 * scaleFactor }, // Target vs Realisasi
        9: { halign: "left", cellWidth: 30 * scaleFactor }, // Catatan Khusus
      },
      margin: { left: 5, right: 5 },
      tableWidth: availableWidth,
    });

    // Add TTD (Signature) section
    const ttdY = (doc as any).lastAutoTable.finalY + 50;
    const ttdCenter = pageWidth / 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Rantau, ______________________", ttdCenter + 40, ttdY, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("KEPALA DINAS DPMPTSP", ttdCenter + 40, ttdY + 8, { align: "center" });
    doc.text("KABUPATEN TAPIN", ttdCenter + 40, ttdY + 16, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("_________________________", ttdCenter + 40, ttdY + 35, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text("H. Nama Kepala Dinas, S.STP, M.Si", ttdCenter + 40, ttdY + 42, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("NIP. 19700101 199001 1 001", ttdCenter + 40, ttdY + 48, { align: "center" });

    const pdfBlob = new Blob([doc.output("blob")], { type: "application/pdf" });
    return { blob: pdfBlob, filename: `${filename}.pdf` };
  } catch (err) {
    console.error("Periode Waktu PDF export error:", err);
    throw err;
  }
}

// ==================== EXPORT KETERLAMBATAN & RISIKO TABLE TO PDF ====================
export async function exportKeterlambatanRisikoToPDF(
  data: License[],
  overdueLicenses: License[],
  filename = "laporan-keterlambatan-risiko",
) {
  console.log("[export] Starting Keterlambatan & Risiko PDF export");

  try {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = doc.internal.pageSize.width;

    // Add letterhead
    await addLetterhead(
      doc,
      "DETAIL LAPORAN KETERLAMBATAN & RISIKO",
      "Identifikasi dan analisis perizinan bermasalah dengan rekomendasi tindakan perbaikan",
    );

    doc.setFontSize(9);
    const dateStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    doc.text(`Tanggal Laporan: ${dateStr}`, pageWidth / 2, 65, {
      align: "center",
    });

    // Generate delay risk data (same logic as in component)
    const generateDelayRiskData = () => {
      interface DelayRiskItem {
        license: License;
        tanggalMasuk: Date | null;
        targetSelesai: Date | null;
        durasiTerlambat: number;
        statusRisiko: string;
        tingkatRisiko: string;
        durasiProses?: number;
      }
      const delayRiskData: DelayRiskItem[] = [];

      const terlambatLicenses = data.filter((l) => l.totalSLA > 14);
      terlambatLicenses.forEach((license) => {
        const tanggalMasuk = license.permohonanMasuk
          ? new Date(license.permohonanMasuk)
          : null;
        const targetSelesai = tanggalMasuk
          ? new Date(tanggalMasuk.getTime() + 14 * 24 * 60 * 60 * 1000)
          : null;
        const durasiTerlambat = license.totalSLA - 14;

        delayRiskData.push({
          license,
          tanggalMasuk,
          targetSelesai,
          durasiTerlambat,
          statusRisiko: "Terlambat",
          tingkatRisiko: "Tinggi",
        });
      });

      const berisikoLicenses = data.filter((l) => {
        const durasi = l.permohonanMasuk
          ? Math.floor(
              (new Date().getTime() - new Date(l.permohonanMasuk).getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 0;
        return durasi > 10 && l.status !== "selesai" && l.totalSLA <= 14;
      });

      berisikoLicenses.forEach((license) => {
        const tanggalMasuk = license.permohonanMasuk
          ? new Date(license.permohonanMasuk)
          : null;
        const targetSelesai = tanggalMasuk
          ? new Date(tanggalMasuk.getTime() + 14 * 24 * 60 * 60 * 1000)
          : null;
        const durasiProses = tanggalMasuk
          ? Math.floor(
              (new Date().getTime() - tanggalMasuk.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 0;

        delayRiskData.push({
          license,
          tanggalMasuk,
          targetSelesai,
          durasiTerlambat: 0,
          statusRisiko: "Berisiko Tinggi",
          tingkatRisiko: "Tinggi",
          durasiProses,
        });
      });

      const earlyWarningLicenses = data.filter((l) => {
        const durasi = l.permohonanMasuk
          ? Math.floor(
              (new Date().getTime() - new Date(l.permohonanMasuk).getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 0;
        return (
          durasi >= 7 &&
          durasi <= 10 &&
          l.status !== "selesai" &&
          l.totalSLA <= 14
        );
      });

      earlyWarningLicenses.forEach((license) => {
        const tanggalMasuk = license.permohonanMasuk
          ? new Date(license.permohonanMasuk)
          : null;
        const targetSelesai = tanggalMasuk
          ? new Date(tanggalMasuk.getTime() + 14 * 24 * 60 * 60 * 1000)
          : null;
        const durasiProses = tanggalMasuk
          ? Math.floor(
              (new Date().getTime() - tanggalMasuk.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 0;

        delayRiskData.push({
          license,
          tanggalMasuk,
          targetSelesai,
          durasiTerlambat: 0,
          statusRisiko: "Early Warning",
          tingkatRisiko: "Sedang",
          durasiProses,
        });
      });

      return delayRiskData.sort((a, b) => {
        if (a.tingkatRisiko !== b.tingkatRisiko) {
          return a.tingkatRisiko === "Tinggi" ? -1 : 1;
        }
        return b.durasiTerlambat - a.durasiTerlambat;
      });
    };

    const delayRiskData = generateDelayRiskData();

    const headers = [
      "No",
      "Nama Izin",
      "Tanggal Masuk",
      "Target Selesai",
      "Durasi Terlambat",
      "Status Risiko",
      "Penyebab Utama",
      "Tindakan yang Diambil",
      "Estimasi Selesai",
      "Petugas Penanggung Jawab",
      "Status Tindak Lanjut",
    ];

    // Calculate wider table width - almost full width with small margins
    const availableWidth = pageWidth - 10; // 5mm margin on each side
    const totalColumnWidth =
      12 + 30 + 20 + 20 + 20 + 22 + 30 + 28 + 22 + 28 + 22; // Original widths
    const scaleFactor = availableWidth / totalColumnWidth;

    const tableData = delayRiskData.map(
      (
        {
          license,
          tanggalMasuk,
          targetSelesai,
          durasiTerlambat,
          statusRisiko,
          durasiProses,
        },
        index,
      ) => {
        const estimasiSelesai = new Date();
        estimasiSelesai.setDate(
          estimasiSelesai.getDate() + (durasiTerlambat > 0 ? 3 : 2),
        );

        const getPenyebabUtama = () => {
          if (durasiTerlambat > 0) {
            return license.keterangan || "Dokumen tidak lengkap";
          }
          if (durasiProses && durasiProses > 10) {
            return "Proses verifikasi memakan waktu lama";
          }
          if (durasiProses && durasiProses >= 7) {
            return "Menunggu dokumen tambahan";
          }
          return "Proses normal";
        };

        const getTindakanDiambil = () => {
          if (durasiTerlambat > 0) {
            return "Meminta dokumen tambahan";
          }
          if (durasiProses && durasiProses > 10) {
            return "Eskalasi ke supervisor";
          }
          if (durasiProses && durasiProses >= 7) {
            return "Follow up dengan pemohon";
          }
          return "Monitoring rutin";
        };

        const getStatusTindakLanjut = () => {
          if (durasiTerlambat > 0) {
            return "Dalam proses";
          }
          if (durasiProses && durasiProses > 10) {
            return "Eskalasi";
          }
          if (durasiProses && durasiProses >= 7) {
            return "Follow up";
          }
          return "Monitoring";
        };

        return [
          index + 1,
          license.namaIzin || "",
          tanggalMasuk ? tanggalMasuk.toLocaleDateString("id-ID") : "-",
          targetSelesai ? targetSelesai.toLocaleDateString("id-ID") : "-",
          durasiTerlambat > 0
            ? `${durasiTerlambat} hari`
            : durasiProses
              ? `${durasiProses} hari`
              : "-",
          statusRisiko,
          getPenyebabUtama(),
          getTindakanDiambil(),
          estimasiSelesai.toLocaleDateString("id-ID"),
          license.createdBy || "Petugas Perizinan",
          getStatusTindakLanjut(),
        ];
      },
    );

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 72,
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: "linebreak",
        textColor: [0, 0, 0],
        lineColor: [128, 128, 128],
        lineWidth: 0.5,
        halign: "center",
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        fontSize: 7,
        cellPadding: 2.5,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 * scaleFactor }, // No
        1: { halign: "left", cellWidth: 30 * scaleFactor }, // Nama Izin
        2: { halign: "center", cellWidth: 20 * scaleFactor }, // Tanggal Masuk
        3: { halign: "center", cellWidth: 20 * scaleFactor }, // Target Selesai
        4: { halign: "center", cellWidth: 20 * scaleFactor }, // Durasi Terlambat
        5: { halign: "center", cellWidth: 22 * scaleFactor }, // Status Risiko
        6: { halign: "left", cellWidth: 30 * scaleFactor }, // Penyebab Utama
        7: { halign: "left", cellWidth: 28 * scaleFactor }, // Tindakan yang Diambil
        8: { halign: "center", cellWidth: 22 * scaleFactor }, // Estimasi Selesai
        9: { halign: "left", cellWidth: 28 * scaleFactor }, // Petugas Penanggung Jawab
        10: { halign: "center", cellWidth: 22 * scaleFactor }, // Status Tindak Lanjut
      },
      margin: { left: 5, right: 5 },
      tableWidth: availableWidth,
    });

    // Add TTD (Signature) section
    const ttdY = (doc as any).lastAutoTable.finalY + 50;
    const ttdCenter = pageWidth / 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Rantau, ______________________", ttdCenter + 40, ttdY, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("KEPALA DINAS DPMPTSP", ttdCenter + 40, ttdY + 8, { align: "center" });
    doc.text("KABUPATEN TAPIN", ttdCenter + 40, ttdY + 16, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("_________________________", ttdCenter + 40, ttdY + 35, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text("H. Nama Kepala Dinas, S.STP, M.Si", ttdCenter + 40, ttdY + 42, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("NIP. 19700101 199001 1 001", ttdCenter + 40, ttdY + 48, { align: "center" });

    const pdfBlob = new Blob([doc.output("blob")], { type: "application/pdf" });
    return { blob: pdfBlob, filename: `${filename}.pdf` };
  } catch (err) {
    console.error("Keterlambatan & Risiko PDF export error:", err);
    throw err;
  }
}
