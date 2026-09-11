# Crib Society — Product Requirements Document

## 1. Product Overview
Crib Society is a modern coffee-shop web platform combining a public marketing/ordering experience with an operational POS and owner/staff management dashboard.

## 2. Goals
- Present a strong Gen Z coffee brand identity.
- Support fast POS transactions.
- Give owners operational visibility.
- Give staff only the tools needed for daily operations.
- Build frontend-first so UI/UX and flows can be validated before backend integration.

## 3. Roles
### Guest / Customer
- View landing page, menu, brand story, location, promotions.
- Start an order flow where applicable.

### Staff
- Access POS.
- Create/manage orders.
- Manage cart, payment status, receipts.
- View operational information permitted to staff.

### Owner / Admin
- Dashboard overview.
- Manage products/categories.
- Monitor orders and sales.
- Manage staff access conceptually.
- Review operational metrics and settings.

## 4. Core Modules
1. Landing Page
2. POS
3. Owner Dashboard
4. Staff Dashboard
5. Product/Menu Management
6. Order Management
7. Sales & Operational Reports
8. Settings

## 5. Functional Requirements
- Responsive navigation and layouts.
- POS product search/filter by category.
- Cart with quantity controls, subtotal, tax/service configuration placeholder, total.
- Order status lifecycle.
- Dashboard KPI cards and recent activity.
- Product CRUD UI states.
- Role-aware navigation.
- Loading, empty, success, error, and confirmation states.
- Reusable UI components.

## 6. Non-Functional Requirements
- Responsive mobile/tablet/desktop.
- Accessible semantic HTML where applicable.
- Fast perceived interaction.
- Consistent design tokens.
- Frontend-first; API integration-ready.
- No backend implementation in the initial scope.

## 7. Scope Boundary
The initial implementation is limited to frontend architecture, screens, components, mock data, client-side state, and API-ready contracts. Backend, database, authentication infrastructure, payment gateway, and deployment automation are outside the initial build unless explicitly approved later.

## 8. Success Criteria
- Landing page communicates brand immediately.
- Staff can complete a mock POS transaction without friction.
- Owner can understand daily operational status within seconds.
- UI remains coherent across all modules.
