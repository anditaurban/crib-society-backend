# Crib Society Coffee — API Integration Documentation

> **Base URL (Production):** `https://crib-society-backend-production.up.railway.app/api`  
> **Base URL (Local):** `http://localhost:5000/api`  
> **Content-Type:** `application/json`  
> **Target Audience:** Frontend Developers (Web, POS, Owner Dashboard) & Integration Testing  
> **Related Documents:** [API-SPEC.md](file:///c:/laragon/www/crib_society_coffee/backend/docs/API-SPEC.md), [BUSINESS-RULES.md](file:///c:/laragon/www/crib_society_coffee/backend/docs/BUSINESS-RULES.md), [DATABASE-SPEC.md](file:///c:/laragon/www/crib_society_coffee/backend/docs/DATABASE-SPEC.md)

---

## 1. Global Conventions & Headers

### Headers
| Header | Value | Required | Description |
| :--- | :--- | :---: | :--- |
| `Content-Type` | `application/json` | Yes | Wajib untuk request dengan body JSON (POST, PUT, PATCH). |
| `Authorization` | `Bearer <JWT_TOKEN>` | Conditional | Wajib untuk endpoint terproteksi (Staff & Owner). |

### Role Hierarchy & Token
- **`owner`**: Akses tak terbatas (CRUD Produk, Kategori, Staf, Dashboard, Pengaturan, Order).
- **`staff`**: Akses POS, riwayat order harian, ganti status order, dan cetak struk.
- **`guest`**: Akses menu publik, detail produk, dan inisiasi order jika diizinkan.

---

## 2. Health Check

### `GET /health`
Cek status server dan uptime.

#### Response (`200 OK`):
```json
{
  "status": "healthy",
  "timestamp": "2026-09-11T14:15:00.000Z",
  "service": "Crib Society API",
  "uptime": 312.65
}
```

---

## 3. Authentication Module

### 3.1 Register User / Staff
`POST /auth/register`  
Pendaftaran akun baru (default role: `staff`).

#### Request Body:
```json
{
  "name": "Alex Pratama",
  "email": "alex@cribsociety.com",
  "password": "password123",
  "role": "staff"
}
```

#### Response (`201 Created`):
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 5,
    "name": "Alex Pratama",
    "email": "alex@cribsociety.com",
    "role": "staff",
    "status": "active",
    "avatarUrl": null
  }
}
```

---

### 3.2 Login
`POST /auth/login`  
Autentikasi akun untuk memperoleh token JWT.

#### Request Body:
```json
{
  "email": "owner@cribsociety.com",
  "password": "password123"
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Owner Crib Society",
    "email": "owner@cribsociety.com",
    "role": "owner",
    "status": "active",
    "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
  }
}
```

---

### 3.3 Get Current User Profile
`GET /auth/me`  
Header: `Authorization: Bearer <token>`

#### Response (`200 OK`):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Owner Crib Society",
    "email": "owner@cribsociety.com",
    "role": "owner",
    "status": "active"
  }
}
```

---

### 3.4 Logout
`POST /auth/logout`

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "Successfully logged out."
}
```

---

## 4. Products Module (CRUD)

### 4.1 Get All Products
`GET /products`  
Query Parameters:
- `search` (opsional): cari nama/deskripsi.
- `category` (opsional): ID kategori atau slug kategori.
- `status` (opsional): `active`, `inactive`, `archived`. Default: semua non-archived.
- `page` (default: 1): nomor halaman.
- `limit` (default: 50): jumlah item per halaman.

Contoh URL: `/products?category=signature-drinks&status=active&page=1&limit=10`

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "categoryId": 1,
      "categoryName": "Signature Drinks",
      "categorySlug": "signature-drinks",
      "name": "Crib Iced White",
      "slug": "crib-iced-white",
      "description": "Signature creamy iced latte with brown palm sugar blend.",
      "price": 28000,
      "costPrice": 11000,
      "stock": 48,
      "lowStockThreshold": 5,
      "image": "/products/crib-iced-white.jpg",
      "status": "active",
      "isLowStock": 0,
      "createdAt": "2026-09-11T13:44:43.000Z",
      "updatedAt": "2026-09-11T14:05:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### 4.2 Get Product by ID
`GET /products/:id`

Contoh URL: `/products/1`

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "categoryId": 1,
    "categoryName": "Signature Drinks",
    "name": "Crib Iced White",
    "slug": "crib-iced-white",
    "description": "Signature creamy iced latte with brown palm sugar blend.",
    "price": 28000,
    "costPrice": 11000,
    "stock": 48,
    "lowStockThreshold": 5,
    "image": "/products/crib-iced-white.jpg",
    "status": "active",
    "createdAt": "2026-09-11T13:44:43.000Z",
    "updatedAt": "2026-09-11T14:05:00.000Z"
  }
}
```

