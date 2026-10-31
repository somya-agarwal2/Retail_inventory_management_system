# PROJECT OVERVIEW: RETAIL INVENTORY MANAGEMENT SYSTEM (RIMS)
## Project Code: PRG_RIMS_001
**Client Context:** XYZ Retail Corporation  
**National Footprint:** 500+ Retail Stores & Regional Distribution Warehouses  
**Product Lines:** Apparel (Men/Women/Kids), Footwear, Home & Kitchen, Consumer Electronics, Sports & Travel  

---

## 1. Business Background & Current Pain Points

XYZ Retail Corporation has expanded rapidly over the past decade, opening over 500 multi-format retail stores across Tier-1, Tier-2, and Tier-3 Indian cities. However, the legacy infrastructure suffered from fragmented inventory tracking:
1. **Inventory Blindspots**: Store managers operated independently of regional distribution hubs, leading to localized stockouts for high-demand items while neighboring facilities sat on excess stock.
2. **High Holding Costs**: Inaccurate demand velocity modeling led to overstocking non-moving SKUs, tying up over $14.2M in working capital.
3. **Manual Order Allocation**: Fulfilling customer orders required manual spreadsheet reconciliations, resulting in a low 81% order fulfillment rate and frequent customer cancellations.
4. **Disjointed Procurement**: Vendor performance was tracked subjectively rather than objectively against on-time delivery rates and goods receipt discrepancies.

---

## 2. Solution Overview

The Retail Inventory Management System (RIMS) delivers a unified, real-time platform:
- **Centralized Stock Ledger**: Every inventory adjustment, transfer, purchase receipt, or fulfillment dispatch is recorded as an immutable ledger transaction.
- **Atomic Two-Phase Reservation**: When orders are placed, stock is reserved instantly with zero-negative check constraints; inventory is physically decremented only upon verified shipment dispatch.
- **Inter-Store Rebalancing**: Stores facing low-stock alerts can automatically or manually initiate stock transfers from nearby distribution centers or partner stores.
- **Automated Supplier Scorecards**: Vendor performance scores (1.0 to 5.0) are calculated automatically from purchase order delivery timelines and return defect rates.
- **Automated Barcode & Simulated RFID Tracking**: Unique Code 128 barcodes and simulated EPC Gen2 UHF RFID dock readers eliminate manual data entry errors.
- **Enterprise Security (RBAC)**: 8 distinct roles enforce separation of duties, ensuring inventory staff, store managers, procurement officers, and financial analysts operate strictly within authorized scopes.
