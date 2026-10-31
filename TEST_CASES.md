# TEST CASES SPECIFICATION
## Retail Inventory Management System (RIMS)
**Project Code:** `PRG_RIMS_001`  
**Test Suite:** 14 Official Test Cases (Unit, Integration, Security, Business Logic)  

---

| Test Case ID | Test Category | Target Component | Input / Precondition | Test Steps | Expected Outcome | Execution Status |
|---|---|---|---|---|---|---|
| **TC-001** | Validation | Product Service | SKU: `PRD-MEN-001` already exists in catalog | Attempt to register new product with duplicate SKU `PRD-MEN-001` | HTTP 409 Conflict with message `"SKU already exists"` | PASS |
| **TC-002** | Validation | Product Service | Product pricing | Submit product with `purchasePrice = 2000.00`, `sellingPrice = 1800.00` | HTTP 400 Bad Request: `"Selling price must be >= purchase price"` | PASS |
| **TC-003** | Business Logic | Inventory Service | Current stock: 100 units at Warehouse 1 | Execute Stock-In of 50 units with reference `PO-MUM-101` | Balance becomes 150; `stock_transactions` logs `STOCK_IN` record | PASS |
| **TC-004** | Business Logic | Inventory Service | Available stock: 30 units at Store 1 | Execute Stock-Out of 5 units with reason `DAMAGED_IN_STORE` | Balance becomes 25; transaction recorded with damage code | PASS |
| **TC-005** | Concurrency / Integrity | Order Service | Available stock: 4 units | Customer checkout attempts to reserve 10 units | HTTP 400 InsufficientStockException: transaction rolled back | PASS |
| **TC-006** | State Machine | Transfer Service | Source WH: 100 units, Dest Store: 10 units | Initiate transfer of 30 units; dispatch then receive | Dispatch: Source = 70; Receive: Dest = 40; status `COMPLETED` | PASS |
| **TC-007** | Alert Engine | Notification Service | `reorder_point = 25`, `current_stock = 26` | Complete sale of 2 units (stock drops to 24) | System generates unread `LOW_STOCK` notification in table | PASS |
| **TC-008** | Business Logic | Purchase Order Svc | Approved PO for 100 units | Warehouse receives 100 units via Goods Receipt (GRN) | Stock increases by 100; PO status updates to `RECEIVED` | PASS |
| **TC-009** | Concurrency / Integrity | Order Service | Order placed with 5 reserved units | Customer cancels order before dispatch | Reserved stock released to 0; available stock restored | PASS |
| **TC-010** | Security | JWT Auth Filter | No Bearer header provided | Send HTTP GET to `/api/v1/inventory` | HTTP 401 Unauthorized with standard error response | PASS |
| **TC-011** | Security | JWT Auth Provider | Malformed or expired token string | Invoke API with invalid Bearer token | HTTP 401 Unauthorized: `"Token expired or malformed"` | PASS |
| **TC-012** | Security | RBAC Evaluator | User authenticated as `SALES_STAFF` | Attempt to invoke `POST /api/v1/suppliers` | HTTP 403 Forbidden: `"Access Denied"` | PASS |
| **TC-013** | Validation | Barcode Service | Barcode `890123400101` assigned to SKU 1 | Register new product with duplicate barcode `890123400101` | HTTP 409 Conflict: `"Barcode already in use"` | PASS |
| **TC-014** | Procurement | Purchase Order Svc | PO ordered for 100 units | Supplier delivers 60 units (partial) | Stock +60; PO status updates to `PARTIALLY_RECEIVED` | PASS |
