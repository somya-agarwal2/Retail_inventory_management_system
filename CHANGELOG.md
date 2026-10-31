# CHANGELOG
## Retail Inventory Management System (RIMS)
All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-10-31
### Added
- **Epic 1**: Complete Product Catalog Management with SKU generation, category taxonomy, pricing margins, and CSV bulk import/export.
- **Epic 2**: Multi-Location Inventory Tracking (3 Warehouses, 5 Stores) with atomic Stock-In, Stock-Out, Inter-Facility Transfers, and automated Low-Stock Alerts.
- **Epic 3**: Customer Order Fulfillment Engine supporting full lifecycle (`PENDING` -> `DELIVERED`), two-phase stock reservation, and RMA Returns inspection.
- **Epic 4**: Supplier Procurement with automated vendor scorecards, Purchase Order workflow, and Goods Receipt Notes (GRN).
- **Epic 5**: Code 128 vector barcode generation, HTML5 webcam scanner, and simulated EPC Gen2 UHF RFID dock door reader.
- **Epic 6**: Real-Time Executive Analytics Dashboard with 10 live KPI cards, interactive Recharts, and 10 Tabular Reports with CSV export.
- **Epic 7**: Enterprise Security with stateless JWT, BCrypt password hashing, 8 RBAC roles, and comprehensive security audit logging.
- **Epic 8**: Enterprise Integration Layer with mock adapters for SAP S/4HANA ERP, QuickBooks Enterprise Accounting, and BlueDart Express logistics.
- **DevOps**: Production Dockerfiles, `docker-compose.yml`, AWS deployment architecture, and Jenkins CI/CD pipeline (`Jenkinsfile`).
