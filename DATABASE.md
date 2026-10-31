# DATABASE DESIGN & DATA DICTIONARY
## Retail Inventory Management System (RIMS)
**Project Code:** `PRG_RIMS_001`  
**Database Engine:** PostgreSQL 16+  
**Architecture:** 28 Normalized Relational Tables  

---

## 1. Schema Design Principles

1. **Strict Third Normal Form (3NF)**: Redundancy is eliminated across product, location, supplier, order, and user tables.
2. **Referential Integrity**: Foreign keys enforce cascade or restrict policies (`ON DELETE RESTRICT` on core business entities to prevent accidental data loss).
3. **Optimistic & Pessimistic Concurrency**: Financial and stock operations utilize `DECIMAL(12,2)` / `NUMERIC` data types and database-level check constraints.
4. **Calculated Stored Columns**: `available_stock` is maintained as a generated column `(current_stock - reserved_stock)` with a strict check `reserved_stock <= current_stock`.
5. **Auditing & Timestamps**: Every table contains `created_at` and `updated_at` with time-zone awareness (`TIMESTAMP WITH TIME ZONE`).

---

## 2. Comprehensive Data Dictionary (28 Entities)

### Core Access Control Entities
- `roles`: `id` (PK, BIGSERIAL), `name` (VARCHAR, UNIQUE), `description` (VARCHAR), `created_at` (TIMESTAMP).
- `permissions`: `id` (PK, BIGSERIAL), `name` (VARCHAR, UNIQUE), `module` (VARCHAR), `description` (VARCHAR).
- `role_permissions`: `role_id` (FK), `permission_id` (FK). Composite PK.
- `users`: `id` (PK, BIGSERIAL), `username` (VARCHAR, UNIQUE), `email` (VARCHAR, UNIQUE), `password_hash` (VARCHAR), `first_name`, `last_name`, `phone`, `role` (VARCHAR), `status` (ACTIVE/INACTIVE/SUSPENDED), `assigned_location_type`, `assigned_location_id`.
- `user_roles`: `user_id` (FK), `role_id` (FK). Composite PK.

### Product & Taxonomy Entities
- `categories`: `id` (PK, BIGSERIAL), `code` (VARCHAR, UNIQUE), `name` (VARCHAR), `description` (TEXT), `parent_id` (Self FK), `is_active` (BOOLEAN).
- `products`: `id` (PK, BIGSERIAL), `sku` (VARCHAR, UNIQUE), `barcode` (VARCHAR, UNIQUE), `name` (VARCHAR), `description` (TEXT), `category_id` (FK), `brand` (VARCHAR), `purchase_price` (NUMERIC), `selling_price` (NUMERIC), `image_url` (VARCHAR), `min_stock_level` (INT), `reorder_point` (INT), `safety_stock` (INT), `status` (ACTIVE/INACTIVE/DISCONTINUED).

### Multi-Location Infrastructure
- `warehouses`: `id` (PK, BIGSERIAL), `code` (VARCHAR, UNIQUE), `name` (VARCHAR), `address`, `city`, `state`, `postal_code`, `contact_person`, `phone`, `email`, `capacity_sqft` (INT), `is_active` (BOOLEAN).
- `stores`: `id` (PK, BIGSERIAL), `code` (VARCHAR, UNIQUE), `name` (VARCHAR), `address`, `city`, `state`, `postal_code`, `store_manager`, `phone`, `email`, `is_active` (BOOLEAN).

### Inventory & Stock Movements
- `inventory`: `id` (PK, BIGSERIAL), `product_id` (FK), `location_type` (WAREHOUSE/STORE), `location_id` (BIGINT), `current_stock` (INT), `reserved_stock` (INT), `available_stock` (INT, GENERATED), `reorder_point` (INT), `safety_stock` (INT), `aisle_bin` (VARCHAR), `last_restocked_at` (TIMESTAMP). UNIQUE constraint on `(product_id, location_type, location_id)`.
- `stock_transactions`: `id` (PK, BIGSERIAL), `transaction_ref` (VARCHAR, UNIQUE), `product_id` (FK), `location_type`, `location_id`, `transaction_type` (STOCK_IN/STOCK_OUT/TRANSFER/ORDER/RETURN), `quantity` (INT), `balance_after` (INT), `unit_cost` (NUMERIC), `reference_type`, `reference_id`, `notes`, `performed_by_user_id` (FK).
- `stock_transfers`: `id` (PK, BIGSERIAL), `transfer_number` (VARCHAR, UNIQUE), `source_type`, `source_id`, `destination_type`, `destination_id`, `status` (PENDING/APPROVED/IN_TRANSIT/COMPLETED/CANCELLED), `initiated_by` (FK), `approved_by` (FK), `received_by` (FK), `departure_time`, `arrival_time`.
- `stock_transfer_items`: `id` (PK, BIGSERIAL), `transfer_id` (FK), `product_id` (FK), `requested_qty` (INT), `shipped_qty` (INT), `received_qty` (INT).

