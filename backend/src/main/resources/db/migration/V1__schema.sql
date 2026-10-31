-- =============================================================================
-- RETAIL INVENTORY MANAGEMENT SYSTEM (RIMS) - DATABASE SCHEMA
-- Project Code: PRG_RIMS_001
-- Target Database: PostgreSQL 16+
-- Total Entities: 28 Normalized Tables
-- =============================================================================

-- Enable pgcrypto for UUID/hash utilities if required
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- 1. USERS & ACCESS CONTROL (EPIC 7)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'INVENTORY_STAFF',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    assigned_location_type VARCHAR(20) CHECK (assigned_location_type IN ('WAREHOUSE', 'STORE', 'HQ')),
    assigned_location_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- -----------------------------------------------------------------------------
-- 2. PRODUCT CATALOG (EPIC 1)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    barcode VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    brand VARCHAR(100) NOT NULL,
    purchase_price NUMERIC(12, 2) NOT NULL CHECK (purchase_price >= 0),
    selling_price NUMERIC(12, 2) NOT NULL CHECK (selling_price >= purchase_price),
    image_url VARCHAR(500),
    min_stock_level INT NOT NULL DEFAULT 10 CHECK (min_stock_level >= 0),
    reorder_point INT NOT NULL DEFAULT 25 CHECK (reorder_point >= min_stock_level),
    safety_stock INT NOT NULL DEFAULT 5 CHECK (safety_stock >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DISCONTINUED')),
    weight_kg NUMERIC(8, 3) DEFAULT 0.000,
    dimensions_cm VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);

-- -----------------------------------------------------------------------------
-- 3. LOCATIONS: WAREHOUSES & STORES (EPIC 2)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS warehouses (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    capacity_sqft INT NOT NULL CHECK (capacity_sqft > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stores (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    store_manager VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 4. MULTI-LOCATION INVENTORY & LEDGER (EPIC 2)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    location_type VARCHAR(20) NOT NULL CHECK (location_type IN ('WAREHOUSE', 'STORE')),
    location_id BIGINT NOT NULL,
    current_stock INT NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    reserved_stock INT NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
    available_stock INT GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
    reorder_point INT NOT NULL DEFAULT 20,
    safety_stock INT NOT NULL DEFAULT 5,
    aisle_bin VARCHAR(50),
    last_restocked_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_product_location UNIQUE (product_id, location_type, location_id),
    CONSTRAINT chk_reserved_lte_current CHECK (reserved_stock <= current_stock)
);

CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_location ON inventory(location_type, location_id);

CREATE TABLE IF NOT EXISTS stock_transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_ref VARCHAR(100) NOT NULL UNIQUE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    location_type VARCHAR(20) NOT NULL CHECK (location_type IN ('WAREHOUSE', 'STORE')),
    location_id BIGINT NOT NULL,
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN (
        'STOCK_IN', 'STOCK_OUT', 'TRANSFER_IN', 'TRANSFER_OUT', 
        'ADJUSTMENT_ADD', 'ADJUSTMENT_SUBTRACT', 'ORDER_RESERVE', 
        'ORDER_RELEASE', 'ORDER_FULFILL', 'RETURN_RESTOCK', 'DAMAGE_WRITEOFF'
    )),
    quantity INT NOT NULL CHECK (quantity != 0),
    balance_after INT NOT NULL CHECK (balance_after >= 0),
    unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    reference_type VARCHAR(50) NOT NULL CHECK (reference_type IN (
        'PURCHASE_ORDER', 'CUSTOMER_ORDER', 'STOCK_TRANSFER', 'MANUAL_AUDIT', 'RETURN_RMA'
    )),
    reference_id VARCHAR(100) NOT NULL,
    notes TEXT,
    performed_by_user_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_tx_product ON stock_transactions(product_id);
CREATE INDEX idx_stock_tx_location ON stock_transactions(location_type, location_id);
CREATE INDEX idx_stock_tx_created ON stock_transactions(created_at);

-- -----------------------------------------------------------------------------
-- 5. STOCK TRANSFERS (EPIC 2)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_transfers (
    id BIGSERIAL PRIMARY KEY,
    transfer_number VARCHAR(100) NOT NULL UNIQUE,
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('WAREHOUSE', 'STORE')),
    source_id BIGINT NOT NULL,
    destination_type VARCHAR(20) NOT NULL CHECK (destination_type IN ('WAREHOUSE', 'STORE')),
    destination_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'APPROVED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'
    )),
    initiated_by BIGINT NOT NULL REFERENCES users(id),
    approved_by BIGINT REFERENCES users(id),
    received_by BIGINT REFERENCES users(id),
    notes TEXT,
    departure_time TIMESTAMP WITH TIME ZONE,
    arrival_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_transfer_items (
    id BIGSERIAL PRIMARY KEY,
    transfer_id BIGINT NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    requested_qty INT NOT NULL CHECK (requested_qty > 0),
    shipped_qty INT DEFAULT 0 CHECK (shipped_qty >= 0),
    received_qty INT DEFAULT 0 CHECK (received_qty >= 0),
    notes VARCHAR(255)
);

