# Panduan Singkat - Koreksi

## 🚀 Langkah Cepat (5 Menit)

### 1. Install
```bash
npm install
```

### 2. Setup API Key
Buat file `.env.local`:
```
OPENAI_API_KEY=sk-your-key-here
```
Dapatkan di: https://platform.openai.com/api-keys

### 3. Jalankan
```bash
npm run dev
```

### 4. Akses Web
Buka browser: **http://localhost:3000**

(Jika port 3000 sudah dipakai, Next.js akan otomatis pakai port 3001, 3002, dst)

## 📱 Cara Pakai

1. **Pilih Mode** → Romawi II atau III
2. **Foto/Upload** → Ambil gambar soal + jawaban
3. **Analisis** → Klik tombol "Analisis AI"
4. **Lihat Hasil** → Nilai muncul otomatis

## 🌐 Deploy Online

```bash
npm i -g vercel
vercel login
vercel
```

Set `OPENAI_API_KEY` di Vercel dashboard → Settings → Environment Variables

Aplikasi akan live di: `https://your-app.vercel.app`

## ⚠️ Troubleshooting

**Warning "lockfile missing swc dependencies"?**
- Abaikan saja, aplikasi tetap jalan normal

**Kamera tidak berfungsi?**
- Allow camera permission di browser
- Gunakan Chrome

**AI error?**
- Cek API key sudah benar di `.env.local`
- Cek saldo OpenAI

**Build error?**
- Untuk development, cukup `npm run dev`
- Untuk production, deploy langsung ke Vercel

## 📞 Bantuan

Lihat **README.md** atau **FAQ.md** untuk detail lengkap.