### Supplier & Procurement
- `suppliers`: `id` (PK, BIGSERIAL), `code` (VARCHAR, UNIQUE), `name` (VARCHAR), `contact_person`, `email`, `phone`, `address`, `city`, `state`, `tax_id`, `payment_terms`, `rating` (NUMERIC, 1.0-5.0), `status`.
- `purchase_orders`: `id` (PK, BIGSERIAL), `po_number` (VARCHAR, UNIQUE), `supplier_id` (FK), `warehouse_id` (FK), `status` (DRAFT/SUBMITTED/APPROVED/PARTIALLY_RECEIVED/RECEIVED/CANCELLED), `order_date`, `expected_delivery_date`, `actual_delivery_date`, `total_amount` (NUMERIC), `created_by` (FK), `approved_by` (FK).
- `purchase_order_items`: `id` (PK, BIGSERIAL), `purchase_order_id` (FK), `product_id` (FK), `ordered_qty` (INT), `received_qty` (INT), `unit_price` (NUMERIC), `line_total` (NUMERIC, GENERATED).

### Customer Orders & Returns
- `customers`: `id` (PK, BIGSERIAL), `customer_code` (VARCHAR, UNIQUE), `first_name`, `last_name`, `email`, `phone`, `shipping_address`, `city`, `state`, `postal_code`, `customer_type` (RETAIL/WHOLESALE).
- `customer_orders`: `id` (PK, BIGSERIAL), `order_number` (VARCHAR, UNIQUE), `customer_id` (FK), `fulfillment_location_type`, `fulfillment_location_id`, `status` (PENDING/CONFIRMED/PROCESSING/PICKED/PACKED/SHIPPED/DELIVERED/CANCELLED/RETURN_REQUESTED/RETURNED/REFUNDED), `payment_status`, `subtotal`, `tax_amount`, `shipping_cost`, `total_amount`, `shipping_carrier`, `tracking_number`, `order_date`, `shipped_date`, `delivered_date`.
- `order_items`: `id` (PK, BIGSERIAL), `order_id` (FK), `product_id` (FK), `quantity` (INT), `unit_price` (NUMERIC), `allocated_qty` (INT), `fulfilled_qty` (INT), `line_total` (NUMERIC, GENERATED).
- `order_status_history`: `id` (PK, BIGSERIAL), `order_id` (FK), `previous_status`, `new_status`, `comment`, `changed_by` (FK), `created_at`.
- `returns`: `id` (PK, BIGSERIAL), `return_number` (VARCHAR, UNIQUE), `order_id` (FK), `customer_id` (FK), `return_reason`, `overall_condition` (SELLABLE/DAMAGED/DEFECTIVE), `status`, `refund_amount`, `processed_by` (FK).
- `return_items`: `id` (PK, BIGSERIAL), `return_id` (FK), `product_id` (FK), `quantity`, `condition_status`, `is_restocked` (BOOLEAN), `inspection_notes`.

### Barcode, RFID, Audit & Integrations
- `barcode_records`: `id` (PK, BIGSERIAL), `product_id` (FK), `barcode_value` (VARCHAR, UNIQUE), `barcode_format`, `generated_date`, `is_active`.
- `rfid_scan_logs`: `id` (PK, BIGSERIAL), `epc_tag`, `product_id` (FK), `location_type`, `location_id`, `scan_type`, `scanned_by` (FK), `signal_strength_rssi`, `scan_timestamp`.
- `notifications`: `id` (PK, BIGSERIAL), `user_id` (FK), `title`, `message`, `type` (LOW_STOCK/ORDER_PLACED/PO_APPROVED/SYSTEM_ALERT), `is_read`, `reference_type`, `reference_id`.
- `audit_logs`: `id` (PK, BIGSERIAL), `user_id` (FK), `action`, `entity_name`, `entity_id`, `old_values` (JSONB), `new_values` (JSONB), `ip_address`, `created_at`.
- `integration_configs`: `id` (PK, BIGSERIAL), `system_name` (UNIQUE), `system_type` (ERP/ACCOUNTING/LOGISTICS), `is_enabled`, `api_endpoint`, `auth_type`, `api_key_masked`, `sync_frequency_minutes`, `status` (HEALTHY/DEGRADED/OFFLINE).
- `integration_logs`: `id` (PK, BIGSERIAL), `integration_id` (FK), `sync_type`, `status`, `records_processed`, `error_message`, `payload_summary`, `started_at`, `completed_at`.