---

### 4.3 Create Product (Owner Only)
`POST /products`  
Header: `Authorization: Bearer <owner_token>`

#### Request Body:
```json
{
  "categoryId": 1,
  "name": "Pistachio Oat Cold Brew",
  "price": 34000,
  "costPrice": 14500,
  "stock": 25,
  "lowStockThreshold": 5,
  "description": "Slow-steeped cold brew with velvety pistachio cream and oat milk.",
  "image": "/products/pistachio-coldbrew.jpg",
  "status": "active"
}
```

#### Response (`201 Created`):
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 13,
    "name": "Pistachio Oat Cold Brew",
    "slug": "pistachio-oat-cold-brew",
    "categoryId": 1,
    "price": 34000,
    "stock": 25,
    "status": "active"
  }
}
```

---

### 4.4 Update Product (Owner Only)
`PUT /products/:id`  
Header: `Authorization: Bearer <owner_token>`

#### Request Body (Partial Fields):
```json
{
  "price": 35000,
  "stock": 30,
  "description": "Slow-steeped cold brew with premium pistachio foam."
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "Product updated successfully"
}
```

---

### 4.5 Delete / Archive Product (Owner Only)
`DELETE /products/:id`  
Header: `Authorization: Bearer <owner_token>`  
*Catatan: Melakukan soft-delete (status menjadi `archived`) agar riwayat pesanan historis tetap konsisten.*

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "Product \"Pain au Chocolat\" archived successfully."
}
```

---

## 5. Categories Module (CRUD)

### 5.1 Get All Categories
`GET /categories`

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Signature Drinks",
      "slug": "signature-drinks",
      "description": "Kreasi kopi dan racikan minuman signature Crib Society.",
      "image": "/categories/signature.jpg",
      "sortOrder": 1,
      "isActive": 1
    },
    {
      "id": 2,
      "name": "Espresso Based",
      "slug": "espresso-based",
      "description": "Kopi klasik berbasis espresso berkualitas tinggi.",
      "image": "/categories/espresso.jpg",
      "sortOrder": 2,
      "isActive": 1
    }
  ]
}
```

---

### 5.2 Create Category (Owner Only)
`POST /categories`  
Header: `Authorization: Bearer <owner_token>`

#### Request Body:
```json
{
  "name": "Seasonal Specials",
  "description": "Minuman edisi terbatas dan kreasi musiman.",
  "image": "/categories/seasonal.jpg",
  "sortOrder": 6
}
```

#### Response (`201 Created`):
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 6,
    "name": "Seasonal Specials",
    "slug": "seasonal-specials",
    "sortOrder": 6
  }
}
```

---

### 5.3 Update Category (Owner Only)
`PUT /categories/:id`  
Header: `Authorization: Bearer <owner_token>`

#### Request Body:
```json
{
  "name": "Seasonal Specials 2026",
  "sortOrder": 1
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "Category updated successfully"
}
```

---

