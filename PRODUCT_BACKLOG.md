# PRODUCT BACKLOG
## Retail Inventory Management System (RIMS)
**Project Code:** `PRG_RIMS_001`  
**Framework:** Agile Scrum & LMS Academic Workbook  
**Total User Stories:** 36 Stories across 8 Epics  

---

## 1. Prioritization Methodology

### 1.1 MoSCoW Priority Matrix
- **Must Have (M)**: Core features essential for system launch (Catalog, Multi-Location Inventory, Atomic Stock-In/Out, Order Fulfillment, JWT Security).
- **Should Have (S)**: High-impact features (Inter-Store Transfers, PO Receiving, Barcode Scanning, Executive Dashboard).
- **Could Have (C)**: Value-added enhancements (Simulated RFID Reader, ERP Integration Adapter, CSV Export).
- **Won't Have (This Release) (W)**: Physical hardware RFID gate antenna pairing, automated drone cycle counting.

### 1.2 Weighted Shortest Job First (WSJF)
$$WSJF = \frac{\text{Cost of Delay (CoD)}}{\text{Job Duration / Size}}$$
Where $\text{CoD} = \text{User-Business Value} + \text{Time Criticality} + \text{Risk Reduction / Opportunity Enablement}$.

---

## 2. Product Backlog Table

| ID | Epic | User Story Summary | MoSCoW | Story Points | WSJF Score | Clarity Index (1-5) | Sprint |
|---|---|---|---|---|---|---|---|
| **US-01** | Epic 1 | Add, update, view, and soft-delete products with SKU & pricing | **Must** | 5 | 18.0 | 5 | Sprint 1 |
| **US-02** | Epic 1 | Maintain multi-level product categories and brand filters | **Must** | 3 | 14.5 | 5 | Sprint 1 |
| **US-03** | Epic 1 | Enforce unique SKU and unique Code 128 barcode per product | **Must** | 3 | 16.0 | 5 | Sprint 2 |
| **US-04** | Epic 1 | Bulk product import and export via CSV with rollback | **Should** | 5 | 12.0 | 4 | Sprint 2 |
| **US-05** | Epic 2 | Multi-warehouse and retail store directory configuration | **Must** | 5 | 17.5 | 5 | Sprint 3 |
| **US-06** | Epic 2 | Real-time multi-location inventory matrix calculation | **Must** | 8 | 20.0 | 5 | Sprint 3 |
| **US-07** | Epic 2 | Atomic stock-in transactions with cost and reference ID | **Must** | 5 | 19.0 | 5 | Sprint 4 |
| **US-08** | Epic 2 | Atomic stock-out transactions with zero-negative constraint | **Must** | 5 | 21.0 | 5 | Sprint 4 |
| **US-09** | Epic 2 | Inter-facility transfer workflow (Pending -> In Transit -> Received) | **Should** | 8 | 15.5 | 4 | Sprint 5 |
| **US-10** | Epic 2 | Automated low-stock alert generation upon reorder threshold | **Must** | 3 | 18.5 | 5 | Sprint 5 |
| **US-11** | Epic 2 | Immutable inventory transaction ledger log | **Must** | 5 | 19.5 | 5 | Sprint 5 |
| **US-12** | Epic 3 | Customer order creation with real-time stock availability check | **Must** | 8 | 20.5 | 5 | Sprint 6 |
| **US-13** | Epic 3 | Two-phase inventory reservation and deduction on shipment | **Must** | 8 | 22.0 | 5 | Sprint 6 |
| **US-14** | Epic 3 | Picking, packing, and dispatch fulfillment workflow | **Must** | 5 | 17.0 | 5 | Sprint 7 |
| **US-15** | Epic 3 | Order cancellation with automatic reserved stock release | **Must** | 5 | 18.0 | 5 | Sprint 7 |
| **US-16** | Epic 3 | Returns intake (RMA) with restock vs. damage write-off | **Should** | 5 | 14.0 | 4 | Sprint 7 |
| **US-17** | Epic 4 | Supplier profile directory and performance scorecard rating | **Must** | 5 | 16.0 | 5 | Sprint 8 |
| **US-18** | Epic 4 | Purchase order creation, submission, and approval flow | **Must** | 5 | 18.0 | 5 | Sprint 8 |
| **US-19** | Epic 4 | Purchase order receiving with automatic inventory stock-in | **Must** | 8 | 21.5 | 5 | Sprint 8 |
| **US-20** | Epic 5 | Standard Code 128 barcode generation and SVG display | **Should** | 3 | 13.0 | 5 | Sprint 9 |
| **US-21** | Epic 5 | HTML5 live camera barcode scanning with manual fallback | **Should** | 5 | 14.5 | 4 | Sprint 9 |
| **US-22** | Epic 5 | Simulated EPC Gen2 UHF RFID reader interface | **Could** | 5 | 11.0 | 4 | Sprint 10 |
| **US-23** | Epic 5 | Barcode/RFID scan transaction history and audit log | **Should** | 3 | 12.5 | 5 | Sprint 10 |
| **US-24** | Epic 6 | Real-time analytics dashboard with 10 live executive KPIs | **Must** | 5 | 19.0 | 5 | Sprint 11 |
| **US-25** | Epic 6 | Dynamic charts for category share and monthly velocity | **Should** | 5 | 15.0 | 5 | Sprint 11 |
| **US-26** | Epic 6 | 10 comprehensive business reports with date/store filters | **Must** | 8 | 17.0 | 5 | Sprint 12 |
| **US-27** | Epic 6 | One-click CSV report export and print-ready view | **Should** | 3 | 14.0 | 5 | Sprint 12 |
| **US-28** | Epic 7 | Secure user login with JWT tokens and BCrypt password encryption | **Must** | 5 | 22.5 | 5 | Sprint 13 |
| **US-29** | Epic 7 | Role-Based Access Control enforced across 8 roles | **Must** | 8 | 23.0 | 5 | Sprint 13 |
| **US-30** | Epic 7 | User management, profile editing, and account status toggles | **Should** | 3 | 15.0 | 5 | Sprint 13 |
| **US-31** | Epic 7 | Security audit trail tracking user actions, IPs, and timestamps | **Must** | 5 | 16.5 | 5 | Sprint 13 |
| **US-32** | Epic 8 | Modular REST integration adapter for SAP ERP | **Should** | 5 | 13.5 | 4 | Sprint 14 |
| **US-33** | Epic 8 | Accounting ledger export adapter for QuickBooks | **Should** | 5 | 13.0 | 4 | Sprint 14 |
| **US-34** | Epic 8 | Mock BlueDart logistics shipping carrier integration | **Should** | 3 | 12.0 | 4 | Sprint 14 |
| **US-35** | Epic 8 | Integration synchronization monitoring and failure retry | **Could** | 5 | 11.5 | 4 | Sprint 15 |
| **US-36** | Epic 8 | End-to-end integration testing and user acceptance signoff | **Must** | 8 | 20.0 | 5 | Sprint 15 |
