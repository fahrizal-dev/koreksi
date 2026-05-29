# 🚀 Panduan Deploy ke Vercel

## Persiapan

### 1. Install Vercel CLI (Opsional)
```bash
npm install -g vercel
```

### 2. Pastikan Git sudah terinstall
```bash
git --version
```

## Cara Deploy

### Metode 1: Deploy via Website Vercel (PALING MUDAH) ✅

1. **Buat akun Vercel**
   - Buka: https://vercel.com/signup
   - Login dengan GitHub, GitLab, atau Bitbucket

2. **Push project ke GitHub**
   ```bash
   # Inisialisasi git (jika belum)
   git init
   
   # Add semua file
   git add .
   
   # Commit
   git commit -m "Initial commit - Aplikasi Koreksi AI"
   
   # Buat repository baru di GitHub
   # Lalu connect ke remote
   git remote add origin https://github.com/USERNAME/REPO-NAME.git
   git branch -M main
   git push -u origin main
   ```

3. **Import project di Vercel**
   - Login ke https://vercel.com
   - Klik "Add New Project"
   - Import repository GitHub Anda
   - Vercel akan auto-detect Next.js

4. **Set Environment Variables**
   - Di dashboard Vercel, buka project settings
   - Pilih "Environment Variables"
   - Tambahkan:
     - Key: `GEMINI_API_KEY`
     - Value: `[PASTE_API_KEY_ANDA_DISINI]`
   - Klik "Save"
   
   **Catatan**: Gunakan API key Anda dari Google AI Studio

5. **Deploy!**
   - Klik "Deploy"
   - Tunggu 1-2 menit
   - Aplikasi Anda akan live di: `https://nama-project.vercel.app`

### Metode 2: Deploy via CLI

```bash
# Login ke Vercel
vercel login

# Deploy
vercel

# Ikuti instruksi di terminal
# Set environment variable saat ditanya
```

## Setelah Deploy

### Akses dari HP/Mobile
- Buka browser di HP
- Masuk ke URL: `https://nama-project.vercel.app`
- Aplikasi akan berjalan seperti PWA (Progressive Web App)
- Bisa di-install ke home screen!

### Update Aplikasi
Setiap kali Anda push ke GitHub, Vercel akan auto-deploy:
```bash
git add .
git commit -m "Update fitur"
git push
```

## Troubleshooting

### Error: API Key tidak terbaca
- Pastikan environment variable `GEMINI_API_KEY` sudah di-set di Vercel dashboard
- Redeploy project setelah menambahkan env variable

### Error: Build failed
- Cek build logs di Vercel dashboard
- Pastikan semua dependencies ada di `package.json`

### Kamera tidak berfungsi di HP
- Pastikan akses HTTPS (Vercel otomatis pakai HTTPS)
- Izinkan akses kamera di browser settings

## Fitur Vercel Gratis

✅ Unlimited deployments
✅ Automatic HTTPS
✅ Global CDN
✅ Automatic Git integration
✅ Preview deployments untuk setiap PR
✅ 100GB bandwidth per bulan

## Tips

1. **Custom Domain**: Bisa tambahkan domain sendiri (gratis)
2. **Analytics**: Aktifkan Vercel Analytics untuk tracking
3. **Preview URL**: Setiap branch dapat preview URL sendiri
4. **Rollback**: Bisa rollback ke deployment sebelumnya dengan 1 klik

## Link Penting

- Dashboard Vercel: https://vercel.com/dashboard
- Dokumentasi: https://vercel.com/docs
- Status: https://vercel-status.com

---

**Selamat! Aplikasi Anda sekarang bisa diakses dari mana saja! 🎉**