### 5.4 Delete Category (Owner Only)
`DELETE /categories/:id`  
Header: `Authorization: Bearer <owner_token>`  
*Catatan: Kategori yang masih memiliki produk aktif tidak dapat dihapus (akan mengembalikan error 409).*

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "Category deleted successfully."
}
```

---

## 6. Orders & POS Transactions Module

### 6.1 Create Order (POS / Checkout)
`POST /orders`  
Header: `Authorization: Bearer <staff_token>` *(atau opsional untuk order guest)*

#### Request Body (Pembayaran Tunai / Cash):
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "notes": "Less sugar, extra ice"
    },
    {
      "productId": 11,
      "quantity": 1,
      "notes": "Warmed up"
    }
  ],
  "paymentMethod": "cash",
  "customerName": "Rian Pradana",
  "customerPhone": "081234567890",
  "cashReceived": 100000,
  "notes": "Dine-in Table 05"
}
```

#### Response (`201 Created`):
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": 8,
    "orderNumber": "ORD-20260911-0008",
    "customerName": "Rian Pradana",
    "customerPhone": "081234567890",
    "items": [
      {
        "productId": 1,
        "productName": "Crib Iced White",
        "unitPrice": 28000,
        "quantity": 2,
        "subtotal": 56000,
        "notes": "Less sugar, extra ice"
      },
      {
        "productId": 11,
        "productName": "Butter Croissant",
        "unitPrice": 25000,
        "quantity": 1,
        "subtotal": 25000,
        "notes": "Warmed up"
      }
    ],
    "pricing": {
      "subtotal": 81000,
      "discount": 0,
      "tax": 8100,
      "service": 0,
      "total": 89100
    },
    "payment": {
      "method": "cash",
      "status": "paid",
      "amountPaid": 100000,
      "changeAmount": 10900,
      "referenceNo": null
    },
    "orderStatus": "processing",
    "notes": "Dine-in Table 05",
    "createdAt": "2026-09-11T14:15:20.000Z"
  }
}
```

#### Request Body (Pembayaran QRIS):
```json
{
  "items": [
    {
      "productId": 2,
      "quantity": 1
    }
  ],
  "paymentMethod": "qris",
  "customerName": "Amanda",
  "referenceNo": "QRIS-NMID-99283411",
  "notes": "Takeaway"
}
```

---

### 6.2 Get Orders List
`GET /orders`  
Header: `Authorization: Bearer <token>`  
Query Parameters:
- `status`: `pending`, `processing`, `completed`, `cancelled`.
- `date`: format `YYYY-MM-DD` (Jika login sebagai **Staff** dan `date` tidak diisi, otomatis memfilter order hari ini).
- `search`: nomor pesanan atau nama customer.
- `page`: default 1.
- `limit`: default 20.

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": 8,
      "orderNumber": "ORD-20260911-0008",
      "cashierId": 2,
      "cashierName": "Barista Sarah (Staff)",
      "customerName": "Rian Pradana",
      "customerPhone": "081234567890",
      "subtotal": 81000,
      "discount": 0,
      "tax": 8100,
      "service": 0,
      "total": 89100,
      "paymentMethod": "cash",
      "paymentStatus": "paid",
      "orderStatus": "processing",
      "notes": "Dine-in Table 05",
      "paidAt": "2026-09-11T14:15:20.000Z",
      "completedAt": null,
      "createdAt": "2026-09-11T14:15:20.000Z",
      "items": [
        {
          "productId": 1,
          "productName": "Crib Iced White",
          "unitPrice": 28000,
          "quantity": 2,
          "subtotal": 56000,
          "notes": "Less sugar, extra ice"
        }
      ]
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 6.3 Get Order Detail & Receipt
`GET /orders/:id`  
Mengembalikan payload lengkap untuk tampilan detail dan pencetakan struk kasir (*receipt*).

#### Response (`200 OK`):
```json
{
  "success": true,
  "order": {
    "id": 8,
    "orderNumber": "ORD-20260911-0008",
    "cashierId": 2,
    "cashierName": "Barista Sarah (Staff)",
    "customerName": "Rian Pradana",
    "customerPhone": "081234567890",
    "subtotal": 81000,
    "discount": 0,
    "tax": 8100,
    "service": 0,
    "total": 89100,
    "paymentMethod": "cash",
    "paymentStatus": "paid",
    "orderStatus": "processing",
    "notes": "Dine-in Table 05",
    "paidAt": "2026-09-11T14:15:20.000Z",
    "completedAt": null,
    "cancelledAt": null,
    "createdAt": "2026-09-11T14:15:20.000Z",
    "items": [
      {
        "id": 12,
        "productId": 1,
        "productName": "Crib Iced White",
        "unitPrice": 28000,
        "quantity": 2,
        "subtotal": 56000,
        "notes": "Less sugar, extra ice"
      }
    ],
    "payments": [
      {
        "id": 8,
        "paymentMethod": "cash",
        "amountDue": 89100,
        "amountPaid": 100000,
        "changeAmount": 10900,
        "referenceNo": null,
        "status": "success",
        "createdAt": "2026-09-11T14:15:20.000Z"
      }
    ],
    "statusLogs": [
      {
        "id": 15,
        "previousStatus": null,
        "newStatus": "processing",
        "reason": "Order initialized & payment confirmed via POS",
        "createdAt": "2026-09-11T14:15:20.000Z",
        "changedByName": "Barista Sarah (Staff)"
      }
    ]
  }
}
```

---

### 6.4 Update Order Status (Complete / Cancel)
`PATCH /orders/:id/status`  
Header: `Authorization: Bearer <token>`

#### 1. Menyelesaikan Pesanan (`completed`):
```json
{
  "status": "completed",
  "reason": "Pesanan telah disajikan ke meja 05"
}
```
Response (`200 OK`):
```json
{
  "success": true,
  "message": "Order status successfully updated to \"completed\".",
  "data": {
    "id": 8,
    "orderNumber": "ORD-20260911-0008",
    "previousStatus": "processing",
    "newStatus": "completed",
    "reason": "Pesanan telah disajikan ke meja 05"
  }
}
```

#### 2. Membatalkan Pesanan (`cancelled`):
*Catatan: Sistem secara otomatis mengembalikan (revert) stok produk kembali ke jumlah sebelum order dibuat.*
```json
{
  "status": "cancelled",
  "reason": "Pelanggan membatalkan pesanan karena salah pilih varian"
}
```
Response (`200 OK`):
```json
{
  "success": true,
  "message": "Order status successfully updated to \"cancelled\".",
  "data": {
    "id": 8,
    "orderNumber": "ORD-20260911-0008",
    "previousStatus": "processing",
    "newStatus": "cancelled",
    "reason": "Pelanggan membatalkan pesanan karena salah pilih varian"
  }
}
```

---

## 7. Dashboard & Analytics Module (Owner Only)

Header: `Authorization: Bearer <owner_token>`

### 7.1 Real-Time KPI Summary
`GET /dashboard/summary`

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "salesToday": 360800,
    "ordersToday": 5,
    "averageOrderValue": 72160,
    "lowStockCount": 2
  }
}
```
*Keterangan Formula:*
- `salesToday`: Total pendapatan dari order selesai (`completed`) hari ini.
- `ordersToday`: Jumlah total order selesai hari ini.
- `averageOrderValue`: Rata-rata nilai per order (`salesToday / ordersToday`).
- `lowStockCount`: Jumlah produk aktif dengan stok di bawah atau sama dengan ambang batas (`stock <= low_stock_threshold`).

