# ⚡ Quick Start - Deploy dalam 5 Menit

## 🚀 Super Cepat (Recommended)

### 1. Push ke GitHub
```bash
cd C:\xampp\htdocs\Koreksi
git init
git add .
git commit -m "Initial commit"
# Buat repo di github.com, lalu:
git remote add origin https://github.com/USERNAME/koreksi-ai.git
git push -u origin main
```

### 2. Deploy ke Vercel
1. Buka: https://vercel.com/new
2. Login dengan GitHub
3. Import repository `koreksi-ai`
4. **PENTING**: Tambahkan Environment Variable:
   - `GEMINI_API_KEY` = `[PASTE_API_KEY_ANDA_DISINI]`
5. Klik "Deploy"

### 3. Selesai! 🎉
Akses dari HP: `https://koreksi-ai.vercel.app`

---

## 📱 Akses dari HP

1. Buka browser di HP
2. Masuk ke URL Vercel Anda
3. Klik "Share" → "Add to Home Screen"
4. Aplikasi jadi seperti app native!

---

## 🔄 Update Aplikasi

```bash
git add .
git commit -m "Update"
git push
```

Vercel auto-deploy dalam 1-2 menit!

---

## ⚠️ Jangan Lupa!

- ✅ Set `GEMINI_API_KEY` di Vercel
- ✅ Jangan commit `.env.local` ke GitHub
- ✅ Test di lokal dulu: `npm run build`

---

**Panduan Lengkap**: Lihat [CARA-DEPLOY.md](./CARA-DEPLOY.md)
