# 📱 Cara Deploy ke Vercel - Panduan Super Mudah

## 🎯 Tujuan
Setelah deploy, aplikasi bisa diakses dari HP/mobile dengan URL seperti:
`https://koreksi-ai.vercel.app`

---

## 📋 Langkah-langkah (5-10 menit)

### 1️⃣ Buat Akun GitHub (jika belum punya)

1. Buka: https://github.com/signup
2. Daftar dengan email
3. Verifikasi email

### 2️⃣ Upload Project ke GitHub

**Cara 1: Via GitHub Desktop (PALING MUDAH)**

1. Download GitHub Desktop: https://desktop.github.com/
2. Install dan login
3. Klik "Add" → "Add Existing Repository"
4. Pilih folder `C:\xampp\htdocs\Koreksi`
5. Klik "Publish repository"
6. Beri nama: `koreksi-ai`
7. Klik "Publish"

**Cara 2: Via Command Line**

```bash
# Masuk ke folder project
cd C:\xampp\htdocs\Koreksi

# Inisialisasi git
git init

# Add semua file
git add .

# Commit
git commit -m "Initial commit"

# Buat repository baru di GitHub (via website)
# Lalu jalankan:
git remote add origin https://github.com/USERNAME/koreksi-ai.git
git branch -M main
git push -u origin main
```

### 3️⃣ Deploy ke Vercel

1. **Buka Vercel**
   - https://vercel.com/signup
   - Login dengan akun GitHub Anda

2. **Import Project**
   - Klik "Add New..." → "Project"
   - Pilih repository `koreksi-ai`
   - Klik "Import"

3. **Configure Project**
   - Project Name: `koreksi-ai` (atau nama lain)
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Set Environment Variables** ⚠️ PENTING!
   - Klik "Environment Variables"
   - Tambahkan:
     ```
     Key: GEMINI_API_KEY
     Value: [PASTE_API_KEY_ANDA_DISINI]
     ```
   - Pilih: Production, Preview, Development (centang semua)
   - Klik "Add"
   
   **Catatan**: Gunakan API key Anda sendiri dari Google AI Studio

5. **Deploy!**
   - Klik "Deploy"
   - Tunggu 1-2 menit
   - ✅ SELESAI!

### 4️⃣ Akses dari HP

1. Buka browser di HP
2. Masuk ke URL yang diberikan Vercel
   - Contoh: `https://koreksi-ai.vercel.app`
3. Aplikasi siap digunakan!

---

## 🔄 Update Aplikasi

Setiap kali Anda ubah kode dan push ke GitHub, Vercel akan otomatis deploy ulang:

```bash
git add .
git commit -m "Update fitur"
git push
```

Tunggu 1-2 menit, aplikasi otomatis update!

---

## 🎨 Custom Domain (Opsional)

Mau pakai domain sendiri? Misalnya: `koreksi.com`

1. Beli domain (Niagahoster, Namecheap, dll)
2. Di Vercel dashboard → Settings → Domains
3. Tambahkan domain Anda
4. Update DNS sesuai instruksi Vercel
5. Selesai!

---

## ✅ Checklist Sebelum Deploy

- [ ] API key sudah di-set di Vercel
- [ ] Build berhasil (`npm run build`)
- [ ] `.env.local` tidak ter-commit (sudah di `.gitignore`)
- [ ] Repository sudah di GitHub

---

## 🆘 Troubleshooting

### Build Failed
**Solusi:**
- Cek build logs di Vercel
- Pastikan `npm run build` berhasil di lokal
- Cek apakah semua dependencies ada di `package.json`

### API Key Error
**Solusi:**
- Pastikan environment variable `GEMINI_API_KEY` sudah di-set
- Redeploy: Settings → Deployments → Redeploy

### Kamera Tidak Berfungsi di HP
**Solusi:**
- Pastikan menggunakan HTTPS (Vercel otomatis HTTPS)
- Izinkan akses kamera di browser settings
- Coba browser lain (Chrome/Safari)

### OCR Tidak Berfungsi
**Solusi:**
- Cek API key valid
- Cek quota Gemini API (free tier: 15 req/menit)
- Lihat logs di Vercel dashboard

---

## 📊 Monitoring

### Lihat Logs
1. Buka Vercel dashboard
2. Pilih project
3. Klik "Deployments"
4. Klik deployment terakhir
5. Lihat "Build Logs" atau "Function Logs"

### Analytics (Opsional)
1. Di Vercel dashboard → Analytics
2. Aktifkan Vercel Analytics
3. Lihat traffic, performance, dll

---

## 💰 Biaya

**GRATIS!** 🎉

Vercel Free Tier:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/bulan
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Preview deployments

Gemini API Free Tier:
- ✅ 15 requests/menit
- ✅ 1,500 requests/hari
- ✅ Unlimited untuk personal use

---

## 🎉 Selesai!

Aplikasi Anda sekarang:
- ✅ Live di internet
- ✅ Bisa diakses dari HP
- ✅ Auto-deploy saat update
- ✅ HTTPS secure
- ✅ Fast global CDN

**URL Anda:** `https://koreksi-ai.vercel.app`

Share ke teman-teman guru! 🚀

---

## 📞 Butuh Bantuan?

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- GitHub Issues: Buat issue di repository

---

**Happy Deploying! 🎊**