---

### 7.2 Sales Analytics & Trend
`GET /dashboard/sales?period=7days`  
Query `period`: `today`, `7days`, `30days`, `monthly`, `yearly`.

#### Response (`200 OK`):
```json
{
  "success": true,
  "period": "7days",
  "data": [
    {
      "date": "2026-09-10",
      "totalSales": 125000,
      "totalOrders": 3
    },
    {
      "date": "2026-09-11",
      "totalSales": 360800,
      "totalOrders": 5
    }
  ]
}
```

---

## 8. Staff Management Module (Owner Only)

Header: `Authorization: Bearer <owner_token>`

### 8.1 Get All Staff
`GET /staff`

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Owner Crib Society",
      "email": "owner@cribsociety.com",
      "role": "owner",
      "status": "active",
      "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      "createdAt": "2026-09-11T13:44:43.000Z"
    },
    {
      "id": 2,
      "name": "Barista Sarah (Staff)",
      "email": "sarah@cribsociety.com",
      "role": "staff",
      "status": "active",
      "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      "createdAt": "2026-09-11T13:44:43.000Z"
    }
  ]
}
```

---

### 8.2 Create Staff
`POST /staff`

#### Request Body:
```json
{
  "name": "Rian Dimas",
  "email": "rian@cribsociety.com",
  "password": "password123",
  "role": "staff",
  "status": "active"
}
```

#### Response (`201 Created`):
```json
{
  "success": true,
  "message": "Staff member created successfully",
  "data": {
    "id": 6,
    "name": "Rian Dimas",
    "email": "rian@cribsociety.com",
    "role": "staff",
    "status": "active"
  }
}
```

---

### 8.3 Update Staff
`PUT /staff/:id`

#### Request Body:
```json
{
  "name": "Rian Dimas (Senior Barista)",
  "role": "staff"
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "Staff updated successfully"
}
```

---

### 8.4 Toggle Staff Status (Active / Inactive)
`PATCH /staff/:id/status`

#### Request Body:
```json
{
  "status": "inactive"
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "Staff status updated to \"inactive\"."
}
```

---

## 9. Store Settings Module

### 9.1 Get Settings
`GET /settings`

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "tax_rate_percent": 10,
    "service_charge_percent": 0,
    "default_low_stock_threshold": 5,
    "store_name": "Crib Society Coffee",
    "store_address": "Jl. Pandanaran No. 88, Semarang",
    "store_phone": "+62 812-3456-7890",
    "receipt_footer_text": "Thank you for vibing with Crib Society!"
  }
}
```

