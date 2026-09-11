# Crib Society — API Specification

> Frontend contract only. No backend implementation is included in the initial scope.

## 1. Conventions
Base URL placeholder: `/api`
JSON request/response.
Authentication is conceptual and represented by a future token/session mechanism.

## 2. Auth
### POST /auth/login
Request: `{ email, password }`
Response: `{ user, token }`

### POST /auth/logout
Response: `{ success: true }`

## 3. Products
### GET /products
Query: `search`, `category`, `status`, `page`
Response: `{ data: Product[], meta }`

### POST /products
Request: `{ name, categoryId, price, stock, image, status }`

### PUT /products/:id
Request: partial Product fields.

### DELETE /products/:id
Response: `{ success: true }`

## 4. Orders
### GET /orders
Query: `status`, `date`, `page`

### POST /orders
Request: `{ items, paymentMethod, notes }`

### GET /orders/:id
Response: `{ order }`

### PATCH /orders/:id/status
Request: `{ status }`

## 5. Dashboard
### GET /dashboard/summary
Response: `{ salesToday, ordersToday, averageOrderValue, lowStockCount }`

### GET /dashboard/sales
Query: `period`

## 6. Staff
### GET /staff
### POST /staff
### PUT /staff/:id
### PATCH /staff/:id/status

## 7. Core Models
Product: `id, name, categoryId, price, stock, image, status`
Order: `id, items, subtotal, discount, tax, total, paymentMethod, status, createdAt`
User: `id, name, email, role, status`

## 8. Frontend Integration Rule
API calls must be isolated behind service modules. UI components must not contain raw fetch logic when a service abstraction is appropriate. Mock services should follow the same response shape as the API contract.
