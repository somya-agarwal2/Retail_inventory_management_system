# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## Retail Inventory Management System (RIMS)
**Document Version:** 1.0.0  
**Project Code:** `PRG_RIMS_001`  
**Client:** XYZ Retail Corporation  
**Academic / Industry Alignment:** Career Shaper LMS  

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the **Retail Inventory Management System (RIMS)**. It describes functional and non-functional requirements, data specifications, interface requirements, and constraints for XYZ Retail Corporation, a national retail chain with over 500 retail stores and multiple regional distribution centers.

### 1.2 Scope
RIMS provides unified stock ledger visibility, multi-echelon warehouse-to-store inventory routing, automated purchase order procurement, barcode/RFID automated tracking, customer order fulfillment workflows, executive analytics, and integration adapters for enterprise ERP and accounting platforms.

### 1.3 Target Audience & Personas
- **Executive Leadership (CEO/COO/VP Supply Chain)**: Needs real-time macro-level visibility into stock valuation, inventory turnover, stockout frequency, and order fulfillment rates.
- **Warehouse Managers**: Oversee DC inbound receipts, slotting/bin allocation, picking/packing, and inter-store stock replenishment dispatches.
- **Retail Store Managers**: Monitor on-floor inventory levels, trigger store replenishment requests, fulfill click-and-collect orders, and manage customer returns.
- **Inventory Staff**: Perform daily cycle counts, stock-in scanning, damaged goods write-offs, and stock adjustments.
- **Procurement Managers**: Manage vendor master records, evaluate supplier scorecards, negotiate payment terms, and generate purchase orders.
- **Sales Staff & Customer Support**: Assist customers, check multi-store stock availability, place sales orders, and initiate return RMAs.

---

## 2. Overall Description

### 2.1 System Context & Operating Environment
RIMS operates as a modern cloud-ready web application:
- **Client**: Modern web browsers (Chrome, Edge, Firefox, Safari) with responsive desktop and tablet support.
- **Backend Application Server**: Java 21, Spring Boot 3.x runtime deployed on Linux / Docker containers.
- **Database Engine**: PostgreSQL 16+ relational database server with ACID compliance.

### 2.2 Design and Implementation Constraints
- Strict avoidance of negative stock under all concurrent conditions.
- Zero reliance on mock frontends or localStorage for transaction records.
- Immutable transaction ledger for every physical item addition, deduction, transfer, or adjustment.
- Role-based authorization enforced at the API gateway / controller layer using JWT claims.

---

## 3. Functional Requirements (By Epic)

### EPIC 1: Product Catalog Management
- **FR-1.1 (Product CRUD)**: System shall permit authorized users (`ADMIN`, `SUPER_ADMIN`) to create, read, update, and soft-delete products.
- **FR-1.2 (SKU Uniqueness)**: System shall enforce globally unique SKU syntax.
- **FR-1.3 (Barcode Generation)**: System shall generate standard Code 128 barcodes for every product upon creation.
- **FR-1.4 (Pricing Rules)**: Selling price must be strictly greater than or equal to purchase cost price.
- **FR-1.5 (Bulk Operations)**: System shall support bulk CSV import with validation rollback and CSV catalog export.

### EPIC 2: Multi-Location Inventory Tracking
- **FR-2.1 (Multi-Location)**: System shall maintain distinct inventory records per `(product_id, location_type, location_id)`.
- **FR-2.2 (Stock Calculation)**: `Available Stock` = `Current Physical Stock` - `Reserved Stock`.
- **FR-2.3 (Stock-In)**: Inbound stock movements shall increment physical stock, record unit cost, and log a ledger transaction.
- **FR-2.4 (Stock-Out)**: Stock removal shall validate available balance and prevent negative inventory.
- **FR-2.5 (Inter-Location Transfers)**: Transfer workflow shall progress through `PENDING` -> `APPROVED` -> `IN_TRANSIT` -> `COMPLETED`. Source stock is decremented upon dispatch; destination stock is incremented upon receipt.
- **FR-2.6 (Low Stock Thresholds)**: When `Current Stock <= Reorder Point`, system shall generate an automatic `LOW_STOCK` alert notification.

