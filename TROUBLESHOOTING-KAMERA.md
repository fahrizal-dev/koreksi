# Troubleshooting Kamera

## Masalah Umum dan Solusinya

### 1. Kamera Tidak Muncul / Layar Hitam

**Penyebab:**
- Browser memerlukan HTTPS untuk akses kamera (kecuali localhost)
- Izin kamera ditolak
- Kamera sedang digunakan aplikasi lain

**Solusi:**

#### A. Pastikan Menggunakan HTTPS atau Localhost
```bash
# Jika development lokal, akses dengan:
http://localhost:3000
# atau
http://127.0.0.1:3000

# Jika production, HARUS menggunakan HTTPS:
https://domain-anda.com
```

#### B. Berikan Izin Kamera di Browser

**Chrome/Edge:**
1. Klik ikon gembok/info di address bar
2. Pilih "Site settings" atau "Pengaturan situs"
3. Cari "Camera" dan ubah ke "Allow"
4. Refresh halaman

**Firefox:**
1. Klik ikon gembok di address bar
2. Klik tanda ">" di samping "Connection secure"
3. Pilih "More information"
4. Tab "Permissions" → Camera → Allow
5. Refresh halaman

**Safari (iOS):**
1. Settings → Safari → Camera
2. Pilih "Ask" atau "Allow"
3. Settings → [Nama App] → Camera → Enable

#### C. Tutup Aplikasi Lain yang Menggunakan Kamera
- Zoom, Teams, Skype, dll
- Aplikasi kamera bawaan
- Browser tab lain yang menggunakan kamera

### 2. Error "NotAllowedError" atau "PermissionDeniedError"

**Solusi:**
1. Hapus permission yang ditolak:
   - Chrome: Settings → Privacy and security → Site settings → Camera
   - Hapus situs dari "Blocked"
2. Refresh halaman dan izinkan akses kamera

### 3. Error "NotFoundError" atau "DevicesNotFoundError"

**Penyebab:**
- Tidak ada kamera terdeteksi
- Driver kamera bermasalah

**Solusi:**
1. Pastikan kamera terpasang dan aktif
2. Cek Device Manager (Windows) atau System Preferences (Mac)
3. Update driver kamera
4. Gunakan tombol "Upload" sebagai alternatif

### 4. Error "NotReadableError" atau "TrackStartError"

**Penyebab:**
- Kamera sedang digunakan aplikasi lain
- Hardware error

**Solusi:**
1. Tutup semua aplikasi yang menggunakan kamera
2. Restart browser
3. Restart komputer jika masih bermasalah

### 5. Video Freeze atau Lag

**Solusi:**
1. Tutup tab browser lain
2. Tutup aplikasi yang berat
3. Gunakan resolusi lebih rendah (akan otomatis adjust)
4. Gunakan browser yang lebih ringan

## Alternatif: Upload Foto

Jika kamera tetap tidak bisa digunakan, gunakan tombol **Upload** untuk memilih foto dari galeri:

1. Klik tombol 📁 (Upload)
2. Pilih foto dari galeri/file
3. Lanjutkan proses analisis

## Browser yang Direkomendasikan

✅ **Didukung Penuh:**
- Chrome 53+
- Firefox 36+
- Safari 11+
- Edge 79+

⚠️ **Terbatas:**
- Internet Explorer (tidak didukung)
- Browser lama

## Testing Kamera

Untuk test apakah kamera berfungsi:
1. Buka https://webcamtests.com
2. Jika kamera muncul di sana, berarti masalah ada di permission situs
3. Jika tidak muncul, masalah ada di hardware/driver

## Kontak Support

Jika masalah masih berlanjut, hubungi developer dengan informasi:
- Browser dan versi
- Operating system
- Error message dari console (F12 → Console)
- Screenshot masalah
