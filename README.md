# Retail Inventory Management System (RIMS)
## Enterprise Multi-Location Inventory & Fulfillment Platform
**Project Code:** `PRG_RIMS_001`  
**Client:** XYZ Retail Corporation  
**Academic / Industry Alignment:** Career Shaper LMS Capstone  

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![Java](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg)](https://www.docker.com/)

---

## 1. Project Overview

XYZ Retail Corporation is a national retail chain with 500+ stores and regional distribution warehouses across the country, specializing in apparel, home goods, and consumer electronics. The **Retail Inventory Management System (RIMS)** is an enterprise-grade platform designed to streamline multi-echelon inventory tracking, automate customer order fulfillment, optimize procurement from suppliers, enforce transaction safety, and provide real-time operational analytics.

### Target Business Objectives
1. Increase inventory accuracy to **98%** across warehouses and stores.
2. Reduce stockout incidents by **25%**.
3. Reduce overstocking by **20%**.
4. Improve order fulfillment rate to **95%**.
5. Target system uptime of **99.9%**.
6. Provide real-time visibility into inventory across 500+ locations.
7. Streamline supplier procurement and goods receipts.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide React icons
- **State & Routing**: React Context API & React Router v6
- **Data Visualization**: Recharts (Executive KPIs, category share, velocity)
- **HTTP Client**: Axios with JWT Bearer Interceptors

### Backend
- **Framework**: Java 21, Spring Boot 3.3.5
- **ORM & Persistence**: Spring Data JPA / Hibernate
- **Security**: Spring Security with stateless JWT (HMAC-SHA256) & BCrypt
- **Validation**: Jakarta Bean Validation (`@Valid`, custom validators)
- **Database Migrations**: Flyway
- **API Documentation**: Springdoc OpenAPI (Swagger UI at `/swagger-ui/index.html`)
- **Build Tool**: Apache Maven

### Database
- **Primary Database**: PostgreSQL 16+ (Normalized 28 relational tables, ACID compliant)
- **Fallback / Standalone Mode**: Embedded H2 with PostgreSQL compatibility mode for instant zero-dependency execution

### DevOps & CI/CD
- **Containerization**: Docker & Docker Compose (`docker-compose.yml`)
- **Cloud Target**: AWS (ECS Fargate, RDS PostgreSQL Multi-AZ, S3, CloudFront, ALB)
- **Automation**: Jenkins Pipeline (`Jenkinsfile`)

---

## 3. The Eight Official Epics

1. **EPIC 1: Product Catalog Management** — SKU uniqueness, multi-tier categories, pricing margin engine, bulk CSV import/export.
2. **EPIC 2: Multi-Location Inventory & Stock Ledger** — Multi-warehouse and store matrix, atomic stock-in/out, inter-facility transfers, pessimistic concurrency control, automated low-stock alerts.
3. **EPIC 3: Customer Order Management & Fulfillment** — Full lifecycle (`PENDING` -> `DELIVERED`), two-phase stock reservation and deduction, return intake (RMA) with restock inspection.
4. **EPIC 4: Supplier Procurement Management** — Vendor directories, automated scorecard ratings, purchase orders (`DRAFT` -> `RECEIVED`), goods receipt notes (GRN).
5. **EPIC 5: Barcode & RFID Integration** — Vector Code 128 barcode generator, HTML5 live webcam scanner, simulated EPC Gen2 UHF RFID dock door reader.
6. **EPIC 6: Reporting & Analytics** — Executive dashboard with 10 live KPIs, 4 interactive Recharts, 10 tabular business reports with CSV export and print view.
7. **EPIC 7: User Security & Role-Based Access Control (RBAC)** — BCrypt password hashing, stateless JWT authentication, and Spring Security method-level gates for 8 roles.
8. **EPIC 8: System Integration** — Modular integration adapters for ERP (SAP), Accounting (QuickBooks), and BlueDart shipping carrier.

---

## 4. Default Demonstration Credentials

All accounts are pre-seeded with the password: `Password@123`

| Role | Username | Assigned Scope | Typical Capabilities |
|---|---|---|---|
| **SUPER_ADMIN** | `superadmin` | Global / HQ | Unrestricted application access |
| **ADMIN** | `admin` | Global / HQ | Catalog, users, locations, configuration |
| **WAREHOUSE_MANAGER** | `wh_manager` | Mumbai DC | Warehouse inventory, transfers, inbounds |
| **STORE_MANAGER** | `store_mgr` | Phoenix Store | Retail store stock, local orders, replenishment |
| **INVENTORY_STAFF** | `inv_staff` | Mumbai DC | Stock counts, stock-in/out, barcode scanning |
| **PROCUREMENT_MANAGER** | `proc_mgr` | Global / HQ | Supplier scorecards, purchase orders, GRN |
| **SALES_STAFF** | `sales_staff` | Phoenix Store | Customer orders, counter dispatch, returns |
| **ANALYST** | `analyst` | Global / HQ | Read-only access to analytics & reports |

---

## 5. Quick Start Guide

### Option A: Running with Docker Compose (Recommended for Production)
```bash
# Start PostgreSQL, Spring Boot backend, and React frontend
docker-compose up --build
```
- Frontend UI: `http://localhost:3000` (or `http://localhost`)
- Backend API: `http://localhost:8080/api/v1`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### Option B: Running Locally (Development Mode)

#### 1. Backend (Spring Boot)
```bash
cd backend
mvn clean spring-boot:run
```
The backend starts on port `8080` with auto-initialized seed data.

#### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 6. Repository Documentation Map

- [PROJECT_OVERVIEW.md](file:///d:/hcl_project/PROJECT_OVERVIEW.md) — Comprehensive client context & business domain
- [SRS.md](file:///d:/hcl_project/SRS.md) — Software Requirements Specification
- [ARCHITECTURE.md](file:///d:/hcl_project/ARCHITECTURE.md) — System Architecture & Package Layout
- [DATABASE.md](file:///d:/hcl_project/DATABASE.md) — Data dictionary and indexing strategy
- [ER_DIAGRAM.md](file:///d:/hcl_project/ER_DIAGRAM.md) — Mermaid ER diagrams
- [DATABASE_SCHEMA.sql](file:///d:/hcl_project/DATABASE_SCHEMA.sql) — Pure PostgreSQL DDL Schema
- [API.md](file:///d:/hcl_project/API.md) — REST API Specification
- [PRODUCT_BACKLOG.md](file:///d:/hcl_project/PRODUCT_BACKLOG.md) — User stories & WSJF ranking
- [PROJECT_PLAN.md](file:///d:/hcl_project/PROJECT_PLAN.md) — 15-sprint roadmap & risk register
- [TESTING.md](file:///d:/hcl_project/TESTING.md) — Test strategy and execution results
- [TEST_CASES.md](file:///d:/hcl_project/TEST_CASES.md) — 14 critical test scenario definitions
- [DEPLOYMENT.md](file:///d:/hcl_project/DEPLOYMENT.md) — AWS Cloud & Docker deployment guide