### EPIC 3: Customer Order Management & Fulfillment
- **FR-3.1 (Order Creation)**: Orders shall validate stock availability across specified fulfillment location.
- **FR-3.2 (Stock Reservation)**: Placing an order increments `reserved_stock` without immediately decrementing physical inventory.
- **FR-3.3 (Order Lifecycle)**: Transitions follow: `PENDING` -> `CONFIRMED` -> `PROCESSING` -> `PICKED` -> `PACKED` -> `SHIPPED` -> `DELIVERED`.
- **FR-3.4 (Order Dispatch)**: When status transitions to `SHIPPED`, physical stock and reserved stock are decremented simultaneously.
- **FR-3.5 (Order Cancellation)**: Cancelling an unfulfilled order immediately releases reserved stock back to the available pool.
- **FR-3.6 (Returns & RMA)**: Returned items categorized as `SELLABLE` shall be restocked into inventory; `DAMAGED` items shall be written off to a loss account.

### EPIC 4: Supplier & Procurement Management
- **FR-4.1 (Vendor Master)**: System shall track supplier contact details, tax identifiers, payment terms, and ratings.
- **FR-4.2 (Purchase Orders)**: PO lifecycle follows `DRAFT` -> `SUBMITTED` -> `APPROVED` -> `PARTIALLY_RECEIVED` -> `RECEIVED`.
- **FR-4.3 (Goods Receipt Note)**: Receiving products against an approved PO increases warehouse physical stock and updates PO item fulfilled quantities.

### EPIC 5: Barcode & RFID Integration
- **FR-5.1 (Barcode Scanner)**: System shall provide HTML5/camera-based scanning and manual barcode entry fallback.
- **FR-5.2 (RFID Simulation)**: System shall simulate EPC Gen2 UHF RFID hardware scans for bulk dock-door verification.

### EPIC 6: Executive Analytics & Reports
- **FR-6.1 (Live KPIs)**: Dashboard shall compute 10 real-time KPIs via database aggregation queries.
- **FR-6.2 (Enterprise Reports)**: System shall provide 10 business reports with date/warehouse/category filters and CSV export.

### EPIC 7: Enterprise User Security & RBAC
- **FR-7.1 (Authentication)**: Secure login with JWT token issuance, refresh endpoint, and BCrypt encryption (cost factor 10+).
- **FR-7.2 (Role-Based Access)**: Enforcement across 8 roles (`SUPER_ADMIN`, `ADMIN`, `WAREHOUSE_MANAGER`, `STORE_MANAGER`, `INVENTORY_STAFF`, `PROCUREMENT_MANAGER`, `SALES_STAFF`, `ANALYST`).
- **FR-7.3 (Audit Trail)**: Security and transactional audit logs capturing user ID, entity name, action, timestamp, and IP address.

### EPIC 8: System Integration
- **FR-8.1 (Adapter Interface)**: Extensible integration layer for ERP (SAP) and Accounting (QuickBooks).
- **FR-8.2 (Sync Logs & Retries)**: Complete logging of synchronization runs, payload summaries, and automatic retries on network failures.

---

## 4. Non-Functional Requirements (NFRs)

| Category | Requirement | Target Specification |
|---|---|---|
| **Performance** | API Response Time | 95th percentile < 250ms for OLTP queries; < 1.5s for complex reporting aggregations |
| **Concurrency** | Stock Safety | Zero race-condition over-allocations under concurrent checkouts via pessimistic locking (`PESSIMISTIC_WRITE`) |
| **Availability** | Target Uptime | 99.9% availability during business operating hours |
| **Security** | Data Encryption | TLS 1.3 in transit; BCrypt password hashing; JWT stateless signatures |
| **Scalability** | Database Capacity | Normalized schema indexed for 500+ stores, 10,000+ SKUs, and 500,000+ monthly transactions |
| **Maintainability** | Architecture | Modular monolith with clean separation between controller, service, repository, and domain entities |
