# REST API SPECIFICATION
## Retail Inventory Management System (RIMS)
**Base URL:** `/api/v1`  
**Protocol:** HTTPS  
**Authentication:** HTTP Bearer Header (`Authorization: Bearer <JWT_TOKEN>`)  
**Format:** JSON (`Content-Type: application/json`)  

---

## 1. Authentication Endpoints (`/api/v1/auth`)

### 1.1 User Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "username": "admin",
  "password": "Password@123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": {
      "id": 2,
      "username": "admin",
      "email": "admin@xyzretail.com",
      "firstName": "Priya",
      "lastName": "Nair",
      "role": "ADMIN",
      "assignedLocationType": "HQ",
      "assignedLocationId": 1
    }
  }
}
```

### 1.2 Current User Profile
- **Endpoint:** `GET /api/v1/auth/me`
- **Access:** Authenticated Users

---

## 2. Product Catalog Endpoints (`/api/v1/products`)

### 2.1 List Products (Paged, Filtered, Sorted)
- **Endpoint:** `GET /api/v1/products`
- **Access:** All Authenticated Users
- **Query Parameters:**
  - `page`: Page number (default: 0)
  - `size`: Page size (default: 10)
  - `search`: Filter by name, SKU, or brand
  - `categoryId`: Filter by category ID
  - `status`: `ACTIVE`, `INACTIVE`, `DISCONTINUED`
  - `sort`: Sort property and direction (e.g. `createdAt,desc`)

### 2.2 Get Product By ID
- **Endpoint:** `GET /api/v1/products/{id}`
- **Access:** All Authenticated Users

### 2.3 Create Product
- **Endpoint:** `POST /api/v1/products`
- **Access:** `SUPER_ADMIN`, `ADMIN`
- **Request Body:**
```json
{
  "name": "Raymond Slim Fit Cotton Shirt",
  "sku": "PRD-MEN-005",
  "barcode": "890123400105",
  "description": "Premium 100% combed cotton shirt",
  "categoryId": 1,
  "brand": "Raymond",
  "purchasePrice": 1100.00,
  "sellingPrice": 2299.00,
  "imageUrl": "https://example.com/shirt.jpg",
  "minStockLevel": 15,
  "reorderPoint": 30,
  "safetyStock": 10
}
```

### 2.4 Update Product
- **Endpoint:** `PUT /api/v1/products/{id}`
- **Access:** `SUPER_ADMIN`, `ADMIN`

### 2.5 Delete / Deactivate Product
- **Endpoint:** `DELETE /api/v1/products/{id}`
- **Access:** `SUPER_ADMIN`, `ADMIN`

### 2.6 Bulk Catalog Import (CSV)
- **Endpoint:** `POST /api/v1/products/bulk-import`
- **Access:** `SUPER_ADMIN`, `ADMIN`
- **Payload:** `multipart/form-data` with `file: <CSV_FILE>`

### 2.7 Export Catalog (CSV)
- **Endpoint:** `GET /api/v1/products/export`
- **Access:** All Authenticated Users

---

## 3. Categories (`/api/v1/categories`)

- `GET /api/v1/categories` — List active categories
- `POST /api/v1/categories` — Create category (`ADMIN`, `SUPER_ADMIN`)
- `PUT /api/v1/categories/{id}` — Update category
- `DELETE /api/v1/categories/{id}` — Remove category

---

## 4. Multi-Location Inventory & Stock Ledger (`/api/v1/inventory`)

### 4.1 Master Inventory Matrix
- **Endpoint:** `GET /api/v1/inventory`
- **Query Parameters:** `productId`, `locationType`, `locationId`, `isLowStock`

### 4.2 Stock-In (Goods Receipt / Inbound)
- **Endpoint:** `POST /api/v1/inventory/stock-in`
- **Access:** `WAREHOUSE_MANAGER`, `STORE_MANAGER`, `INVENTORY_STAFF`, `SUPER_ADMIN`
- **Request Body:**
```json
{
  "productId": 1,
  "locationType": "WAREHOUSE",
  "locationId": 1,
  "quantity": 50,
  "unitCost": 1250.00,
  "referenceType": "PURCHASE_ORDER",
  "referenceId": "PO-2026-0012",
  "notes": "Delivered in perfect condition via BlueDart"
}
```

### 4.3 Stock-Out (Adjustment / Consumption)
- **Endpoint:** `POST /api/v1/inventory/stock-out`
- **Access:** `WAREHOUSE_MANAGER`, `STORE_MANAGER`, `INVENTORY_STAFF`, `SUPER_ADMIN`
- **Request Body:**
```json
{
  "productId": 1,
  "locationType": "STORE",
  "locationId": 1,
  "quantity": 2,
  "reason": "DAMAGED_IN_STORE",
  "notes": "Water leakage damage on display rack"
}
```

### 4.4 Inventory Stock Ledger History
- **Endpoint:** `GET /api/v1/inventory/transactions`
- **Query Parameters:** `productId`, `locationType`, `locationId`, `startDate`, `endDate`

---

## 5. Stock Transfers (`/api/v1/transfers`)

- `POST /api/v1/transfers` — Initiate inter-facility transfer (`PENDING`)
- `GET /api/v1/transfers` — List transfers with status filter
- `GET /api/v1/transfers/{id}` — Transfer details with line items
- `PUT /api/v1/transfers/{id}/approve` — Approve transfer
- `PUT /api/v1/transfers/{id}/dispatch` — Mark transfer `IN_TRANSIT` (decrements source stock)
- `PUT /api/v1/transfers/{id}/receive` — Complete transfer (increments destination stock)

---

## 6. Customer Orders & Fulfillment (`/api/v1/orders`)

### 6.1 Create Customer Order
- **Endpoint:** `POST /api/v1/orders`
- **Access:** `SALES_STAFF`, `STORE_MANAGER`, `ADMIN`, `SUPER_ADMIN`
- **Request Body:**
```json
{
  "customerId": 1,
  "fulfillmentLocationType": "WAREHOUSE",
  "fulfillmentLocationId": 1,
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 9, "quantity": 1 }
  ],
  "shippingCarrier": "BlueDart Express"
}
```

### 6.2 Order Lifecycle Progression
- `PUT /api/v1/orders/{id}/confirm` — Status -> `CONFIRMED`
- `PUT /api/v1/orders/{id}/pick` — Status -> `PICKED`
- `PUT /api/v1/orders/{id}/pack` — Status -> `PACKED`
- `PUT /api/v1/orders/{id}/ship` — Status -> `SHIPPED` (deducts physical inventory)
- `PUT /api/v1/orders/{id}/deliver` — Status -> `DELIVERED`
- `PUT /api/v1/orders/{id}/cancel` — Status -> `CANCELLED` (releases reserved stock)

### 6.3 Returns & RMA
- `POST /api/v1/returns` — Initiate return request
- `PUT /api/v1/returns/{id}/receive` — Inspect return and restock if `SELLABLE`

---

## 7. Supplier & Procurement Management (`/api/v1/suppliers`, `/api/v1/purchase-orders`)

- `GET /api/v1/suppliers` — List vendors with performance scorecards
- `POST /api/v1/suppliers` — Register new vendor
- `POST /api/v1/purchase-orders` — Create PO (`DRAFT`)
- `PUT /api/v1/purchase-orders/{id}/submit` — Submit PO for approval
- `PUT /api/v1/purchase-orders/{id}/approve` — Approve PO
- `POST /api/v1/purchase-orders/{id}/receive` — Inbound receipt (increases stock & updates PO)

---

## 8. Barcode & Simulated RFID (`/api/v1/barcode`, `/api/v1/rfid`)

- `GET /api/v1/barcode/generate/{sku}` — Returns Code 128 barcode image / SVG
- `POST /api/v1/barcode/scan` — Process barcode scan for quick item lookup
- `POST /api/v1/rfid/simulate-scan` — Simulate bulk RFID gate reader capture

---

## 9. Executive Dashboard & Analytics (`/api/v1/dashboard`, `/api/v1/reports`)

- `GET /api/v1/dashboard/summary` — Returns 10 live executive KPI cards
- `GET /api/v1/dashboard/charts` — Aggregated monthly stock movements, category share
- `GET /api/v1/reports/{reportType}` — Detailed reports (Inventory, Low-Stock, Valuation, etc.)
- `GET /api/v1/reports/{reportType}/export` — CSV export stream
