# Koreksi - AI Grading Assistant

Aplikasi web untuk mengoreksi jawaban siswa otomatis menggunakan AI dan OCR.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup API Key
Buat file `.env.local`:
```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```
Dapatkan API key: https://platform.openai.com/api-keys

### 3. Jalankan Aplikasi
```bash
npm run dev
```
Buka: http://localhost:3000

## 📱 Cara Pakai

1. Pilih mode penilaian (Romawi II atau III)
2. Foto atau upload gambar soal + jawaban
3. Klik "Analisis AI"
4. Lihat hasil penilaian

## 📷 Troubleshooting Kamera

Jika kamera tidak muncul:

1. **Pastikan menggunakan HTTPS atau localhost**
   - Development: `http://localhost:3000` ✅
   - Production: `https://domain-anda.com` ✅
   - HTTP biasa: ❌ (browser akan blokir)

2. **Izinkan akses kamera di browser**
   - Klik ikon gembok di address bar
   - Pilih "Site settings" → Camera → Allow
   - Refresh halaman

3. **Tutup aplikasi lain yang pakai kamera**
   - Zoom, Teams, Skype, dll
   - Tab browser lain

4. **Gunakan alternatif Upload**
   - Klik tombol 📁 untuk upload foto dari galeri

Lihat [TROUBLESHOOTING-KAMERA.md](./TROUBLESHOOTING-KAMERA.md) untuk panduan lengkap.

## 🌐 Deploy ke Vercel

```bash
npm i -g vercel
vercel login
vercel
```

Jangan lupa set environment variable `OPENAI_API_KEY` di Vercel dashboard.

## ⚙️ Mode Penilaian

**Romawi II:** 0, 1, 2 (3 tingkat)
**Romawi III:** 0, 1, 2, 3, 4 (5 tingkat)

## 🛠️ Tech Stack

Next.js 14, React, TailwindCSS, OCR.space API (free), OpenAI GPT-4

**Perubahan:** Menggunakan OCR.space API (cloud-based) untuk OCR yang lebih cepat (2-5 detik) dibanding Tesseract.js (10-30 detik).

## 📝 License

MIT
