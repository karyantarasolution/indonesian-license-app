#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupEnvironment() {
  console.log('🚀 Setup Environment Variables untuk Indonesian License App\n');
  
  console.log('📋 Langkah-langkah:');
  console.log('1. Buka https://supabase.com dan buat project baru');
  console.log('2. Pergi ke Settings > API');
  console.log('3. Copy Project URL dan anon public key\n');
  
  const supabaseUrl = await question('Masukkan Supabase URL: ');
  const supabaseKey = await question('Masukkan Supabase Anon Key: ');
  
  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}

# Untuk development
NODE_ENV=development
`;
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ File .env.local berhasil dibuat!');
    console.log('📍 Lokasi:', envPath);
    console.log('\n🔧 Langkah selanjutnya:');
    console.log('1. Jalankan: npm run dev');
    console.log('2. Buka http://localhost:3000');
    console.log('3. Setup database dengan menjalankan script di database/setup.sql');
  } catch (error) {
    console.error('❌ Error membuat file .env.local:', error.message);
  }
  
  rl.close();
}

setupEnvironment().catch(console.error);


