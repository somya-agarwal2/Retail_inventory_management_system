# PROJECT PLAN & SPRINT ROADMAP
## Retail Inventory Management System (RIMS)
**Project Code:** `PRG_RIMS_001`  
**Duration:** 15 Sprints (2-week cadence)  
**Academic / Industry Alignment:** Career Shaper LMS Agile Delivery  

---

## 1. Sprint Allocation Matrix (8 Epics across 15 Sprints)

| Sprint # | Epic Focus | Sprint Goal | Key Deliverables |
|---|---|---|---|
| **Sprint 1** | Epic 1: Product Catalog | Catalog Foundation & Taxonomy | Categories CRUD, Product Entities, DTOs, Brand Filters |
| **Sprint 2** | Epic 1: Product Catalog | SKU, Barcodes & Bulk Data | Unique SKU validation, Code 128 generator, CSV Bulk Import/Export |
| **Sprint 3** | Epic 2: Inventory Management | Multi-Location Inventory Setup | Warehouses & Stores master tables, Inventory matrix calculation |
| **Sprint 4** | Epic 2: Inventory Management | Transaction Ledger & Stock Operations | Stock-In, Stock-Out, Zero-negative stock validation, Pessimistic locks |
| **Sprint 5** | Epic 2: Inventory Management | Inter-Facility Transfers & Alerts | Warehouse-to-store transfer workflow, Low-stock automated alerts |
| **Sprint 6** | Epic 3: Customer Orders | Order Placement & Stock Reservation | Order intake, available stock validation, two-phase reservation |
| **Sprint 7** | Epic 3: Customer Orders | Fulfillment Engine & Returns | Picking, Packing, Shipping deduction, Returns restock/damage write-off |
| **Sprint 8** | Epic 4: Supplier Procurement | Vendor Management & Purchase Orders | Supplier directory, scorecard ratings, PO creation & Goods Receipt (GRN) |
| **Sprint 9** | Epic 5: Barcode & RFID | Barcode Generator & Scanner UI | Vector SVG Code 128 generation, HTML5 webcam scanner, manual entry |
| **Sprint 10** | Epic 5: Barcode & RFID | Simulated RFID & Scanning Audit | RFID dock reader adapter simulator, EPC tag log, scan audits |
| **Sprint 11** | Epic 6: Reporting & Analytics | Executive Dashboard & Core KPIs | 10 Live KPI cards, Recharts (Category share, monthly velocity) |
| **Sprint 12** | Epic 6: Reporting & Analytics | Enterprise Reports & CSV Streaming | 10 Tabular reports, date/location filters, CSV export & print view |
| **Sprint 13** | Epic 7: User Security & RBAC | Enterprise Authentication & 8 Roles | JWT security filter chain, BCrypt hashing, 8 RBAC role gates, audit trail |
| **Sprint 14** | Epic 8: System Integration | External Adapters & Synchronization | SAP ERP adapter, QuickBooks accounting sync, BlueDart shipping mock |
| **Sprint 15** | Epic 8: System Integration | Quality Assurance & Go-Live Readiness | Docker compose, automated regression suite, performance tuning, LMS review |

---

## 2. Resource & IT Services Plan

### 2.1 Team Roles & RACI Matrix
- **Senior Software Architect / Lead (Responsible)**: Architecture governance, concurrency locking, Flyway migrations, Docker.
- **Java Backend Developer (Responsible)**: Spring Boot controllers, JPA entities, transactional services, JUnit tests.
- **React Frontend Developer (Responsible)**: React 18 UI, Tailwind CSS design system, Recharts, Axios client.
- **QA & Test Engineer (Accountable)**: Integration testing, test scenarios verification, performance load checks.
- **Agile Scrum Master / Project Manager (Consulted)**: LMS backlog hygiene, sprint velocity, impediment removal.

### 2.2 IT Services & Tooling Plan
| Service Category | Selected Tool / Infrastructure | Purpose |
|---|---|---|
| **Version Control** | Git & GitHub | Trunk-based development with feature branch reviews |
| **CI / CD Pipeline** | Jenkins (`Jenkinsfile`) | Automated Maven test execution, Docker image builds |
| **Containerization** | Docker & Docker Compose | Multi-container orchestration (PostgreSQL, Spring Boot, React) |
| **Database Engine** | PostgreSQL 16+ | ACID transactional relational storage |
| **API Documentation** | Springdoc OpenAPI / Swagger UI | Interactive API exploration and contract testing |
| **Testing Framework** | JUnit 5, Mockito, RTL | Unit, integration, and UI component testing |

---

## 3. Risk Management & Mitigation Register

| Risk ID | Description | Severity | Likelihood | Mitigation Strategy |
|---|---|---|---|---|
| **RSK-01** | Concurrent checkouts overselling physical stock | High | Medium | Implement `@Lock(LockModeType.PESSIMISTIC_WRITE)` on inventory records during reservation |
| **RSK-02** | External ERP API downtime blocking operations | Medium | High | Decouple sync with transactional outbox queue and asynchronous retry adapter |
| **RSK-03** | Lack of physical RFID reader hardware during evaluation | Low | High | Provide a high-fidelity EPC Gen2 UHF RFID hardware simulator with mock antenna signals |
| **RSK-04** | Data drift during inter-facility stock transfers | High | Low | Enforce explicit 3-step transit state machine (`PENDING` -> `IN_TRANSIT` -> `COMPLETED`) |
| **RSK-05** | Unauthorized access to privileged financial reports | High | Low | Enforce Spring Security method-level `@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'ANALYST')")` |

---

## 4. Impediments Log & Resolution Protocol

1. **IMP-001 (Windows Workspace Permission Lock)**:
   - *Issue*: `D:\hcl_project` created with elevated Administrator ownership, denying standard user file write.
   - *Resolution*: One-step administrator grant: `icacls "D:\hcl_project" /grant Everyone:(OI)(CI)F /t` executed via Administrator Command Prompt.
2. **IMP-002 (Docker Daemon Non-Responsive on Local Host)**:
   - *Issue*: Docker desktop service not running in local test environment.
   - *Resolution*: Multi-profile Spring Boot design (`application.yml` supporting standard PostgreSQL container via `docker-compose.yml`, with H2 PostgreSQL-compatible fallback for zero-dependency standalone execution).