-- -----------------------------------------------------------------------------
-- 6. SUPPLIER & PROCUREMENT MANAGEMENT (EPIC 4)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    tax_id VARCHAR(50),
    payment_terms VARCHAR(50) DEFAULT 'NET_30',
    rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating >= 1.00 AND rating <= 5.00),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id BIGSERIAL PRIMARY KEY,
    po_number VARCHAR(100) NOT NULL UNIQUE,
    supplier_id BIGINT NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    warehouse_id BIGINT NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'SUBMITTED', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'
    )),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    notes TEXT,
    created_by BIGINT NOT NULL REFERENCES users(id),
    approved_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id BIGSERIAL PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    ordered_qty INT NOT NULL CHECK (ordered_qty > 0),
    received_qty INT NOT NULL DEFAULT 0 CHECK (received_qty >= 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    line_total NUMERIC(12, 2) GENERATED ALWAYS AS (ordered_qty * unit_price) STORED
);

-- -----------------------------------------------------------------------------
-- 7. CUSTOMERS, ORDERS & FULFILLMENT (EPIC 3)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    customer_code VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    shipping_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    customer_type VARCHAR(20) DEFAULT 'RETAIL' CHECK (customer_type IN ('RETAIL', 'WHOLESALE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(100) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    fulfillment_location_type VARCHAR(20) NOT NULL CHECK (fulfillment_location_type IN ('WAREHOUSE', 'STORE')),
    fulfillment_location_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'CONFIRMED', 'PROCESSING', 'PICKED', 'PACKED', 
        'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED'
    )),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PAID' CHECK (payment_status IN ('PAID', 'PENDING', 'REFUNDED')),
    subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    shipping_carrier VARCHAR(100) DEFAULT 'BlueDart Express',
    tracking_number VARCHAR(100),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    shipped_date TIMESTAMP WITH TIME ZONE,
    delivered_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_status ON customer_orders(status);
CREATE INDEX idx_orders_customer ON customer_orders(customer_id);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES customer_orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    allocated_qty INT NOT NULL DEFAULT 0 CHECK (allocated_qty >= 0),
    fulfilled_qty INT NOT NULL DEFAULT 0 CHECK (fulfilled_qty >= 0),
    line_total NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE TABLE IF NOT EXISTS order_status_history (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES customer_orders(id) ON DELETE CASCADE,
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    comment TEXT,
    changed_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS returns (
    id BIGSERIAL PRIMARY KEY,
    return_number VARCHAR(100) NOT NULL UNIQUE,
    order_id BIGINT NOT NULL REFERENCES customer_orders(id) ON DELETE RESTRICT,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    return_reason VARCHAR(100) NOT NULL,
    overall_condition VARCHAR(30) NOT NULL CHECK (overall_condition IN ('SELLABLE', 'DAMAGED', 'DEFECTIVE')),
    status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED' CHECK (status IN (
        'REQUESTED', 'APPROVED', 'REJECTED', 'RECEIVED', 'REFUNDED'
    )),
    refund_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    processed_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS return_items (
    id BIGSERIAL PRIMARY KEY,
    return_id BIGINT NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    condition_status VARCHAR(30) NOT NULL CHECK (condition_status IN ('SELLABLE', 'DAMAGED', 'DEFECTIVE')),
    is_restocked BOOLEAN NOT NULL DEFAULT FALSE,
    inspection_notes TEXT
);

-- -----------------------------------------------------------------------------
-- 8. BARCODE & RFID TRACKING (EPIC 5)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS barcode_records (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    barcode_value VARCHAR(100) NOT NULL UNIQUE,
    barcode_format VARCHAR(30) NOT NULL DEFAULT 'CODE_128',
    generated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS rfid_scan_logs (
    id BIGSERIAL PRIMARY KEY,
    epc_tag VARCHAR(100) NOT NULL,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location_type VARCHAR(20) NOT NULL CHECK (location_type IN ('WAREHOUSE', 'STORE')),
    location_id BIGINT NOT NULL,
    scan_type VARCHAR(30) NOT NULL CHECK (scan_type IN ('INBOUND_DOCK', 'OUTBOUND_DISPATCH', 'AUDIT_CYCLE')),
    scanned_by BIGINT REFERENCES users(id),
    signal_strength_rssi INT DEFAULT -65,
    scan_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rfid_epc ON rfid_scan_logs(epc_tag);
CREATE INDEX idx_rfid_product ON rfid_scan_logs(product_id);

-- -----------------------------------------------------------------------------
-- 9. NOTIFICATIONS, AUDIT & INTEGRATIONS (EPIC 6, 7, 8)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN (
        'LOW_STOCK', 'ORDER_PLACED', 'PO_APPROVED', 'TRANSFER_DISPATCHED', 'SYSTEM_ALERT'
    )),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    reference_type VARCHAR(50),
    reference_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_name, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

CREATE TABLE IF NOT EXISTS integration_configs (
    id BIGSERIAL PRIMARY KEY,
    system_name VARCHAR(100) NOT NULL UNIQUE,
    system_type VARCHAR(50) NOT NULL CHECK (system_type IN ('ERP', 'ACCOUNTING', 'LOGISTICS')),
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    api_endpoint VARCHAR(255) NOT NULL,
    auth_type VARCHAR(30) NOT NULL DEFAULT 'API_KEY',
    api_key_masked VARCHAR(50),
    sync_frequency_minutes INT NOT NULL DEFAULT 30,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) NOT NULL DEFAULT 'HEALTHY' CHECK (status IN ('HEALTHY', 'DEGRADED', 'OFFLINE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS integration_logs (
    id BIGSERIAL PRIMARY KEY,
    integration_id BIGINT NOT NULL REFERENCES integration_configs(id) ON DELETE CASCADE,
    sync_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'RETRYING')),
    records_processed INT NOT NULL DEFAULT 0,
    error_message TEXT,
    payload_summary TEXT,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);
