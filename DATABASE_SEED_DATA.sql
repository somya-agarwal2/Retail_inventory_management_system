-- =============================================================================
-- RIMS SEED DATA (PRG_RIMS_001) - REALISTIC RETAIL CORP DEMONSTRATION DATA
-- =============================================================================

-- 1. ROLES & PERMISSIONS
INSERT INTO roles (id, name, description) VALUES
(1, 'SUPER_ADMIN', 'Global Super Administrator with full permissions'),
(2, 'ADMIN', 'System Administrator with catalog, location and configuration access'),
(3, 'WAREHOUSE_MANAGER', 'Warehouse inventory, inbounds, outbounds, and stock transfers'),
(4, 'STORE_MANAGER', 'Retail store operations, local stock replenishment, and orders'),
(5, 'INVENTORY_STAFF', 'Floor stock counts, adjustments, and barcode/RFID scanning'),
(6, 'PROCUREMENT_MANAGER', 'Supplier scorecards, purchase orders, and goods receipts'),
(7, 'SALES_STAFF', 'Customer orders, counter dispatch, and returns intake'),
(8, 'ANALYST', 'Read-only access to operational analytics and audit logs')
ON CONFLICT (id) DO NOTHING;

-- 2. USERS (BCrypt hash for 'Password@123' is $2a$12$e80YhYv6g9q1FvjGZ3dJ.uK7zYg3yF0r5oBqM4t7wWqGfQhVjE6C2)
-- Using universal BCrypt test hash: $2a$10$7vN36JvQcT1i1mD1Q1oGPeH.W4jO1h3Q4N5W7O6V9X8Z1Y2X3W4U
INSERT INTO users (id, username, email, password_hash, first_name, last_name, phone, role, status, assigned_location_type, assigned_location_id) VALUES
(1, 'superadmin', 'superadmin@xyzretail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Aarav', 'Sharma', '+91 98200 11223', 'SUPER_ADMIN', 'ACTIVE', 'HQ', 1),
(2, 'admin', 'admin@xyzretail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Priya', 'Nair', '+91 98200 22334', 'ADMIN', 'ACTIVE', 'HQ', 1),
(3, 'wh_manager', 'warehouse.mgr@xyzretail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Vikram', 'Mehta', '+91 98200 33445', 'WAREHOUSE_MANAGER', 'ACTIVE', 'WAREHOUSE', 1),
(4, 'store_mgr', 'store.mgr@xyzretail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Ananya', 'Iyer', '+91 98200 44556', 'STORE_MANAGER', 'ACTIVE', 'STORE', 1),
(5, 'inv_staff', 'inventory.staff@xyzretail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Rohan', 'Verma', '+91 98200 55667', 'INVENTORY_STAFF', 'ACTIVE', 'WAREHOUSE', 1),
(6, 'proc_mgr', 'procurement@xyzretail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Suresh', 'Reddy', '+91 98200 66778', 'PROCUREMENT_MANAGER', 'ACTIVE', 'HQ', 1),
(7, 'sales_staff', 'sales@xyzretail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Neha', 'Patel', '+91 98200 77889', 'SALES_STAFF', 'ACTIVE', 'STORE', 1),
(8, 'analyst', 'analyst@xyzretail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Kabir', 'Gupta', '+91 98200 88990', 'ANALYST', 'ACTIVE', 'HQ', 1)
ON CONFLICT (id) DO NOTHING;

