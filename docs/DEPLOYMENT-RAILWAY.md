# Panduan Deploy ke Railway.com (1 Project: Database & API)

Panduan langkah demi langkah untuk melakukan deployment **Crib Society Coffee** ke [Railway.com](https://railway.com) dalam **1 Project** yang berisi:
1. **Service 1:** MySQL Database
2. **Service 2:** Node.js Express REST API

---

## Arsitektur di Railway

```text
[ Railway Project: crib-society ]
  ├── Service 1: MySQL Database (Private Network)
  │     ├── Host: mysql.railway.internal
  │     └── Port: 3306
  │
  └── Service 2: Express REST API (Web Service)
        ├── Mengambil env otomatis dari MySQL
        └── Public Domain: https://crib-society-api.up.railway.app
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

## Langkah 2: Buat Project Baru di Railway

1. Buka dashboard [Railway.com](https://railway.com) dan login.
2. Klik tombol **New Project**.
3. Pilih **Provision MySQL**.
   - Railway akan membuat **Service 1: MySQL**.
   - Tunggu beberapa detik sampai statusnya **Active**.

---

## Langkah 3: Tambahkan Service API dari GitHub

1. Di dalam project yang sama di Railway, klik tombol **+ Create** (atau **New Service**).
2. Pilih **GitHub Repo**.
3. Pilih repository `crib-society-backend` yang telah Anda push di Langkah 1.
4. Railway akan mendeteksi project Node.js secara otomatis.

---

## Langkah 4: Hubungkan Environment Variables

Backend Crib Society sudah dirancang untuk **otomatis mengenali variabel bawaan Railway**.

Buka **Service API** $\rightarrow$ tab **Variables**:

### Cara Termudah (Reference Variable):
Tambahkan variabel berikut:
| Variable Name | Value (Ketik atau pilih dropdown Railway) | Keterangan |
| :--- | :--- | :--- |
| `MYSQL_URL` | `${{MySQL.MYSQL_URL}}` | Otomatis terisi connection string MySQL |
| `NODE_ENV` | `production` | Mode produksi |
| `JWT_SECRET` | `crib_society_super_secret_jwt_key_2026_gen_z` | Kunci rahasia JWT Anda |
| `PORT` | *(Dibiarkan kosong / otomatis diatur Railway)* | Railway inject port otomatis |

*(Alternatif jika tidak memakai `MYSQL_URL`, Railway otomatis menyediakan `${{MySQL.MYSQLHOST}}`, `${{MySQL.MYSQLUSER}}`, `${{MySQL.MYSQLPASSWORD}}`, `${{MySQL.MYSQLPORT}}`, dan `${{MySQL.MYSQLDATABASE}}` yang sudah didukung secara native oleh kode `src/config/db.js`).*

---

## Langkah 5: Migrasi Database & Seeding di Railway

Ada 2 cara mudah untuk menjalankan migrasi dan seeding (`crib_society_db.sql`) ke MySQL Railway:

### Opsi A: Otomatis saat Deploy (Direkomendasikan)
1. Buka **Service API** $\rightarrow$ tab **Settings**.
2. Gulir ke bagian **Deploy** $\rightarrow$ **Custom Start Command**.
3. Masukkan perintah:
   ```bash
   npm run start:migrate
   ```
4. Setiap kali deploy, Railway akan menjalankan script migrasi & seed terlebih dahulu, kemudian menyalakan server. Setelah database sudah terisi di deploy pertama, Anda bisa mengembalikannya ke `npm start`.

### Opsi B: Menggunakan Railway CLI
Jalankan dari terminal lokal Anda:
```bash
npm install -g @railway/cli
railway login
railway link
railway run npm run migrate
```

---

## Langkah 6: Generate Public Domain

1. Buka **Service API** $\rightarrow$ tab **Settings**.
2. Gulir ke bagian **Networking** $\rightarrow$ **Public Networking**.
3. Klik **Generate Domain**.
4. Anda akan mendapatkan URL publik, contohnya:
   `https://crib-society-backend-production.up.railway.app`

---

## Langkah 7: Verifikasi Endpoint

Coba buka di browser atau Postman:
- **Health Check:** `https://DOMAIN-ANDA.up.railway.app/api/health`
- **Public Menu:** `https://DOMAIN-ANDA.up.railway.app/api/products`
- **Login Owner:** `https://DOMAIN-ANDA.up.railway.app/api/auth/login` (email: `owner@cribsociety.com`, password: `password123`)

Update variabel `base_url` pada [collection.json](file:///c:/laragon/www/crib_society_coffee/backend/collection.json) di Postman menjadi domain Railway Anda untuk mulai pengujian penuh.
