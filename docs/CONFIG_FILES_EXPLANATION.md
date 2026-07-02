# 📁 Penjelasan File Konfigurasi di Root Directory

## 🔴 File yang HARUS di Root (Tidak Bisa Dipindahkan)

File-file ini **WAJIB** berada di root directory karena tools dan framework mengharapkannya di sana:

### 1. `package.json` & `package-lock.json`
- **Wajib di root** - npm/node.js mencari file ini di root
- Berisi dependencies dan scripts project
- **TIDAK BISA** dipindahkan

### 2. `next.config.mjs`
- **Wajib di root** - Next.js mencari file konfigurasi ini di root
- Berisi konfigurasi Next.js (images, webpack, dll)
- **TIDAK BISA** dipindahkan

### 3. `tsconfig.json`
- **Wajib di root** - TypeScript compiler mencari file ini di root
- Berisi konfigurasi TypeScript dan path aliases
- **TIDAK BISA** dipindahkan

### 4. `postcss.config.mjs`
- **Wajib di root** - PostCSS mencari file ini di root
- Berisi konfigurasi PostCSS untuk Tailwind CSS
- **TIDAK BISA** dipindahkan

### 5. `components.json`
- **Wajib di root** - shadcn/ui mencari file ini di root
- Berisi konfigurasi untuk shadcn/ui components
- **TIDAK BISA** dipindahkan

### 6. `.gitignore`
- **Wajib di root** - Git mencari file ini di root
- Berisi daftar file/folder yang diabaikan Git
- **TIDAK BISA** dipindahkan

### 7. `.env.local`
- **Wajib di root** - Next.js membaca environment variables dari root
- Berisi variabel environment (tidak di-commit ke Git)
- **TIDAK BISA** dipindahkan

### 8. `next-env.d.ts`
- **Wajib di root** - Next.js generate file ini di root
- TypeScript definitions untuk Next.js
- **TIDAK BISA** dipindahkan

## 🟡 File yang BISA Dipindahkan (Tapi Tidak Disarankan)

File-file ini bisa dipindahkan, tapi tools/platform mengharapkannya di root:

### 1. `netlify.toml`
- **Bisa dipindahkan** tapi Netlify akan mencari di root
- Berisi konfigurasi deploy untuk Netlify
- **Disarankan tetap di root** untuk kemudahan

### 2. `vercel.json`
- **Bisa dipindahkan** tapi Vercel akan mencari di root
- Berisi konfigurasi deploy untuk Vercel
- **Disarankan tetap di root** untuk kemudahan

### 3. `README.md`
- **Bisa dipindahkan** ke folder `docs/`
- Tapi standar industry adalah README.md di root
- **Disarankan tetap di root** untuk kemudahan

## 🟢 File yang BISA Dipindahkan ke Folder

File-file ini bisa dipindahkan ke folder tanpa masalah:

### 1. `CLEANUP_SUMMARY.md`
- ✅ **Sudah dipindahkan** ke `docs/CLEANUP_SUMMARY.md`
- File dokumentasi bisa di folder `docs/`

### 2. File Dokumentasi Lainnya
- Semua file `.md` dokumentasi bisa dipindahkan ke `docs/`
- Tapi `README.md` sebaiknya tetap di root

## 📋 Rekomendasi Struktur Folder

```
project-root/
├── 📄 package.json              # HARUS di root
├── 📄 package-lock.json         # HARUS di root
├── 📄 next.config.mjs           # HARUS di root
├── 📄 tsconfig.json             # HARUS di root
├── 📄 postcss.config.mjs        # HARUS di root
├── 📄 components.json           # HARUS di root
├── 📄 .gitignore               # HARUS di root
├── 📄 .env.local               # HARUS di root
├── 📄 next-env.d.ts            # HARUS di root
├── 📄 netlify.toml             # Bisa di root (disarankan)
├── 📄 vercel.json              # Bisa di root (disarankan)
├── 📄 README.md                # Bisa di root (disarankan)
├── 📁 docs/                    # Folder untuk dokumentasi
│   ├── CLEANUP_SUMMARY.md
│   └── CONFIG_FILES_EXPLANATION.md
├── 📁 app/                     # Next.js app directory
├── 📁 components/              # React components
├── 📁 lib/                     # Utilities
├── 📁 database/                # Database scripts
└── 📁 public/                  # Static files
```

## ⚠️ Catatan Penting

1. **Jangan pindahkan file konfigurasi** yang wajib di root, karena akan menyebabkan error
2. **File dokumentasi** bisa dipindahkan ke folder `docs/` untuk kerapian
3. **File konfigurasi deploy** (netlify.toml, vercel.json) sebaiknya tetap di root untuk kemudahan
4. **README.md** sebaiknya tetap di root karena ini standar industry

## 🔄 Update yang Sudah Dilakukan

- ✅ `CLEANUP_SUMMARY.md` dipindahkan ke `docs/CLEANUP_SUMMARY.md`
- ✅ `netlify.toml` diupdate (hapus referensi Supabase, tambah MySQL)
- ✅ `vercel.json` diupdate (hapus referensi Supabase, tambah MySQL)