-- 3. PRODUCT CATEGORIES (8 Categories)
INSERT INTO categories (id, code, name, description, is_active) VALUES
(1, 'CAT-MEN-APP', 'Men Apparel', 'Formal, casual and ethnic clothing for men', TRUE),
(2, 'CAT-WOM-APP', 'Women Apparel', 'Dresses, sarees, formal and casual wear for women', TRUE),
(3, 'CAT-ELEC', 'Consumer Electronics', 'Personal audio, wearables, smart home and mobile accessories', TRUE),
(4, 'CAT-FOOT', 'Footwear', 'Formal leather shoes, sports sneakers, sandals and boots', TRUE),
(5, 'CAT-HOME', 'Home & Living', 'Bedding, curtains, furnishing and decorative items', TRUE),
(6, 'CAT-KITCH', 'Kitchen Appliances', 'Cookware, blenders, air fryers and kitchenware', TRUE),
(7, 'CAT-SPORT', 'Sports & Fitness', 'Activewear, yoga mats, resistance bands and gym bags', TRUE),
(8, 'CAT-LUGG', 'Luggage & Accessories', 'Trolleys, backpacks, leather wallets and belts', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. WAREHOUSES (3 Regional Distribution Centers)
INSERT INTO warehouses (id, code, name, address, city, state, postal_code, contact_person, phone, email, capacity_sqft, is_active) VALUES
(1, 'WH-MUM-01', 'Mumbai West Central Logistics DC', 'Plot 45, Bhiwandi Logistics Park', 'Thane', 'Maharashtra', '421302', 'Vikram Mehta', '+91 22 2847 1100', 'dc.mumbai@xyzretail.com', 120000, TRUE),
(2, 'WH-DEL-02', 'Delhi NCR Regional Mega Distribution Hub', 'Sector 82, Industrial Area, Manesar', 'Gurugram', 'Haryana', '122051', 'Rajesh Kulkarni', '+91 124 456 7890', 'dc.delhi@xyzretail.com', 150000, TRUE),
(3, 'WH-BLR-03', 'Bengaluru Southern Fulfillment Hub', 'Hosur Road, Electronics City Phase 2', 'Bengaluru', 'Karnataka', '560100', 'Deepak Gowda', '+91 80 2852 3344', 'dc.bangalore@xyzretail.com', 95000, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 5. RETAIL STORES (5 Stores)
INSERT INTO stores (id, code, name, address, city, state, postal_code, store_manager, phone, email, is_active) VALUES
(1, 'STR-MUM-101', 'XYZ High Street Phoenix Mall Store', 'Lower Parel, Senapati Bapat Marg', 'Mumbai', 'Maharashtra', '400013', 'Ananya Iyer', '+91 22 6660 1200', 'store.phoenix@xyzretail.com', TRUE),
(2, 'STR-DEL-102', 'XYZ Select Citywalk Store', 'A-3 District Centre, Saket', 'New Delhi', 'Delhi', '110017', 'Harpreet Singh', '+91 11 4100 4500', 'store.saket@xyzretail.com', TRUE),
(3, 'STR-BLR-103', 'XYZ 100ft Road Store Indiranagar', '12th Main Rd, HAL 2nd Stage', 'Bengaluru', 'Karnataka', '560038', 'Karthik Raman', '+91 80 4120 7800', 'store.indiranagar@xyzretail.com', TRUE),
(4, 'STR-HYD-104', 'XYZ Banjara Hills Flagship Store', 'Road No. 2, Banjara Hills', 'Hyderabad', 'Telangana', '500034', 'Farhan Siddiqui', '+91 40 2335 8900', 'store.banjara@xyzretail.com', TRUE),
(5, 'STR-CCU-105', 'XYZ Park Street Metro Galleria', '17 Park Street, Ward 63', 'Kolkata', 'West Bengal', '700016', 'Sourav Mukherjee', '+91 33 2229 3400', 'store.parkstreet@xyzretail.com', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 6. SUPPLIERS (5 Verified Suppliers)
INSERT INTO suppliers (id, code, name, contact_person, email, phone, address, city, state, tax_id, payment_terms, rating, status) VALUES
(1, 'SUP-RAY-01', 'Raymond Apparel Textiles Ltd', 'Ramesh Poddar', 'orders@raymondfabrics.in', '+91 22 4036 7000', 'Pokhran Road No. 1, Jekegram', 'Thane', 'Maharashtra', '27AAACR1234F1Z8', 'NET_30', 4.85, 'ACTIVE'),
(2, 'SUP-HAV-02', 'Havells India Consumer Electronics', 'Sunil Mittal', 'corporate.sales@havells.com', '+91 120 477 1000', 'QRG Towers, 2D Expressway', 'Noida', 'Uttar Pradesh', '09AAACH5678G1ZP', 'NET_45', 4.90, 'ACTIVE'),
(3, 'SUP-WOD-03', 'Woodland Aero Club Footwear', 'Jasbir Oberoi', 'supply@woodlandworldwide.com', '+91 11 4159 2000', '2168 Gurudwara Rd, Karol Bagh', 'New Delhi', 'Delhi', '07AAACW9012H1ZQ', 'NET_30', 4.70, 'ACTIVE'),
(4, 'SUP-BDY-04', 'Bombay Dyeing Furnishing Corp', 'Arun Singhania', 'b2b@bombaydyeing.com', '+91 22 6665 8282', 'Neville House, Ballard Estate', 'Mumbai', 'Maharashtra', '27AAACB3456J1ZR', 'NET_60', 4.60, 'ACTIVE'),
(5, 'SUP-PRG-05', 'Prestige TTK Kitchenware Ltd', 'M. S. Chandrasekhar', 'institutional@ttkprestige.com', '+91 80 2221 7438', '11th Floor, Brigade Towers', 'Bengaluru', 'Karnataka', '29AAACT7890K1ZS', 'NET_30', 4.80, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 7. 32 SAMPLE PRODUCTS
INSERT INTO products (id, sku, barcode, name, description, category_id, brand, purchase_price, selling_price, image_url, min_stock_level, reorder_point, safety_stock, status) VALUES
(1, 'PRD-MEN-001', '890123400101', 'Raymond Premium Slim-Fit Linen Shirt', 'Pure breathable French linen full-sleeve shirt in classic sky blue', 1, 'Raymond', 1250.00, 2499.00, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400', 15, 30, 10, 'ACTIVE'),
(2, 'PRD-MEN-002', '890123400102', 'Raymond Italian Wool Blend Trousers', 'Tailored flat-front charcoal grey formal formal trousers', 1, 'Raymond', 1800.00, 3599.00, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400', 10, 25, 5, 'ACTIVE'),
(3, 'PRD-MEN-003', '890123400103', 'Allen Solly Oxford Cotton Polo T-Shirt', 'Pique knit casual polo shirt with ribbed collar and cuffs', 1, 'Allen Solly', 550.00, 1199.00, 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400', 20, 50, 15, 'ACTIVE'),
(4, 'PRD-MEN-004', '890123400104', 'Louis Philippe Classic 2-Piece Business Suit', 'Exquisite navy blue notched-lapel poly-wool blazer and trousers', 1, 'Louis Philippe', 6200.00, 12999.00, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', 5, 12, 3, 'ACTIVE'),
(5, 'PRD-WOM-001', '890123400201', 'Biba Embroidered Anarkali Kurta Set', 'Chanderi silk festive flared kurta with dupatta and churidar', 2, 'Biba', 2100.00, 4999.00, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400', 12, 25, 8, 'ACTIVE'),
(6, 'PRD-WOM-002', '890123400202', 'W for Woman Floral A-Line Cotton Dress', 'Knee-length pastel pink breathable organic cotton sundress', 2, 'W for Woman', 850.00, 1999.00, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400', 15, 35, 10, 'ACTIVE'),
(7, 'PRD-WOM-003', '890123400203', 'Fabindia Pure Tussar Handloom Saree', 'Artisanal handwoven mustard yellow festive saree with zardozi border', 2, 'Fabindia', 3800.00, 8499.00, 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400', 8, 15, 5, 'ACTIVE'),
(8, 'PRD-WOM-004', '890123400204', 'Zara Structured Double-Breasted Trench Coat', 'Water-repellent camel beige belted winter outerwear trench', 2, 'Zara', 3400.00, 6990.00, 'https://images.unsplash.com/photo-1544441893-675973e31985?w=400', 6, 15, 4, 'ACTIVE'),
(9, 'PRD-ELEC-001', '890123400301', 'Havells Active ANC Wireless Headphones', '40mm Neodymium drivers, 35dB Active Noise Cancellation, 40h battery', 3, 'Havells', 2400.00, 4999.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 20, 45, 10, 'ACTIVE'),
(10, 'PRD-ELEC-002', '890123400302', 'boAt Storm Pro AMOLED Smartwatch', '1.78 inch always-on display, heart rate, SpO2 and 700+ sports modes', 3, 'boAt', 1450.00, 2999.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 25, 60, 15, 'ACTIVE'),
(11, 'PRD-ELEC-003', '890123400303', 'Noise Buds VS104 True Wireless Earbuds', '13mm drivers, 45ms low latency gaming mode, 45h playtime with case', 3, 'Noise', 650.00, 1499.00, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', 30, 80, 20, 'ACTIVE'),
(12, 'PRD-ELEC-004', '890123400304', 'Mi 20000mAh 18W Fast Charging Power Bank', 'Triple output ports, high density lithium polymer battery bank', 3, 'Xiaomi', 950.00, 1999.00, 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=400', 20, 50, 12, 'ACTIVE'),
(13, 'PRD-FOOT-001', '890123400401', 'Woodland Leather Rugged High-Top Boots', 'Nubuck water-resistant oiled leather heavy duty outdoor trekking boots', 4, 'Woodland', 2800.00, 5495.00, 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400', 12, 30, 8, 'ACTIVE'),
(14, 'PRD-FOOT-002', '890123400402', 'Bata Formal Derby Leather Dress Shoes', 'Genuine black calfskin leather lace-up shoes for business meetings', 4, 'Bata', 1100.00, 2299.00, 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400', 15, 35, 10, 'ACTIVE'),
(15, 'PRD-FOOT-003', '890123400403', 'Puma Nitro Running Air Sneakers', 'Supercritical foam cushioning, breathable engineered mesh upper', 4, 'Puma', 3200.00, 6999.00, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 18, 40, 12, 'ACTIVE'),
(16, 'PRD-FOOT-004', '890123400404', 'Metro Women Block-Heel Festive Sandals', 'Gilded metallic straps with cushioned orthotic insole', 4, 'Metro', 1250.00, 2690.00, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', 10, 25, 8, 'ACTIVE'),
(17, 'PRD-HOME-001', '890123400501', 'Bombay Dyeing 400TC Egyptian Cotton Bedsheet', 'King size satin stripe luxury bedsheet set with two pillow covers', 5, 'Bombay Dyeing', 1600.00, 3499.00, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400', 15, 30, 8, 'ACTIVE'),
(18, 'PRD-HOME-002', '890123400502', 'Spaces Memory Foam Ergonomic Pillow', 'Contoured cervical support cooling gel memory foam pillow', 5, 'Spaces', 900.00, 1999.00, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400', 20, 40, 10, 'ACTIVE'),
(19, 'PRD-HOME-003', '890123400503', 'D-Decor Textured Blackout Curtains (Set of 2)', 'Jacquard weave thermal insulated 7-foot eyelet door curtains', 5, 'D-Decor', 1400.00, 2899.00, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400', 12, 28, 6, 'ACTIVE'),
(20, 'PRD-HOME-004', '890123400504', 'Home Centre Nordic Ceramic Vase Set (3 Pcs)', 'Minimalist matte ceramic decorative vases for living room console', 5, 'Home Centre', 750.00, 1699.00, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400', 8, 20, 5, 'ACTIVE'),
(21, 'PRD-KITCH-001', '890123400601', 'Prestige Svachh Hard Anodized Pressure Cooker 5L', 'Spillage control deep lid with flame guard safety valve system', 6, 'Prestige', 1350.00, 2595.00, 'https://images.unsplash.com/photo-1584990347449-397cf1e4d3aa?w=400', 15, 35, 10, 'ACTIVE'),
(22, 'PRD-KITCH-002', '890123400602', 'Philips Digital Air Fryer with Rapid Air Tech', '4.1 Litre 1400W low-oil healthy fryer with touch screen presets', 6, 'Philips', 4200.00, 7999.00, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400', 8, 20, 5, 'ACTIVE'),
(23, 'PRD-KITCH-003', '890123400603', 'Bajaj Rex 500W Mixer Grinder (3 Jars)', 'Multi-function stainless steel jars with overload motor protector', 6, 'Bajaj', 1500.00, 2899.00, 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400', 14, 30, 8, 'ACTIVE'),
(24, 'PRD-KITCH-004', '890123400604', 'Milton Thermosteel Insulated Flask 1000ml', '24-hour hot & cold vacuum insulated 304 food-grade stainless steel', 6, 'Milton', 480.00, 999.00, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', 25, 60, 15, 'ACTIVE'),
(25, 'PRD-SPORT-001', '890123400701', 'Decathlon Domyos Anti-Slip Yoga Mat 6mm', 'High density eco-friendly TPE alignment mat with carry strap', 7, 'Domyos', 600.00, 1299.00, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', 20, 45, 12, 'ACTIVE'),
(26, 'PRD-SPORT-002', '890123400702', 'Boldfit Adjustable Dumbbell Set (20kg)', 'Rubber encasing with anti-slip knurled grip handles and locks', 7, 'Boldfit', 1800.00, 3499.00, 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400', 10, 22, 6, 'ACTIVE'),
(27, 'PRD-SPORT-003', '890123400703', 'Nivia Storm Football Size 5 (FIFA Approved)', 'Multi-laminated rubber bladder with high-abrasion PU outer casing', 7, 'Nivia', 420.00, 899.00, 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=400', 25, 50, 15, 'ACTIVE'),
(28, 'PRD-SPORT-004', '890123400704', 'Yonex Nanoray Carbon Fiber Badminton Racket', 'Ultra-lightweight aerodynamic graphite frame with isometric head', 7, 'Yonex', 1600.00, 2990.00, 'https://images.unsplash.com/photo-1613918431703-aa632b704c7b?w=400', 15, 30, 8, 'ACTIVE'),
(29, 'PRD-LUGG-001', '890123400801', 'American Tourister Polycarbonate Trolley 68cm', 'Scratch-resistant hard shell spinner with recessed TSA combination lock', 8, 'American Tourister', 3400.00, 6999.00, 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=400', 12, 25, 6, 'ACTIVE'),
(30, 'PRD-LUGG-002', '890123400802', 'Wildcraft 45L Waterproof Trekking Rucksack', 'Ripstop nylon backpack with padded lumbar support and rain cover', 8, 'Wildcraft', 1450.00, 2899.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 18, 35, 10, 'ACTIVE'),
(31, 'PRD-LUGG-003', '890123400803', 'Hidesign Genuine Leather Bi-Fold Wallet', 'Vegetable-tanned hand-buffed full grain leather with RFID blocking', 8, 'Hidesign', 950.00, 2195.00, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400', 20, 45, 10, 'ACTIVE'),
(32, 'PRD-LUGG-004', '890123400804', 'Titan Men Reversible Black & Brown Leather Belt', 'Brushed chrome finish swivel buckle with premium Italian leather strap', 8, 'Titan', 680.00, 1495.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 25, 50, 15, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 8. INITIAL INVENTORY DISTRIBUTION (Across 3 Warehouses and 5 Stores)
-- Sample seed stock distribution for core SKUs
INSERT INTO inventory (product_id, location_type, location_id, current_stock, reserved_stock, reorder_point, safety_stock, aisle_bin) VALUES
-- Warehouse 1 (Mumbai DC)
(1, 'WAREHOUSE', 1, 140, 15, 30, 10, 'A-01-04'),
(2, 'WAREHOUSE', 1, 95, 5, 25, 5, 'A-01-05'),
(3, 'WAREHOUSE', 1, 220, 20, 50, 15, 'A-02-01'),
(4, 'WAREHOUSE', 1, 35, 2, 12, 3, 'A-02-08'),
(9, 'WAREHOUSE', 1, 110, 10, 45, 10, 'E-03-02'),
(10, 'WAREHOUSE', 1, 180, 25, 60, 15, 'E-03-04'),
(13, 'WAREHOUSE', 1, 85, 8, 30, 8, 'F-01-01'),
(21, 'WAREHOUSE', 1, 120, 12, 35, 10, 'K-04-03'),

-- Retail Store 1 (Phoenix Mall Mumbai)
(1, 'STORE', 1, 28, 2, 15, 5, 'FL-M-01'),
(2, 'STORE', 1, 18, 0, 10, 3, 'FL-M-02'),
(3, 'STORE', 1, 42, 4, 20, 8, 'FL-M-03'),
(5, 'STORE', 1, 22, 1, 12, 4, 'FL-W-01'),
(9, 'STORE', 1, 16, 2, 10, 4, 'FL-E-01'),
(10, 'STORE', 1, 25, 3, 15, 5, 'FL-E-02'),
(13, 'STORE', 1, 14, 0, 8, 3, 'FL-F-01'),
(17, 'STORE', 1, 19, 1, 10, 3, 'FL-H-01'),

-- Retail Store 2 (Select Citywalk Delhi)
(1, 'STORE', 2, 24, 0, 15, 5, 'DEL-M-01'),
(5, 'STORE', 2, 30, 2, 15, 5, 'DEL-W-01'),
(9, 'STORE', 2, 12, 1, 10, 4, 'DEL-E-01'),
(10, 'STORE', 2, 18, 0, 15, 5, 'DEL-E-02'),
(13, 'STORE', 2, 22, 3, 10, 4, 'DEL-F-01'),

-- Low stock sample for Alert Verification
(4, 'STORE', 1, 2, 0, 10, 3, 'FL-M-08'),
(8, 'STORE', 1, 1, 0, 8, 2, 'FL-W-04'),
(22, 'STORE', 2, 2, 0, 8, 2, 'DEL-K-02')
ON CONFLICT (product_id, location_type, location_id) DO NOTHING;

-- 9. SAMPLE CUSTOMERS
INSERT INTO customers (id, customer_code, first_name, last_name, email, phone, shipping_address, city, state, postal_code, customer_type) VALUES
(1, 'CUST-001', 'Rahul', 'Dravid', 'rahul.d@gmail.com', '+91 98450 12345', '14 Koramangala 4th Block', 'Bengaluru', 'Karnataka', '560034', 'RETAIL'),
(2, 'CUST-002', 'Smriti', 'Mandhana', 'smriti.m@gmail.com', '+91 98220 54321', '88 Bandra Reclamation', 'Mumbai', 'Maharashtra', '400050', 'RETAIL'),
(3, 'CUST-003', 'Sunil', 'Gavaskar', 'sunil.g@crickettech.in', '+91 98200 99887', '21 Worli Sea Face', 'Mumbai', 'Maharashtra', '400018', 'WHOLESALE')
ON CONFLICT (id) DO NOTHING;

-- 10. SAMPLE SYSTEM INTEGRATIONS CONFIG
INSERT INTO integration_configs (id, system_name, system_type, is_enabled, api_endpoint, auth_type, api_key_masked, sync_frequency_minutes, status) VALUES
(1, 'SAP S/4HANA ERP Connector', 'ERP', TRUE, 'https://mock-erp.xyzretail.internal/odata/v4/InventorySync', 'BEARER_TOKEN', 'sap_sec_****_8941', 15, 'HEALTHY'),
(2, 'QuickBooks Enterprise Accounting', 'ACCOUNTING', TRUE, 'https://mock-qb.xyzretail.internal/v3/company/ledger', 'OAUTH2', 'qb_tok_****_3321', 30, 'HEALTHY'),
(3, 'BlueDart Express Logistics API', 'LOGISTICS', TRUE, 'https://mock-logistics.xyzretail.internal/api/v2/shipment', 'API_KEY', 'bd_key_****_7765', 5, 'HEALTHY')
ON CONFLICT (id) DO NOTHING;
