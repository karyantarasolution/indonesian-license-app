import { NextRequest, NextResponse } from 'next/server';
import { getMySQLPool } from '@/lib/mysql';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

async function ensureTable() {
  const pool = getMySQLPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS kamus_perizinan (
      id VARCHAR(36) PRIMARY KEY,
      istilah VARCHAR(255) NOT NULL,
      pengertian TEXT NOT NULL,
      kategori VARCHAR(100) NOT NULL DEFAULT 'Umum',
      published BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

async function seedDefaultData() {
  const pool = getMySQLPool();
  const [existing] = await pool.execute('SELECT COUNT(*) as count FROM kamus_perizinan');
  const count = (existing as any[])[0].count;
  if (count > 0) return;

  const defaultEntries = [
    { istilah: 'SLA (Service Level Agreement)', pengertian: 'Perjanjian tingkat layanan yang menjamin standar waktu pelayanan dalam proses perizinan. Di DPMPTSP Kabupaten Tapin, target SLA adalah 14 hari kerja sejak permohonan diterima hingga izin selesai diproses. Jika melebihi 14 hari, permohonan akan ditandai sebagai "terlambat".', kategori: 'Umum' },
    { istilah: 'Izin Usaha', pengertian: 'Persetujuan resmi dari pemerintah yang memberikan hak kepada pelaku usaha untuk menjalankan kegiatan usaha tertentu sesuai dengan peraturan perundang-undangan yang berlaku.', kategori: 'Izin' },
    { istilah: 'Izin Mendirikan Bangunan (IMB)', pengertian: 'Persetujuan dari pemerintah daerah yang memberikan izin kepada pemilik bangunan untuk mendirikan, mengubah, memperluas, atau merawat bangunan sesuai dengan peruntukan dan ketentuan yang berlaku.', kategori: 'Izin' },
    { istilah: 'Izin Gangguan (HO)', pengertian: 'Izin yang diberikan kepada setiap orang atau badan hukum yang menjalankan kegiatan usaha atau kegiatan lainnya yang dapat menimbulkan gangguan terhadap lingkungan sekitar.', kategori: 'Izin' },
    { istilah: 'NIB (Nomor Induk Berusaha)', pengertian: 'Nomor identitas yang diterbitkan oleh OSS (Online Single Submission) untuk setiap pelaku usaha sebagai tanda telah terdaftar dalam sistem perizinan usaha.', kategori: 'Umum' },
    { istilah: 'OSS (Online Single Submission)', pengertian: 'Sistem perizinan berbasis elektronik yang terintegrasi untuk memudahkan pelaku usaha dalam mendapatkan perizinan usaha secara online dan terpadu.', kategori: 'Umum' },
    { istilah: 'DPMPTSP', pengertian: 'Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu. Instansi pemerintah daerah yang bertanggung jawab dalam pengelolaan penanaman modal dan pelayanan perizinan di tingkat kabupaten/kota.', kategori: 'Lembaga' },
    { istilah: 'Perizinan Berusaha', pengertian: 'Pemberian izin kepada pelaku usaha untuk melakukan kegiatan usaha berdasarkan risiko kegiatan usaha. Meliputi izin usaha, izin komersial, dan izin operasional.', kategori: 'Umum' },
    { istilah: 'Retribusi Perizinan', pengertian: 'Pungutan yang dibebankan kepada pemohon izin sebagai balas jasa pelayanan perizinan yang diberikan oleh pemerintah daerah. Besaran retribusi ditetapkan berdasarkan peraturan daerah yang berlaku.', kategori: 'Umum' },
    { istilah: 'Tracking Code', pengertian: 'Kode unik berupa kombinasi huruf dan angka (8 karakter) yang diberikan kepada setiap pemohon untuk melacak status permohonan perizinan secara real-time melalui sistem SIP.', kategori: 'Umum' },
    { istilah: 'Pemohon', pengertian: 'Perorangan atau badan hukum yang mengajukan permohonan perizinan kepada DPMPTSP Kabupaten Tapin melalui sistem SIP atau secara langsung.', kategori: 'Umum' },
    { istilah: 'Rekomendasi', pengertian: 'Pendapat atau saran teknis dari instansi terkait yang menjadi bahan pertimbangan dalam pemberian izin. Proses rekomendasi merupakan tahapan dalam alur perizinan.', kategori: 'Proses' },
    { istilah: 'Verifikasi', pengertian: 'Proses pengecekan dan validasi dokumen serta data yang diajukan oleh pemohon untuk memastikan kesesuaian dengan persyaratan perizinan yang berlaku.', kategori: 'Proses' },
    { istilah: 'Berlaku Sampai', pengertian: 'Tanggal berakhirnya masa berlaku suatu izin. Setelah tanggal ini, izin dianggap expired dan pemohon harus melakukan perpanjangan untuk tetap dapat menjalankan kegiatan usaha.', kategori: 'Umum' },
    { istilah: 'Terlambat', pengertian: 'Status yang diberikan kepada permohonan perizinan yang melebihi batas waktu SLA (14 hari kerja). Permohonan terlambat tetap dapat diproses namun menunjukkan adanya keterlambatan dalam pelayanan.', kategori: 'Umum' },
  ];

  for (const entry of defaultEntries) {
    const id = crypto.randomUUID();
    await pool.execute(
      'INSERT INTO kamus_perizinan (id, istilah, pengertian, kategori, published) VALUES (?, ?, ?, ?, TRUE)',
      [id, entry.istilah, entry.pengertian, entry.kategori]
    );
  }
}

export async function GET() {
  try {
    const pool = getMySQLPool();
    await ensureTable();
    await seedDefaultData();
    const [rows] = await pool.execute('SELECT * FROM kamus_perizinan ORDER BY kategori, istilah');
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTable();
    const body = await request.json();
    const { istilah, pengertian, kategori, published } = body;

    if (!istilah || !pengertian) {
      return NextResponse.json({ success: false, error: 'Istilah dan pengertian wajib diisi' }, { status: 400 });
    }

    const pool = getMySQLPool();
    const id = crypto.randomUUID();
    await pool.execute(
      'INSERT INTO kamus_perizinan (id, istilah, pengertian, kategori, published) VALUES (?, ?, ?, ?, ?)',
      [id, istilah, pengertian, kategori || 'Umum', published !== false]
    );

    const [rows] = await pool.execute('SELECT * FROM kamus_perizinan WHERE id = ?', [id]);
    return NextResponse.json({ success: true, data: (rows as any[])[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
