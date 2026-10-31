# TEST STRATEGY & TEST SUITE SPECIFICATION
## Retail Inventory Management System (RIMS)
**Project Code:** `PRG_RIMS_001`  
**Test Frameworks:** JUnit 5, Mockito, Spring Boot Test, React Testing Library  

---

## 1. Quality Assurance Strategy

RIMS incorporates a multi-layer test pyramid:
1. **Unit Testing (70% coverage)**: Isolated validation of business formulas (Available Stock, Margins, Reorder Threshold, JWT validation).
2. **Integration Testing (20% coverage)**: Transactional data persistence tests with Spring Data JPA and mock MVC web layer.
3. **End-to-End System & API Verification (10% coverage)**: Multi-step lifecycle flows (PO Receiving -> Stock Increment -> Order Reservation -> Dispatch Deduction -> Return Restock).

---

## 2. The 14 Critical Business Test Scenarios

### Scenario 1: Duplicate SKU Registration
- **Precondition**: Product `PRD-MEN-001` exists in database.
- **Action**: Attempt to create a new product with `sku: "PRD-MEN-001"`.
- **Expected Result**: System rejects transaction with HTTP `409 Conflict` or HTTP `400 Bad Request` and message `"SKU 'PRD-MEN-001' already exists"`.

### Scenario 2: Invalid Product Price Validation
- **Action**: Create product with `purchasePrice: 1500.00` and `sellingPrice: 1200.00`.
- **Expected Result**: Bean validation rejects request with HTTP `400 Bad Request` and message `"Selling price cannot be less than purchase price"`.

### Scenario 3: Stock-In Transaction & Ledger Record
- **Precondition**: Product 1 at Warehouse 1 has `current_stock = 100`.
- **Action**: Perform Stock-In of 50 units @ Rs 1200.00 with reference `PO-001`.
- **Expected Result**:
  - `current_stock` updates to `150` atomically.
  - New row in `stock_transactions` created with `quantity = 50`, `balance_after = 150`, `transaction_type = STOCK_IN`.

### Scenario 4: Stock-Out Operation with Mandatory Reason
- **Precondition**: Store 1 has `available_stock = 25`.
- **Action**: Issue Stock-Out of 5 units with reason `DAMAGED_IN_STORE`.
- **Expected Result**: `current_stock` decrements to `20`; audit transaction recorded with damage reason code.

### Scenario 5: Attempt to Sell More Stock Than Available (Zero-Negative Rule)
- **Precondition**: Store 1 has `available_stock = 4`.
- **Action**: Attempt to place order requesting 10 units.
- **Expected Result**: Request fails with HTTP `400 Bad Request` / `InsufficientStockException`: `"Requested quantity (10) exceeds available stock (4)"`. Stock remains unchanged at 4.

### Scenario 6: Stock Transfer Between Locations (Two-Phase Atomicity)
- **Precondition**: Source Warehouse 1 has 100 units; Destination Store 1 has 10 units.
- **Action**:
  1. Transfer of 30 units initiated and dispatched (`IN_TRANSIT`).
  2. Store 1 receives transfer (`COMPLETED`).
- **Expected Result**:
  - Upon dispatch: Warehouse 1 `current_stock` = `70`.
  - Upon receipt: Store 1 `current_stock` = `40`.
  - Both operations logged in `stock_transactions`.

### Scenario 7: Low-Stock Alert Generation
- **Precondition**: Product has `reorder_point = 25`, `current_stock = 26`.
- **Action**: Sell 2 units (new stock = 24).
- **Expected Result**: System detects `current_stock (24) <= reorder_point (25)`, generates an unread notification record in `notifications` table with type `LOW_STOCK`.

### Scenario 8: Purchase Order Receiving (Goods Receipt Note)
- **Precondition**: PO has 100 units ordered for Warehouse 1.
- **Action**: Receive 100 units via Goods Receipt.
- **Expected Result**:
  - Warehouse 1 stock increases by 100.
  - PO status transitions to `RECEIVED`.
  - Stock transaction logged with reference type `PURCHASE_ORDER`.

### Scenario 9: Order Cancellation Stock Release
- **Precondition**: Order placed for 5 units: `current_stock = 50`, `reserved_stock = 5`, `available_stock = 45`.
- **Action**: Customer cancels order before dispatch.
- **Expected Result**:
  - `reserved_stock` drops back to `0`.
  - `available_stock` returns to `50`.
  - Physical inventory remains intact at `50`.

### Scenario 10: Unauthorized API Access
- **Action**: Invoke `GET /api/v1/inventory` without `Authorization` header.
- **Expected Result**: HTTP `401 Unauthorized` with standard error response body.

### Scenario 11: Invalid / Expired JWT Token
- **Action**: Invoke API with malformed signature or expired token string.
- **Expected Result**: HTTP `401 Unauthorized` with message `"JWT token has expired or is invalid"`.

### Scenario 12: Role-Based Authorization Enforcement
- **Precondition**: Authenticated user has role `SALES_STAFF`.
- **Action**: Attempt to invoke `POST /api/v1/suppliers` (restricted to `ADMIN`, `PROCUREMENT_MANAGER`).
- **Expected Result**: HTTP `403 Forbidden` with message `"Access denied: Insufficient privileges"`.

### Scenario 13: Duplicate Barcode Registration Rejection
- **Precondition**: Product A has barcode `890123400101`.
- **Action**: Attempt to create Product B with the same barcode.
- **Expected Result**: System rejects creation with HTTP `409 Conflict`: `"Barcode '890123400101' is already assigned to Product 'PRD-MEN-001'"`.

### Scenario 14: Partial Purchase Order Delivery
- **Precondition**: PO created for 100 units.
- **Action**: Supplier delivers 60 units.
- **Expected Result**:
  - Warehouse stock increases by 60.
  - PO status updates to `PARTIALLY_RECEIVED`.
  - Remaining 40 units remain pending.
