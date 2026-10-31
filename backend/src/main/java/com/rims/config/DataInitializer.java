package com.rims.config;

import com.rims.category.Category;
import com.rims.category.CategoryRepository;
import com.rims.integration.IntegrationConfig;
import com.rims.integration.IntegrationConfigRepository;
import com.rims.inventory.Inventory;
import com.rims.inventory.InventoryRepository;
import com.rims.order.Customer;
import com.rims.order.CustomerOrder;
import com.rims.order.CustomerOrderRepository;
import com.rims.order.CustomerRepository;
import com.rims.order.OrderItem;
import com.rims.order.OrderStatusHistory;
import com.rims.product.Product;
import com.rims.product.ProductRepository;
import com.rims.purchaseorder.PurchaseOrder;
import com.rims.purchaseorder.PurchaseOrderItem;
import com.rims.purchaseorder.PurchaseOrderRepository;
import com.rims.role.Role;
import com.rims.role.RoleRepository;
import com.rims.stock.StockTransaction;
import com.rims.stock.StockTransactionRepository;
import com.rims.store.Store;
import com.rims.store.StoreRepository;
import com.rims.supplier.Supplier;
import com.rims.supplier.SupplierRepository;
import com.rims.user.User;
import com.rims.user.UserRepository;
import com.rims.warehouse.Warehouse;
import com.rims.warehouse.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final WarehouseRepository warehouseRepository;
    private final StoreRepository storeRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CustomerRepository customerRepository;
    private final CustomerOrderRepository orderRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final IntegrationConfigRepository integrationConfigRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already initialized with records.");
            return;
        }

        log.info("Starting enterprise data seeding for RIMS (PRG_RIMS_001)...");

        // 1. Roles
        String[] roleNames = {
            "SUPER_ADMIN", "ADMIN", "WAREHOUSE_MANAGER", "STORE_MANAGER", 
            "INVENTORY_STAFF", "PROCUREMENT_MANAGER", "SALES_STAFF", "ANALYST"
        };
        for (String rName : roleNames) {
            roleRepository.save(Role.builder().name(rName).description("Role for " + rName).build());
        }

        // 2. Users (Universal Password: Password@123)
        String encodedPass = passwordEncoder.encode("Password@123");
        userRepository.save(User.builder().username("superadmin").email("superadmin@xyzretail.com").passwordHash(encodedPass).firstName("Aarav").lastName("Sharma").phone("+91 98200 11223").role("SUPER_ADMIN").status("ACTIVE").assignedLocationType("HQ").assignedLocationId(1L).build());
        userRepository.save(User.builder().username("admin").email("admin@xyzretail.com").passwordHash(encodedPass).firstName("Priya").lastName("Nair").phone("+91 98200 22334").role("ADMIN").status("ACTIVE").assignedLocationType("HQ").assignedLocationId(1L).build());
        userRepository.save(User.builder().username("wh_manager").email("warehouse.mgr@xyzretail.com").passwordHash(encodedPass).firstName("Vikram").lastName("Mehta").phone("+91 98200 33445").role("WAREHOUSE_MANAGER").status("ACTIVE").assignedLocationType("WAREHOUSE").assignedLocationId(1L).build());
        userRepository.save(User.builder().username("store_mgr").email("store.mgr@xyzretail.com").passwordHash(encodedPass).firstName("Ananya").lastName("Iyer").phone("+91 98200 44556").role("STORE_MANAGER").status("ACTIVE").assignedLocationType("STORE").assignedLocationId(1L).build());
        userRepository.save(User.builder().username("inv_staff").email("inventory.staff@xyzretail.com").passwordHash(encodedPass).firstName("Rohan").lastName("Verma").phone("+91 98200 55667").role("INVENTORY_STAFF").status("ACTIVE").assignedLocationType("WAREHOUSE").assignedLocationId(1L).build());
        userRepository.save(User.builder().username("proc_mgr").email("procurement@xyzretail.com").passwordHash(encodedPass).firstName("Suresh").lastName("Reddy").phone("+91 98200 66778").role("PROCUREMENT_MANAGER").status("ACTIVE").assignedLocationType("HQ").assignedLocationId(1L).build());
        userRepository.save(User.builder().username("sales_staff").email("sales@xyzretail.com").passwordHash(encodedPass).firstName("Neha").lastName("Patel").phone("+91 98200 77889").role("SALES_STAFF").status("ACTIVE").assignedLocationType("STORE").assignedLocationId(1L).build());
        userRepository.save(User.builder().username("analyst").email("analyst@xyzretail.com").passwordHash(encodedPass).firstName("Kabir").lastName("Gupta").phone("+91 98200 88990").role("ANALYST").status("ACTIVE").assignedLocationType("HQ").assignedLocationId(1L).build());

        // 3. 8 Categories
        Category catMen = categoryRepository.save(Category.builder().code("CAT-MEN-APP").name("Men Apparel").description("Formal and casual clothing for men").build());
        Category catWom = categoryRepository.save(Category.builder().code("CAT-WOM-APP").name("Women Apparel").description("Dresses, sarees, formal and casual wear").build());
        Category catElec = categoryRepository.save(Category.builder().code("CAT-ELEC").name("Consumer Electronics").description("Audio, wearables, smart home, accessories").build());
        Category catFoot = categoryRepository.save(Category.builder().code("CAT-FOOT").name("Footwear").description("Formal shoes, sneakers, sandals, boots").build());
        Category catHome = categoryRepository.save(Category.builder().code("CAT-HOME").name("Home & Living").description("Bedding, curtains, furnishing, decor").build());
        Category catKitch = categoryRepository.save(Category.builder().code("CAT-KITCH").name("Kitchen Appliances").description("Cookware, blenders, air fryers, kitchenware").build());
        Category catSport = categoryRepository.save(Category.builder().code("CAT-SPORT").name("Sports & Fitness").description("Activewear, yoga mats, dumbells, balls").build());
        Category catLugg = categoryRepository.save(Category.builder().code("CAT-LUGG").name("Luggage & Accessories").description("Trolleys, backpacks, leather wallets, belts").build());

        // 4. 3 Warehouses
        Warehouse whMum = warehouseRepository.save(Warehouse.builder().code("WH-MUM-01").name("Mumbai West Central Logistics DC").address("Plot 45, Bhiwandi Logistics Park").city("Thane").state("Maharashtra").postalCode("421302").contactPerson("Vikram Mehta").phone("+91 22 2847 1100").email("dc.mumbai@xyzretail.com").capacitySqft(120000).build());
        Warehouse whDel = warehouseRepository.save(Warehouse.builder().code("WH-DEL-02").name("Delhi NCR Regional Mega Distribution Hub").address("Sector 82, Industrial Area, Manesar").city("Gurugram").state("Haryana").postalCode("122051").contactPerson("Rajesh Kulkarni").phone("+91 124 456 7890").email("dc.delhi@xyzretail.com").capacitySqft(150000).build());
        Warehouse whBlr = warehouseRepository.save(Warehouse.builder().code("WH-BLR-03").name("Bengaluru Southern Fulfillment Hub").address("Hosur Road, Electronics City Phase 2").city("Bengaluru").state("Karnataka").postalCode("560100").contactPerson("Deepak Gowda").phone("+91 80 2852 3344").email("dc.bangalore@xyzretail.com").capacitySqft(95000).build());

        // 5. 5 Retail Stores
        Store strMum = storeRepository.save(Store.builder().code("STR-MUM-101").name("XYZ High Street Phoenix Mall Store").address("Lower Parel, Senapati Bapat Marg").city("Mumbai").state("Maharashtra").postalCode("400013").storeManager("Ananya Iyer").phone("+91 22 6660 1200").email("store.phoenix@xyzretail.com").build());
        Store strDel = storeRepository.save(Store.builder().code("STR-DEL-102").name("XYZ Select Citywalk Store").address("A-3 District Centre, Saket").city("New Delhi").state("Delhi").postalCode("110017").storeManager("Harpreet Singh").phone("+91 11 4100 4500").email("store.saket@xyzretail.com").build());
        Store strBlr = storeRepository.save(Store.builder().code("STR-BLR-103").name("XYZ 100ft Road Store Indiranagar").address("12th Main Rd, HAL 2nd Stage").city("Bengaluru").state("Karnataka").postalCode("560038").storeManager("Karthik Raman").phone("+91 80 4120 7800").email("store.indiranagar@xyzretail.com").build());
        Store strHyd = storeRepository.save(Store.builder().code("STR-HYD-104").name("XYZ Banjara Hills Flagship Store").address("Road No. 2, Banjara Hills").city("Hyderabad").state("Telangana").postalCode("500034").storeManager("Farhan Siddiqui").phone("+91 40 2335 8900").email("store.banjara@xyzretail.com").build());
        Store strCcu = storeRepository.save(Store.builder().code("STR-CCU-105").name("XYZ Park Street Metro Galleria").address("17 Park Street, Ward 63").city("Kolkata").state("West Bengal").postalCode("700016").storeManager("Sourav Mukherjee").phone("+91 33 2229 3400").email("store.parkstreet@xyzretail.com").build());

        // 6. 5 Verified Suppliers
        Supplier supRay = supplierRepository.save(Supplier.builder().code("SUP-RAY-01").name("Raymond Apparel Textiles Ltd").contactPerson("Ramesh Poddar").email("orders@raymondfabrics.in").phone("+91 22 4036 7000").address("Pokhran Road No. 1").city("Thane").state("Maharashtra").taxId("27AAACR1234F1Z8").paymentTerms("NET_30").rating(BigDecimal.valueOf(4.85)).build());
        Supplier supHav = supplierRepository.save(Supplier.builder().code("SUP-HAV-02").name("Havells India Consumer Electronics").contactPerson("Sunil Mittal").email("corporate.sales@havells.com").phone("+91 120 477 1000").address("QRG Towers, 2D Expressway").city("Noida").state("Uttar Pradesh").taxId("09AAACH5678G1ZP").paymentTerms("NET_45").rating(BigDecimal.valueOf(4.90)).build());
        Supplier supWod = supplierRepository.save(Supplier.builder().code("SUP-WOD-03").name("Woodland Aero Club Footwear").contactPerson("Jasbir Oberoi").email("supply@woodlandworldwide.com").phone("+91 11 4159 2000").address("2168 Gurudwara Rd").city("New Delhi").state("Delhi").taxId("07AAACW9012H1ZQ").paymentTerms("NET_30").rating(BigDecimal.valueOf(4.70)).build());
        Supplier supBdy = supplierRepository.save(Supplier.builder().code("SUP-BDY-04").name("Bombay Dyeing Furnishing Corp").contactPerson("Arun Singhania").email("b2b@bombaydyeing.com").phone("+91 22 6665 8282").address("Neville House, Ballard Estate").city("Mumbai").state("Maharashtra").taxId("27AAACB3456J1ZR").paymentTerms("NET_60").rating(BigDecimal.valueOf(4.60)).build());
        Supplier supPrg = supplierRepository.save(Supplier.builder().code("SUP-PRG-05").name("Prestige TTK Kitchenware Ltd").contactPerson("M. S. Chandrasekhar").email("institutional@ttkprestige.com").phone("+91 80 2221 7438").address("Brigade Towers").city("Bengaluru").state("Karnataka").taxId("29AAACT7890K1ZS").paymentTerms("NET_30").rating(BigDecimal.valueOf(4.80)).build());

        // 7. 32 Products
        List<Product> products = new ArrayList<>();
        products.add(productRepository.save(Product.builder().sku("PRD-MEN-001").barcode("890123400101").name("Raymond Premium Slim-Fit Linen Shirt").description("Pure French linen full-sleeve shirt in classic sky blue").category(catMen).brand("Raymond").purchasePrice(BigDecimal.valueOf(1250.00)).sellingPrice(BigDecimal.valueOf(2499.00)).imageUrl("https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400").minStockLevel(15).reorderPoint(30).safetyStock(10).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-MEN-002").barcode("890123400102").name("Raymond Italian Wool Blend Trousers").description("Tailored flat-front charcoal grey formal trousers").category(catMen).brand("Raymond").purchasePrice(BigDecimal.valueOf(1800.00)).sellingPrice(BigDecimal.valueOf(3599.00)).imageUrl("https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400").minStockLevel(10).reorderPoint(25).safetyStock(5).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-MEN-003").barcode("890123400103").name("Allen Solly Oxford Cotton Polo T-Shirt").description("Pique knit casual polo shirt with ribbed collar").category(catMen).brand("Allen Solly").purchasePrice(BigDecimal.valueOf(550.00)).sellingPrice(BigDecimal.valueOf(1199.00)).imageUrl("https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400").minStockLevel(20).reorderPoint(50).safetyStock(15).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-MEN-004").barcode("890123400104").name("Louis Philippe Classic 2-Piece Business Suit").description("Exquisite navy blue notched-lapel poly-wool blazer and trousers").category(catMen).brand("Louis Philippe").purchasePrice(BigDecimal.valueOf(6200.00)).sellingPrice(BigDecimal.valueOf(12999.00)).imageUrl("https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400").minStockLevel(5).reorderPoint(12).safetyStock(3).build()));
        
        products.add(productRepository.save(Product.builder().sku("PRD-WOM-001").barcode("890123400201").name("Biba Embroidered Anarkali Kurta Set").description("Chanderi silk festive flared kurta with dupatta").category(catWom).brand("Biba").purchasePrice(BigDecimal.valueOf(2100.00)).sellingPrice(BigDecimal.valueOf(4999.00)).imageUrl("https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400").minStockLevel(12).reorderPoint(25).safetyStock(8).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-WOM-002").barcode("890123400202").name("W for Woman Floral A-Line Cotton Dress").description("Knee-length pastel pink breathable organic cotton dress").category(catWom).brand("W for Woman").purchasePrice(BigDecimal.valueOf(850.00)).sellingPrice(BigDecimal.valueOf(1999.00)).imageUrl("https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400").minStockLevel(15).reorderPoint(35).safetyStock(10).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-WOM-003").barcode("890123400203").name("Fabindia Pure Tussar Handloom Saree").description("Artisanal handwoven mustard yellow festive saree").category(catWom).brand("Fabindia").purchasePrice(BigDecimal.valueOf(3800.00)).sellingPrice(BigDecimal.valueOf(8499.00)).imageUrl("https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400").minStockLevel(8).reorderPoint(15).safetyStock(5).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-WOM-004").barcode("890123400204").name("Zara Structured Double-Breasted Trench Coat").description("Water-repellent camel beige belted winter outerwear trench").category(catWom).brand("Zara").purchasePrice(BigDecimal.valueOf(3400.00)).sellingPrice(BigDecimal.valueOf(6990.00)).imageUrl("https://images.unsplash.com/photo-1544441893-675973e31985?w=400").minStockLevel(6).reorderPoint(15).safetyStock(4).build()));

        products.add(productRepository.save(Product.builder().sku("PRD-ELEC-001").barcode("890123400301").name("Havells Active ANC Wireless Headphones").description("40mm Neodymium drivers, 35dB Active Noise Cancellation").category(catElec).brand("Havells").purchasePrice(BigDecimal.valueOf(2400.00)).sellingPrice(BigDecimal.valueOf(4999.00)).imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400").minStockLevel(20).reorderPoint(45).safetyStock(10).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-ELEC-002").barcode("890123400302").name("boAt Storm Pro AMOLED Smartwatch").description("1.78 inch always-on display, heart rate, SpO2 sensor").category(catElec).brand("boAt").purchasePrice(BigDecimal.valueOf(1450.00)).sellingPrice(BigDecimal.valueOf(2999.00)).imageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400").minStockLevel(25).reorderPoint(60).safetyStock(15).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-ELEC-003").barcode("890123400303").name("Noise Buds VS104 True Wireless Earbuds").description("13mm drivers, 45ms low latency gaming mode, 45h playtime").category(catElec).brand("Noise").purchasePrice(BigDecimal.valueOf(650.00)).sellingPrice(BigDecimal.valueOf(1499.00)).imageUrl("https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400").minStockLevel(30).reorderPoint(80).safetyStock(20).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-ELEC-004").barcode("890123400304").name("Mi 20000mAh 18W Fast Charging Power Bank").description("Triple output ports, high density lithium polymer battery").category(catElec).brand("Xiaomi").purchasePrice(BigDecimal.valueOf(950.00)).sellingPrice(BigDecimal.valueOf(1999.00)).imageUrl("https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=400").minStockLevel(20).reorderPoint(50).safetyStock(12).build()));

        products.add(productRepository.save(Product.builder().sku("PRD-FOOT-001").barcode("890123400401").name("Woodland Leather Rugged High-Top Boots").description("Nubuck water-resistant oiled leather heavy duty boots").category(catFoot).brand("Woodland").purchasePrice(BigDecimal.valueOf(2800.00)).sellingPrice(BigDecimal.valueOf(5495.00)).imageUrl("https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400").minStockLevel(12).reorderPoint(30).safetyStock(8).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-FOOT-002").barcode("890123400402").name("Bata Formal Derby Leather Dress Shoes").description("Genuine black calfskin leather lace-up dress shoes").category(catFoot).brand("Bata").purchasePrice(BigDecimal.valueOf(1100.00)).sellingPrice(BigDecimal.valueOf(2299.00)).imageUrl("https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400").minStockLevel(15).reorderPoint(35).safetyStock(10).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-FOOT-003").barcode("890123400403").name("Puma Nitro Running Air Sneakers").description("Supercritical foam cushioning, breathable mesh upper").category(catFoot).brand("Puma").purchasePrice(BigDecimal.valueOf(3200.00)).sellingPrice(BigDecimal.valueOf(6999.00)).imageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400").minStockLevel(18).reorderPoint(40).safetyStock(12).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-FOOT-004").barcode("890123400404").name("Metro Women Block-Heel Festive Sandals").description("Gilded metallic straps with cushioned orthotic insole").category(catFoot).brand("Metro").purchasePrice(BigDecimal.valueOf(1250.00)).sellingPrice(BigDecimal.valueOf(2690.00)).imageUrl("https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400").minStockLevel(10).reorderPoint(25).safetyStock(8).build()));

        products.add(productRepository.save(Product.builder().sku("PRD-HOME-001").barcode("890123400501").name("Bombay Dyeing 400TC Egyptian Bedsheet").description("King size satin stripe luxury bedsheet set with pillow covers").category(catHome).brand("Bombay Dyeing").purchasePrice(BigDecimal.valueOf(1600.00)).sellingPrice(BigDecimal.valueOf(3499.00)).imageUrl("https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400").minStockLevel(15).reorderPoint(30).safetyStock(8).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-HOME-002").barcode("890123400502").name("Spaces Memory Foam Ergonomic Pillow").description("Contoured cervical support cooling gel memory foam pillow").category(catHome).brand("Spaces").purchasePrice(BigDecimal.valueOf(900.00)).sellingPrice(BigDecimal.valueOf(1999.00)).imageUrl("https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400").minStockLevel(20).reorderPoint(40).safetyStock(10).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-HOME-003").barcode("890123400503").name("D-Decor Textured Blackout Curtains Set").description("Jacquard weave thermal insulated 7-foot door curtains").category(catHome).brand("D-Decor").purchasePrice(BigDecimal.valueOf(1400.00)).sellingPrice(BigDecimal.valueOf(2899.00)).imageUrl("https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400").minStockLevel(12).reorderPoint(28).safetyStock(6).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-HOME-004").barcode("890123400504").name("Home Centre Nordic Ceramic Vase Set").description("Minimalist matte ceramic decorative vases (3 Pcs)").category(catHome).brand("Home Centre").purchasePrice(BigDecimal.valueOf(750.00)).sellingPrice(BigDecimal.valueOf(1699.00)).imageUrl("https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400").minStockLevel(8).reorderPoint(20).safetyStock(5).build()));

        products.add(productRepository.save(Product.builder().sku("PRD-KITCH-001").barcode("890123400601").name("Prestige Svachh Pressure Cooker 5L").description("Spillage control deep lid with flame guard safety valve").category(catKitch).brand("Prestige").purchasePrice(BigDecimal.valueOf(1350.00)).sellingPrice(BigDecimal.valueOf(2595.00)).imageUrl("https://images.unsplash.com/photo-1584990347449-397cf1e4d3aa?w=400").minStockLevel(15).reorderPoint(35).safetyStock(10).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-KITCH-002").barcode("890123400602").name("Philips Digital Rapid Air Fryer").description("4.1 Litre 1400W low-oil fryer with digital touch screen").category(catKitch).brand("Philips").purchasePrice(BigDecimal.valueOf(4200.00)).sellingPrice(BigDecimal.valueOf(7999.00)).imageUrl("https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400").minStockLevel(8).reorderPoint(20).safetyStock(5).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-KITCH-003").barcode("890123400603").name("Bajaj Rex 500W Mixer Grinder (3 Jars)").description("Stainless steel jars with overload motor protector").category(catKitch).brand("Bajaj").purchasePrice(BigDecimal.valueOf(1500.00)).sellingPrice(BigDecimal.valueOf(2899.00)).imageUrl("https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400").minStockLevel(14).reorderPoint(30).safetyStock(8).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-KITCH-004").barcode("890123400604").name("Milton Thermosteel Flask 1000ml").description("24-hour hot & cold vacuum insulated stainless steel").category(catKitch).brand("Milton").purchasePrice(BigDecimal.valueOf(480.00)).sellingPrice(BigDecimal.valueOf(999.00)).imageUrl("https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400").minStockLevel(25).reorderPoint(60).safetyStock(15).build()));

        products.add(productRepository.save(Product.builder().sku("PRD-SPORT-001").barcode("890123400701").name("Decathlon Domyos Anti-Slip Yoga Mat").description("High density eco-friendly TPE alignment mat with carry strap").category(catSport).brand("Domyos").purchasePrice(BigDecimal.valueOf(600.00)).sellingPrice(BigDecimal.valueOf(1299.00)).imageUrl("https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400").minStockLevel(20).reorderPoint(45).safetyStock(12).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-SPORT-002").barcode("890123400702").name("Boldfit Adjustable Dumbbell Set 20kg").description("Rubber encasing with anti-slip knurled grip handles").category(catSport).brand("Boldfit").purchasePrice(BigDecimal.valueOf(1800.00)).sellingPrice(BigDecimal.valueOf(3499.00)).imageUrl("https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400").minStockLevel(10).reorderPoint(22).safetyStock(6).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-SPORT-003").barcode("890123400703").name("Nivia Storm Football Size 5").description("Multi-laminated rubber bladder, high-abrasion PU casing").category(catSport).brand("Nivia").purchasePrice(BigDecimal.valueOf(420.00)).sellingPrice(BigDecimal.valueOf(899.00)).imageUrl("https://images.unsplash.com/photo-1511886929837-354d827aae26?w=400").minStockLevel(25).reorderPoint(50).safetyStock(15).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-SPORT-004").barcode("890123400704").name("Yonex Nanoray Carbon Badminton Racket").description("Ultra-lightweight aerodynamic graphite frame").category(catSport).brand("Yonex").purchasePrice(BigDecimal.valueOf(1600.00)).sellingPrice(BigDecimal.valueOf(2990.00)).imageUrl("https://images.unsplash.com/photo-1613918431703-aa632b704c7b?w=400").minStockLevel(15).reorderPoint(30).safetyStock(8).build()));

        products.add(productRepository.save(Product.builder().sku("PRD-LUGG-001").barcode("890123400801").name("American Tourister Trolley 68cm").description("Scratch-resistant hard shell spinner with TSA lock").category(catLugg).brand("American Tourister").purchasePrice(BigDecimal.valueOf(3400.00)).sellingPrice(BigDecimal.valueOf(6999.00)).imageUrl("https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=400").minStockLevel(12).reorderPoint(25).safetyStock(6).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-LUGG-002").barcode("890123400802").name("Wildcraft 45L Waterproof Rucksack").description("Ripstop nylon backpack with padded lumbar support and rain cover").category(catLugg).brand("Wildcraft").purchasePrice(BigDecimal.valueOf(1450.00)).sellingPrice(BigDecimal.valueOf(2899.00)).imageUrl("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400").minStockLevel(18).reorderPoint(35).safetyStock(10).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-LUGG-003").barcode("890123400803").name("Hidesign Leather Bi-Fold Wallet").description("Vegetable-tanned full grain leather with RFID blocking").category(catLugg).brand("Hidesign").purchasePrice(BigDecimal.valueOf(950.00)).sellingPrice(BigDecimal.valueOf(2195.00)).imageUrl("https://images.unsplash.com/photo-1627123424574-724758594e93?w=400").minStockLevel(20).reorderPoint(45).safetyStock(10).build()));
        products.add(productRepository.save(Product.builder().sku("PRD-LUGG-004").barcode("890123400804").name("Titan Reversible Leather Belt").description("Brushed chrome swivel buckle with Italian leather strap").category(catLugg).brand("Titan").purchasePrice(BigDecimal.valueOf(680.00)).sellingPrice(BigDecimal.valueOf(1495.00)).imageUrl("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400").minStockLevel(25).reorderPoint(50).safetyStock(15).build()));

        // 8. Inventory Balances across Warehouses and Stores
        for (Product p : products) {
            // Warehouse 1 (Mumbai DC)
            int whStock = 60 + (int)(Math.random() * 80);
            int whReserved = (int)(Math.random() * 10);
            inventoryRepository.save(Inventory.builder()
                    .product(p)
                    .locationType("WAREHOUSE")
                    .locationId(whMum.getId())
                    .currentStock(whStock)
                    .reservedStock(whReserved)
                    .reorderPoint(p.getReorderPoint())
                    .safetyStock(p.getSafetyStock())
                    .aisleBin("WH-A-" + (1 + (int)(Math.random() * 20)))
                    .lastRestockedAt(Instant.now())
                    .build());

            // Warehouse 2 (Delhi DC)
            int whDelStock = 50 + (int)(Math.random() * 70);
            inventoryRepository.save(Inventory.builder()
                    .product(p)
                    .locationType("WAREHOUSE")
                    .locationId(whDel.getId())
                    .currentStock(whDelStock)
                    .reservedStock(0)
                    .reorderPoint(p.getReorderPoint())
                    .safetyStock(p.getSafetyStock())
                    .aisleBin("WH-B-" + (1 + (int)(Math.random() * 20)))
                    .lastRestockedAt(Instant.now())
                    .build());

            // Store 1 (Phoenix Mall Mumbai)
            int strStock = (int)(Math.random() * 30);
            int strReserved = (int)(Math.random() * 3);
            inventoryRepository.save(Inventory.builder()
                    .product(p)
                    .locationType("STORE")
                    .locationId(strMum.getId())
                    .currentStock(strStock)
                    .reservedStock(strReserved)
                    .reorderPoint(p.getReorderPoint() / 2)
                    .safetyStock(p.getSafetyStock())
                    .aisleBin("FL-M-" + (1 + (int)(Math.random() * 10)))
                    .lastRestockedAt(Instant.now())
                    .build());

            // Store 2 (Select Citywalk Delhi)
            int strDelStock = (int)(Math.random() * 25);
            inventoryRepository.save(Inventory.builder()
                    .product(p)
                    .locationType("STORE")
                    .locationId(strDel.getId())
                    .currentStock(strDelStock)
                    .reservedStock(0)
                    .reorderPoint(p.getReorderPoint() / 2)
                    .safetyStock(p.getSafetyStock())
                    .aisleBin("FL-D-" + (1 + (int)(Math.random() * 10)))
                    .lastRestockedAt(Instant.now())
                    .build());
        }

        // 9. Initial Stock Ledger Transactions
        for (int i = 0; i < 15; i++) {
            Product randomProd = products.get(i % products.size());
            stockTransactionRepository.save(StockTransaction.builder()
                    .transactionRef("TX-INIT-" + (1000 + i))
                    .product(randomProd)
                    .locationType("WAREHOUSE")
                    .locationId(whMum.getId())
                    .transactionType("STOCK_IN")
                    .quantity(50)
                    .balanceAfter(120)
                    .unitCost(randomProd.getPurchasePrice())
                    .referenceType("PURCHASE_ORDER")
                    .referenceId("PO-2026-00" + (1 + i))
                    .notes("Opening catalog inventory restock")
                    .performedByUserId(1L)
                    .build());
        }

        // 10. Sample Customers
        Customer c1 = customerRepository.save(Customer.builder().customerCode("CUST-001").firstName("Rahul").lastName("Dravid").email("rahul.d@gmail.com").phone("+91 98450 12345").shippingAddress("14 Koramangala 4th Block").city("Bengaluru").state("Karnataka").postalCode("560034").build());
        Customer c2 = customerRepository.save(Customer.builder().customerCode("CUST-002").firstName("Smriti").lastName("Mandhana").email("smriti.m@gmail.com").phone("+91 98220 54321").shippingAddress("88 Bandra Reclamation").city("Mumbai").state("Maharashtra").postalCode("400050").build());
        Customer c3 = customerRepository.save(Customer.builder().customerCode("CUST-003").firstName("Sunil").lastName("Gavaskar").email("sunil.g@crickettech.in").phone("+91 98200 99887").shippingAddress("21 Worli Sea Face").city("Mumbai").state("Maharashtra").postalCode("400018").customerType("WHOLESALE").build());

        // 11. Sample Orders
        CustomerOrder o1 = CustomerOrder.builder()
                .orderNumber("ORD-2026-00101")
                .customer(c1)
                .fulfillmentLocationType("WAREHOUSE")
                .fulfillmentLocationId(whMum.getId())
                .status("PROCESSING")
                .paymentStatus("PAID")
                .shippingCarrier("BlueDart Express")
                .trackingNumber("BD-EXP-994411")
                .subtotal(BigDecimal.valueOf(7498.00))
                .taxAmount(BigDecimal.valueOf(374.90))
                .shippingCost(BigDecimal.valueOf(150.00))
                .totalAmount(BigDecimal.valueOf(8022.90))
                .items(new ArrayList<>())
                .statusHistory(new ArrayList<>())
                .build();

        o1.getItems().add(OrderItem.builder().order(o1).product(products.get(0)).quantity(2).unitPrice(products.get(0).getSellingPrice()).allocatedQty(2).fulfilledQty(0).build());
        o1.getItems().add(OrderItem.builder().order(o1).product(products.get(8)).quantity(1).unitPrice(products.get(8).getSellingPrice()).allocatedQty(1).fulfilledQty(0).build());
        o1.getStatusHistory().add(OrderStatusHistory.builder().order(o1).previousStatus("PENDING").newStatus("CONFIRMED").comment("Payment verified").build());
        o1.getStatusHistory().add(OrderStatusHistory.builder().order(o1).previousStatus("CONFIRMED").newStatus("PROCESSING").comment("Sent to picking queue").build());
        orderRepository.save(o1);

        CustomerOrder o2 = CustomerOrder.builder()
                .orderNumber("ORD-2026-00102")
                .customer(c2)
                .fulfillmentLocationType("STORE")
                .fulfillmentLocationId(strMum.getId())
                .status("DELIVERED")
                .paymentStatus("PAID")
                .shippingCarrier("BlueDart Express")
                .trackingNumber("BD-EXP-994412")
                .subtotal(BigDecimal.valueOf(4999.00))
                .taxAmount(BigDecimal.valueOf(249.95))
                .shippingCost(BigDecimal.valueOf(150.00))
                .totalAmount(BigDecimal.valueOf(5398.95))
                .items(new ArrayList<>())
                .statusHistory(new ArrayList<>())
                .build();
        o2.getItems().add(OrderItem.builder().order(o2).product(products.get(4)).quantity(1).unitPrice(products.get(4).getSellingPrice()).allocatedQty(1).fulfilledQty(1).build());
        orderRepository.save(o2);

        // 12. Sample Purchase Orders
        PurchaseOrder po1 = PurchaseOrder.builder()
                .poNumber("PO-2026-00101")
                .supplier(supRay)
                .warehouse(whMum)
                .status("APPROVED")
                .orderDate(LocalDate.now().minusDays(5))
                .expectedDeliveryDate(LocalDate.now().plusDays(2))
                .totalAmount(BigDecimal.valueOf(125000.00))
                .createdBy(1L)
                .items(new ArrayList<>())
                .build();
        po1.getItems().add(PurchaseOrderItem.builder().purchaseOrder(po1).product(products.get(0)).orderedQty(100).receivedQty(0).unitPrice(BigDecimal.valueOf(1250.00)).build());
        purchaseOrderRepository.save(po1);

        // 13. Integration Configs
        integrationConfigRepository.save(IntegrationConfig.builder().systemName("SAP S/4HANA ERP Connector").systemType("ERP").enabled(true).apiEndpoint("https://mock-erp.xyzretail.internal/odata/v4/InventorySync").authType("BEARER_TOKEN").apiKeyMasked("sap_sec_****_8941").syncFrequencyMinutes(15).status("HEALTHY").build());
        integrationConfigRepository.save(IntegrationConfig.builder().systemName("QuickBooks Enterprise Accounting").systemType("ACCOUNTING").enabled(true).apiEndpoint("https://mock-qb.xyzretail.internal/v3/company/ledger").authType("OAUTH2").apiKeyMasked("qb_tok_****_3321").syncFrequencyMinutes(30).status("HEALTHY").build());
        integrationConfigRepository.save(IntegrationConfig.builder().systemName("BlueDart Express Logistics API").systemType("LOGISTICS").enabled(true).apiEndpoint("https://mock-logistics.xyzretail.internal/api/v2/shipment").authType("API_KEY").apiKeyMasked("bd_key_****_7765").syncFrequencyMinutes(5).status("HEALTHY").build());

        log.info("Enterprise database seeding complete! 8 roles, 8 users, 32 products, 3 warehouses, 5 stores, 5 suppliers, and live stock ledgers ready.");
    }
}