---

### 9.2 Update Settings (Owner Only)
`PUT /settings`  
Header: `Authorization: Bearer <owner_token>`

#### Request Body:
```json
{
  "tax_rate_percent": 10,
  "service_charge_percent": 2.5,
  "store_name": "Crib Society Coffee - Flagship",
  "receipt_footer_text": "Thank you for vibing with Crib Society! Have a productive day."
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

---

## 10. Standard Error Response Codes

Setiap kegagalan request akan mengembalikan struktur JSON konsisten:
```json
{
  "success": false,
  "message": "Deskripsi alasan kegagalan"
}
```

| HTTP Status Code | Makna | Contoh Situasi |
| :---: | :--- | :--- |
| **`400 Bad Request`** | Parameter / format input tidak lengkap atau tidak valid. | Password kurang dari 6 karakter, nama kosong. |
| **`401 Unauthorized`** | Token JWT tidak disediakan atau sudah kedaluwarsa. | Belum login, token palsu. |
| **`403 Forbidden`** | Role tidak memiliki hak akses atau akun non-aktif. | Staff mengakses menu Owner Dashboard / CRUD Produk. |
| **`404 Not Found`** | Sumber daya atau ID yang diminta tidak ditemukan. | Produk `#999` tidak ada. |
| **`409 Conflict`** | Terjadi benturan data unik. | Email sudah terdaftar, nama kategori duplikat. |
| **`422 Unprocessable Entity`** | Pelanggaran aturan bisnis domain (*Business Rules*). | Stok barang tidak mencukupi saat checkout, uang tunai kurang dari total tagihan, memodifikasi order berstatus terminal. |
| **`500 Server Error`** | Kesalahan internal server / basis data. | Gangguan koneksi basis data. |
