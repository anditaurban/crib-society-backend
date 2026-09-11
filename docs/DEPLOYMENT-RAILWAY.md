# Panduan Deploy ke Railway.com (1 Project: Database & API)

Panduan langkah demi langkah untuk melakukan deployment **Crib Society Coffee** ke [Railway.com](https://railway.com) dalam **1 Project** yang berisi:
1. **Service 1:** MySQL Database
2. **Service 2:** Node.js Express REST API

---

## Arsitektur di Railway

```text
[ Railway Project: crib-society ]
  ├── Service 1: MySQL Database
  │     ├── Private Network: mysql.railway.internal:3306 (untuk komunikasi internal dengan API)
  │     └── Public Network / TCP Proxy: *.proxy.rlwy.net:PORT (untuk import data langsung dari lokal)
  │
  └── Service 2: Express REST API (Web Service)
        ├── Mengambil env otomatis dari MySQL via Private Network
        └── Public Domain: https://crib-society-backend-production.up.railway.app
```

---

## Langkah 1: Persiapan Git Repository

Pastikan project backend sudah diinisialisasi dengan Git dan dipush ke GitHub:
```bash
git init
git add .
git commit -m "feat: initial crib society backend api"
git branch -M main
git remote add origin https://github.com/USERNAME/crib-society-backend.git
git push -u origin main
```
*(Catatan: Berkas `.env` dan `node_modules` sudah otomatis diabaikan oleh `.gitignore`).*

---

## Langkah 2: Buat Project & MySQL Database di Railway

1. Buka dashboard [Railway.com](https://railway.com) dan login.
2. Klik tombol **New Project**.
3. Pilih **Provision MySQL**.
   - Railway akan membuat **Service 1: MySQL**.
   - Tunggu beberapa detik sampai statusnya **Active**.

---

## Langkah 3: Import Database Menggunakan Public Network MySQL (Sangat Cepat & Praktis)

Mengaktifkan Public Network pada MySQL memungkinkan Anda mengimpor database langsung dari komputer lokal dalam hitungan detik tanpa khawatir Service API mengalami crash.

### 3.1 Aktifkan Public Network pada Service MySQL
1. Di dashboard Railway, klik **Service MySQL**.
2. Masuk ke tab **Settings**.
3. Gulir ke bawah ke bagian **Networking** $\rightarrow$ **Public Networking**.
4. Klik tombol **Add Public TCP Proxy** (atau **Generate Domain**).
5. Masuk ke tab **Connect**, cari bagian **Public Networking**.
6. Salin URL koneksi publik yang disediakan, formatnya seperti:
   ```text
   mysql://root:PASSWORD@switchback.proxy.rlwy.net:59233/railway
   ```

---

### 3.2 Cara Import `crib_society_db.sql` ke Railway

Pilih salah satu metode berikut yang paling Anda sukai:

#### Opsi A: Menggunakan Script Bawaan Project (`npm run migrate`) — Paling Direkomendasikan
Script `src/database/migrate.js` telah dirancang untuk otomatis membaca `MYSQL_URL`. Anda cukup menjalankan satu baris perintah berikut di terminal komputer Anda:

**Windows PowerShell:**
```powershell
$env:MYSQL_URL="mysql://root:PASSWORD@PROXY_HOST:PORT/railway"; npm run migrate
```
*(Ganti URL di atas dengan Public URL MySQL Railway Anda).*

**Linux / macOS / Git Bash:**
```bash
MYSQL_URL="mysql://root:PASSWORD@PROXY_HOST:PORT/railway" npm run migrate
```

Output terminal akan langsung menampilkan:
```text
🔄 Starting database migration and seeding for Crib Society...
✅ Connected to MySQL server.
📦 Ensuring database "railway" exists and is active...
📄 Executing crib_society_db.sql...
🎉 Database migration & seed completed successfully!
Database "railway" is fully populated and ready for production.
```

#### Opsi B: Menggunakan Database GUI (TablePlus / DBeaver / HeidiSQL)
1. Buka **TablePlus** atau **DBeaver**.
2. Buat koneksi baru dengan memilih **Import from URL** / paste Public Connection URL Railway.
3. Buka Query Editor $\rightarrow$ Buka berkas `database/crib_society_db.sql` $\rightarrow$ Klik **Run All**.

#### Opsi C: Menggunakan MySQL CLI Native
```bash
mysql -h switchback.proxy.rlwy.net -P 59233 -u root -p railway < database/crib_society_db.sql
```

---

## Langkah 4: Tambahkan Service API dari GitHub

1. Di dalam project Railway yang sama, klik tombol **+ Create** (atau **New Service**).
2. Pilih **GitHub Repo**.
3. Pilih repository `crib-society-backend` Anda.
4. Railway akan mendeteksi project Node.js secara otomatis.

---

## Langkah 5: Hubungkan Environment Variables ke Service API

Buka **Service API** $\rightarrow$ tab **Variables**, lalu tambahkan:

| Variable Name | Value (Reference / Nilai) | Keterangan |
| :--- | :--- | :--- |
| `MYSQL_URL` | `${{MySQL.MYSQL_URL}}` | Menggunakan koneksi internal private network Railway |
| `NODE_ENV` | `production` | Mode produksi |
| `JWT_SECRET` | `crib_society_super_secret_jwt_key_2026_gen_z` | Kunci rahasia JWT Anda |
| `PORT` | *(Dibiarkan kosong)* | Railway otomatis mengatur port |

> **Catatan:**  
> Untuk komunikasi antara Service API ke MySQL di Railway, gunakan reference `${{MySQL.MYSQL_URL}}` (Private Network) agar latensi nol dan kuota data gratis di dalam jaringan Railway.

---

## Langkah 6: Atur Start Command & Generate Domain

Karena database sudah selesai diimpor pada Langkah 3, Service API hanya perlu menjalankan server secara normal:

1. Buka **Service API** $\rightarrow$ tab **Settings**.
2. Pastikan **Custom Start Command** bernilai standar:
   ```bash
   npm start
   ```
3. Gulir ke bagian **Networking** $\rightarrow$ **Public Networking**, klik **Generate Domain**.
4. Anda akan mendapatkan URL publik API, contohnya:
   ```text
   https://crib-society-backend-production.up.railway.app
   ```

---

## Langkah 7: Verifikasi Endpoint

Coba buka di browser atau Postman:
- **Health Check:** `https://crib-society-backend-production.up.railway.app/api/health`
- **Public Menu:** `https://crib-society-backend-production.up.railway.app/api/products`
- **Login Owner:** `POST /api/auth/login` (email: `owner@cribsociety.com`, password: `password123`)

Koleksi Postman pada berkas [collection.json](file:///c:/laragon/www/crib_society_coffee/backend/collection.json) sudah otomatis menggunakan URL production ini.
