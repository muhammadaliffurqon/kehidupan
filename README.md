# 💼 App Kehidupan

Aplikasi pribadi untuk mengelola **keuangan**, **kegiatan**, dan **catatan motivasi & sastra** dalam satu tempat.

## Fitur

### 💰 Laporan Keuangan
- **Income & Expense Tracker** — pencatatan pemasukan/pengeluaran
- **Budget Planner** — anggaran per kategori dengan indikator Over/Aman
- **Pie Chart Pengeluaran** — visualisasi pengeluaran per kategori
- **Grafik Tren Bulanan** — pemasukan vs pengeluaran
- **Investment Tracker** — portofolio investasi + untung/rugi
- **Debt Tracker** — hutang & piutang

### 📋 Laporan Kegiatan
- **Daily Task Tracker** — checklist harian + prioritas
- **Time Tracker** — stopwatch + log jam kerja
- **Organization Log** — kegiatan organisasi/komunitas
- **Travel/Vacation Log** — liburan
- **Learning Log** — belajar hal baru
- **Produktivitas** — skor harian

### ✨ Catatan
- **Motivasi** — kumpulan kata-kata motivasi + quote random
- **Sastra** — kumpulan puisi, cerpen, dan prosa

Semua data disimpan di **Local Storage** browser (tidak perlu server database).

## Menjalankan Lokal

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Deploy ke GitHub Pages

1. **Buat repo baru** di GitHub (contoh: `AppKehidupan`). Jangan upload file dulu.

2. **Install Git** jika belum ada, lalu jalankan:
   ```bash
   cd app-kehidupan
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/AppKehidupan.git
   git push -u origin main
   ```
   Ganti `USERNAME` dengan username GitHub kamu.

3. **Aktifkan GitHub Pages** di repo:
   - Buka repo → **Settings** → **Pages** (jarak kiri)
   - Di bagian **Build and deployment** → **Source** pilih **GitHub Actions**
   - Tidak perlu settings lain — kamu tinggal push kode.

4. Workflow `deploy.yml` yang sudah ada akan otomatis build & deploy setiap kali kamu push ke branch `main`.

5. Website akan tersedia di:
   ```
   https://USERNAME.github.io/AppKehidupan/
   ```

> Catatan: `basePath` di `next.config.mjs` otomatis menggunakan nama repo saat build di GitHub Actions, jadi URL halaman akan benar tanpa perlu diubah manual.

## Teknologi

- [Next.js](https://nextjs.org)
- [React Bootstrap](https://react-bootstrap.netlify.app)
- [Chart.js](https://www.chartjs.org)
- [Bootstrap Icons](https://icons.getbootstrap.com)
