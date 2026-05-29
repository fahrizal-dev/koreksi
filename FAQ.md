# FAQ - Pertanyaan Umum

## Setup & Instalasi

**Q: Bagaimana cara install?**
```bash
npm install
echo "OPENAI_API_KEY=sk-xxx" > .env.local
npm run dev
```

**Q: Dimana dapat API key?**
https://platform.openai.com/api-keys

**Q: Kenapa error saat install?**
- Pastikan Node.js 18+ terinstall
- Hapus `node_modules` dan install ulang
- Cek koneksi internet

## Penggunaan

**Q: Bagaimana cara pakai?**
1. Pilih mode penilaian
2. Foto/upload gambar
3. Klik "Analisis AI"
4. Lihat hasil

**Q: Berapa lama proses?**
- Preprocessing: 1-2 detik
- OCR: 2-5 detik (menggunakan OCR.space API)
- AI: 5-10 detik
- **Total: 7-15 detik**

**Q: Kenapa lebih cepat sekarang?**
- Menggunakan OCR.space API (cloud-based)
- Tidak perlu download model OCR ke browser
- Server OCR.space lebih powerful

**Q: Apakah bisa offline?**
Tidak, butuh internet untuk OCR dan AI

## Mode Penilaian

**Q: Apa beda Romawi II dan III?**
- Romawi II: 3 tingkat (0,1,2)
- Romawi III: 5 tingkat (0,1,2,3,4)

**Q: Bisakah tambah mode baru?**
Ya, edit `app/api/analyze/route.js`

## OCR & AI

**Q: Kenapa OCR tidak akurat?**
- Foto blur/gelap
- Tulisan tidak jelas
- Ada bayangan

**Q: Apakah AI hanya cocokkan kata?**
Tidak, AI memahami makna dan konteks

## Biaya

**Q: Berapa biaya?**
- Hosting: Gratis (Vercel)
- OpenAI: ~Rp 1-5 per koreksi

## Deploy

**Q: Bagaimana deploy?**
```bash
npm i -g vercel
vercel login
vercel
```
Set `OPENAI_API_KEY` di Vercel dashboard

## Troubleshooting

**Q: Kamera tidak berfungsi**
- Allow camera permission
- Gunakan Chrome
- Gunakan HTTPS/localhost

**Q: AI error**
- Cek API key valid
- Cek saldo OpenAI
- Cek koneksi internet

**Q: Build error**
- Cek dependencies lengkap
- Cek environment variables
- Lihat logs di Vercel

---

**Masih ada masalah?** Buat issue di GitHub
