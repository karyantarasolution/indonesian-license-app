"use client";

import { useLicenses } from "@/contexts/license-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle2, Download, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function IzinExpiredPage() {
  const { licenses } = useLicenses();
  const { toast } = useToast();

  const expiredData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetH30 = new Date(today);
    targetH30.setDate(today.getDate() + 30);

    let expired = 0;
    let warning = 0;
    let active = 0;
    const items = [];

    for (const license of licenses) {
      if (license.status !== "selesai" || !license.berlakuSampai) continue;
      const validUntil = new Date(license.berlakuSampai);
      validUntil.setHours(0, 0, 0, 0);
      const diffTime = validUntil.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let statusExpired = "active";
      if (diffDays < 0) { statusExpired = "expired"; expired++; }
      else if (diffDays <= 30) { statusExpired = "warning"; warning++; }
      else { active++; }

      if (statusExpired !== "active") {
        items.push({ ...license, diffDays, statusExpired });
      }
    }
    items.sort((a, b) => a.diffDays - b.diffDays);
    return { expired, warning, active, items };
  }, [licenses]);

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      await import("jspdf-autotable");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.width;

      // Letterhead
      try {
        const response = await fetch("/logo.png");
        const blob = await response.blob();
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onload = (e) => {
            const imgData = e.target?.result as string;
            doc.addImage(imgData, "PNG", 10, 8, 22, 22);
            resolve();
          };
          reader.readAsDataURL(blob);
        });
      } catch {}

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("PEMERINTAH KABUPATEN TAPIN", pageWidth / 2, 12, { align: "center" });
      doc.setFontSize(10);
      doc.text("DINAS PENANAMAN MODAL DAN PELAYANAN", pageWidth / 2, 19, { align: "center" });
      doc.text("(DPMPTSP) KABUPATEN TAPIN", pageWidth / 2, 25, { align: "center" });
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Rantau, Kabupaten Tapin", pageWidth / 2, 31, { align: "center" });

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1);
      doc.line(10, 37, pageWidth - 10, 37);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("MONITORING MASA BERLAKU IZIN", pageWidth / 2, 46, { align: "center" });
      doc.setFontSize(9);
      doc.text(new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }), pageWidth / 2, 53, { align: "center" });

      const headers = ["No", "Nama Izin", "Jenis Izin", "Pemohon", "Berlaku Sampai", "Sisa Waktu", "Status"];
      const tableData = expiredData.items.map((item, index) => [
        index + 1,
        item.namaIzin || "",
        item.jenisIzin || "",
        item.pemohonNama || "-",
        item.berlakuSampai ? new Date(item.berlakuSampai).toLocaleDateString("id-ID") : "-",
        item.diffDays < 0 ? `Terlewat ${Math.abs(item.diffDays)} hari` : `${item.diffDays} hari lagi`,
        item.statusExpired === "expired" ? "Expired" : "Hampir Expired"
      ]);

      (doc as any).autoTable({
        head: [headers],
        body: tableData,
        startY: 60,
        styles: { fontSize: 8, cellPadding: 2.5, overflow: "linebreak", textColor: [0, 0, 0], lineColor: [128, 128, 128], lineWidth: 0.5, halign: "center" },
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: "bold", fontSize: 8, cellPadding: 3 },
        columnStyles: {
          0: { halign: "center", cellWidth: 12 },
          1: { halign: "left", cellWidth: 60 },
          2: { halign: "left", cellWidth: 50 },
          3: { halign: "left", cellWidth: 40 },
          4: { halign: "center", cellWidth: 35 },
          5: { halign: "center", cellWidth: 35 },
          6: { halign: "center", cellWidth: 30 },
        },
      });

      // Summary
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Ringkasan:", 10, finalY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Total Izin Expired: ${expiredData.expired}`, 10, finalY + 6);
      doc.text(`Mendekati Expired: ${expiredData.warning}`, 10, finalY + 11);
      doc.text(`Izin Aktif: ${expiredData.active}`, 10, finalY + 16);

      // TTD
      const ttdY = Math.max(finalY + 50, (doc as any).lastAutoTable.finalY + 50);
      doc.setFontSize(8);
      doc.text("Rantau, ______________________", pageWidth / 2 + 40, ttdY, { align: "center" });
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("KEPALA DINAS DPMPTSP", pageWidth / 2 + 40, ttdY + 8, { align: "center" });
      doc.text("KABUPATEN TAPIN", pageWidth / 2 + 40, ttdY + 16, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.text("_________________________", pageWidth / 2 + 40, ttdY + 35, { align: "center" });
      doc.setFont("helvetica", "bold");
      doc.text("H. Nama Kepala Dinas, S.STP, M.Si", pageWidth / 2 + 40, ttdY + 42, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("NIP. 19700101 199001 1 001", pageWidth / 2 + 40, ttdY + 48, { align: "center" });

      doc.save("monitoring-izin-expired.pdf");
      toast({ title: "Berhasil", description: "PDF monitoring expired berhasil di download" });
    } catch (e) {
      toast({ title: "Error", description: "Gagal export PDF", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />
      <AdminHeader />
      <main className="lg:pl-64 pb-8">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Clock className="h-8 w-8 text-primary" />
              Monitoring Masa Berlaku Izin
            </h2>
            <Button onClick={handleExportPDF} className="bg-emerald-600 hover:bg-emerald-700">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-800">Izin Sudah Expired</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">{expiredData.expired}</div>
                <p className="text-xs text-red-600 font-medium">Memerlukan tindakan segera</p>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-800">Mendekati Expired (≤ 30 Hari)</CardTitle>
                <Clock className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700">{expiredData.warning}</div>
                <p className="text-xs text-amber-600 font-medium">Beri tahu pemohon untuk perpanjangan</p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Izin Aktif Aman</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{expiredData.active}</div>
                <p className="text-xs text-green-600 font-medium">Masa berlaku masih panjang</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Izin Perlu Perhatian</CardTitle>
              <CardDescription>
                Menampilkan izin yang sudah habis masa berlaku atau akan habis dalam 30 hari ke depan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Nama Izin</TableHead>
                    <TableHead>Jenis Izin</TableHead>
                    <TableHead>Pemohon</TableHead>
                    <TableHead>Berlaku Sampai</TableHead>
                    <TableHead>Sisa Waktu</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiredData.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Tidak ada izin yang expired atau mendekati expired.
                      </TableCell>
                    </TableRow>
                  ) : (
                    expiredData.items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{item.namaIzin}</TableCell>
                        <TableCell>{item.jenisIzin}</TableCell>
                        <TableCell>{item.pemohonNama || '-'}</TableCell>
                        <TableCell>
                          {item.berlakuSampai ? new Date(item.berlakuSampai).toLocaleDateString("id-ID") : "-"}
                        </TableCell>
                        <TableCell>
                          {item.diffDays < 0 ? (
                            <span className="text-red-600 font-medium">Terlewat {Math.abs(item.diffDays)} hari</span>
                          ) : (
                            <span className="text-amber-600 font-medium">{item.diffDays} hari lagi</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.statusExpired === "expired" ? (
                            <Badge variant="destructive">Expired</Badge>
                          ) : (
                            <Badge className="bg-amber-500 hover:bg-amber-600">Hampir Expired</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
