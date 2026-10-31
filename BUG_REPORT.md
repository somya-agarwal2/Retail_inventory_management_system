# BUG REPORT & DEFECT MANAGEMENT LOG
## Retail Inventory Management System (RIMS)
**Project Code:** `PRG_RIMS_001`  
**Tracking System:** Agile Scrum Defects & LMS Quality Register  

---

## 1. Defect Severity & Priority Matrix

| Defect ID | Epic | Description | Severity | Priority | Status | Resolution Summary |
|---|---|---|---|---|---|---|
| **BUG-001** | Epic 2 | Concurrent stock reservations could cause race condition | Critical | High | RESOLVED | Added `@Lock(LockModeType.PESSIMISTIC_WRITE)` to `InventoryRepository.findWithLock()` |
| **BUG-002** | Epic 1 | Decimal precision truncated on multi-item PO line total | Major | Medium | RESOLVED | Converted calculations to `BigDecimal` with `RoundingMode.HALF_UP` |
| **BUG-003** | Epic 3 | Cancelled order failed to release reserved stock | Critical | High | RESOLVED | Added atomic release trigger inside `OrderService.cancelOrder()` |
| **BUG-004** | Epic 7 | Expired JWT token returned generic 500 error | Minor | Low | RESOLVED | Added custom `JwtAuthenticationEntryPoint` returning clean HTTP 401 JSON |
| **BUG-005** | Epic 5 | Code 128 barcode generator rendered distorted on low DPI | Minor | Low | RESOLVED | Switched to pure vector SVG generation with crisp vector paths |
| **BUG-006** | Epic 4 | Partial PO delivery marked purchase order as fully received | Major | High | RESOLVED | Implemented quantity comparison: `received_qty < ordered_qty ? PARTIALLY_RECEIVED : RECEIVED` |
