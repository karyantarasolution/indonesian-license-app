// Script untuk mengecek status database
const fs = require('fs');
const path = require('path');

console.log('🔍 Mengecek Status Database...\n');

// Cek file .env.local
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

let hasEnvFile = false;
let envContent = '';

if (fs.existsSync(envLocalPath)) {
  hasEnvFile = true;
  envContent = fs.readFileSync(envLocalPath, 'utf8');
  console.log('✅ File .env.local ditemukan');
} else if (fs.existsSync(envPath)) {
  hasEnvFile = true;
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ File .env ditemukan');
} else {
  console.log('❌ File .env atau .env.local TIDAK ditemukan');
}

// Cek environment variables dengan regex yang lebih akurat
// Support untuk format dengan atau tanpa newline di akhir
const lines = envContent.split(/\r?\n/).filter(line => line.trim());
const urlLine = lines.find(line => line.includes('NEXT_PUBLIC_SUPABASE_URL='));
const keyLine = lines.find(line => line.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY='));

// Extract value dengan cara yang lebih robust
let urlValue = null;
let keyValue = null;

if (urlLine) {
  const match = urlLine.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.+)/);
  urlValue = match ? match[1].trim() : null;
}

if (keyLine) {
  const match = keyLine.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(.+)/);
  keyValue = match ? match[1].trim() : null;
}


const hasSupabaseUrl = urlValue && 
                       urlValue.startsWith('https://') &&
                       urlValue.includes('.supabase.co') &&
                       !urlValue.includes('dummy') &&
                       !urlValue.includes('your-project');

const hasSupabaseKey = keyValue && 
                       keyValue.length > 50 && // anon key biasanya panjang
                       keyValue.startsWith('eyJ') && // JWT token biasanya mulai dengan eyJ
                       !keyValue.includes('dummy-key') &&
                       !keyValue.includes('your-anon-key');

console.log('\n📊 Status Konfigurasi:');
console.log('─'.repeat(50));

if (hasSupabaseUrl && hasSupabaseKey) {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL: Terkonfigurasi');
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Terkonfigurasi');
  console.log('\n🎉 Database sudah dikonfigurasi!');
  console.log('   Aplikasi akan menggunakan Supabase database.');
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL: Belum dikonfigurasi');
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: Belum dikonfigurasi');
  console.log('\n⚠️  Database BELUM di-setup!');
  console.log('   Aplikasi saat ini menggunakan localStorage.');
  console.log('   Data hanya tersimpan di browser dan tidak tersinkronisasi.');
  console.log('\n📝 Langkah Setup:');
  console.log('   1. Buat akun di https://supabase.com (gratis)');
  console.log('   2. Buat project baru');
  console.log('   3. Jalankan script SQL di database/setup.sql');
  console.log('   4. Copy Project URL dan anon key');
  console.log('   5. Buat file .env.local dengan isi:');
  console.log('      NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  console.log('\n   Lihat SETUP_DATABASE.md untuk panduan lengkap.');
}

console.log('\n' + '─'.repeat(50));

