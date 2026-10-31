import {
  Category,
  Product,
  Warehouse,
  Store,
  InventoryItem,
  StockTransaction,
  StockTransfer,
  Supplier,
  PurchaseOrder,
  CustomerOrder,
  ReturnOrder,
  DashboardAnalytics,
  IntegrationConfig,
  Notification,
  User,
} from '../types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Apparel & Fashion', code: 'APP', description: 'Shirts, denim, jackets, activewear, formal attire', active: true, productCount: 4 },
  { id: 2, name: 'Electronics & Gadgets', code: 'ELEC', description: 'Audio, computing accessories, smart peripherals, cables', active: true, productCount: 4 },
  { id: 3, name: 'Home & Kitchen', code: 'HOME', description: 'Cookware, appliances, bedding, storage, dining', active: true, productCount: 4 },
  { id: 4, name: 'Footwear & Athletic', code: 'FOOT', description: 'Sneakers, formal shoes, sandals, running footwear', active: true, productCount: 4 },
  { id: 5, name: 'Beauty & Personal Care', code: 'BEAUTY', description: 'Skincare, fragrances, haircare, grooming essentials', active: true, productCount: 4 },
  { id: 6, name: 'Outdoor & Sports', code: 'SPORT', description: 'Fitness gear, camping, hydration, sports equipment', active: true, productCount: 4 },
  { id: 7, name: 'Books & Stationery', code: 'BOOK', description: 'Notebooks, desk accessories, journals, writing tools', active: true, productCount: 4 },
  { id: 8, name: 'Toys & Hobbies', code: 'TOY', description: 'Educational toys, puzzles, collectible models', active: true, productCount: 4 },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, sku: 'APP-SHIRT-001', barcode: '8901234567890', name: 'Oxford Cotton Shirt', categoryId: 1, categoryName: 'Apparel & Fashion', categoryCode: 'APP', brand: 'Arrow Tailors', purchasePrice: 18.00, sellingPrice: 35.00, minStockLevel: 10, reorderPoint: 25, safetyStock: 5, status: 'ACTIVE', totalStock: 145 },
  { id: 2, sku: 'APP-DENIM-001', barcode: '8901234567891', name: 'Slim Fit Denim Jeans', categoryId: 1, categoryName: 'Apparel & Fashion', categoryCode: 'APP', brand: 'Leviathan Denim', purchasePrice: 28.00, sellingPrice: 59.99, minStockLevel: 15, reorderPoint: 30, safetyStock: 10, status: 'ACTIVE', totalStock: 80 },
  { id: 3, sku: 'APP-JKT-001', barcode: '8901234567892', name: 'All-Weather Windbreaker', categoryId: 1, categoryName: 'Apparel & Fashion', categoryCode: 'APP', brand: 'NorthPeak', purchasePrice: 42.00, sellingPrice: 89.00, minStockLevel: 8, reorderPoint: 20, safetyStock: 5, status: 'ACTIVE', totalStock: 65 },
  { id: 4, sku: 'APP-TEE-001', barcode: '8901234567893', name: 'Classic Crewneck T-Shirt', categoryId: 1, categoryName: 'Apparel & Fashion', categoryCode: 'APP', brand: 'BasicThreads', purchasePrice: 6.50, sellingPrice: 16.00, minStockLevel: 25, reorderPoint: 50, safetyStock: 15, status: 'ACTIVE', totalStock: 220 },
  { id: 5, sku: 'ELEC-DEV-001', barcode: '8901234567894', name: 'Premium Wireless Mouse', categoryId: 2, categoryName: 'Electronics & Gadgets', categoryCode: 'ELEC', brand: 'Logitech', purchasePrice: 25.00, sellingPrice: 49.99, minStockLevel: 10, reorderPoint: 25, safetyStock: 5, status: 'ACTIVE', totalStock: 12 },
  { id: 6, sku: 'ELEC-HEAD-001', barcode: '8901234567895', name: 'ANC Noise-Cancelling Headphones', categoryId: 2, categoryName: 'Electronics & Gadgets', categoryCode: 'ELEC', brand: 'SoundWave', purchasePrice: 85.00, sellingPrice: 179.00, minStockLevel: 5, reorderPoint: 15, safetyStock: 5, status: 'ACTIVE', totalStock: 34 },
  { id: 7, sku: 'ELEC-HUB-001', barcode: '8901234567896', name: 'USB-C 7-in-1 Multiport Hub', categoryId: 2, categoryName: 'Electronics & Gadgets', categoryCode: 'ELEC', brand: 'AnkerTech', purchasePrice: 22.00, sellingPrice: 44.99, minStockLevel: 12, reorderPoint: 30, safetyStock: 8, status: 'ACTIVE', totalStock: 58 },
  { id: 8, sku: 'ELEC-SPK-001', barcode: '8901234567897', name: 'Waterproof Bluetooth Speaker', categoryId: 2, categoryName: 'Electronics & Gadgets', categoryCode: 'ELEC', brand: 'JBL Audio', purchasePrice: 38.00, sellingPrice: 79.99, minStockLevel: 8, reorderPoint: 20, safetyStock: 6, status: 'ACTIVE', totalStock: 42 },
  { id: 9, sku: 'HOME-BLND-001', barcode: '8901234567898', name: 'High-Speed Professional Blender', categoryId: 3, categoryName: 'Home & Kitchen', categoryCode: 'HOME', brand: 'Ninja Kitchen', purchasePrice: 65.00, sellingPrice: 129.99, minStockLevel: 5, reorderPoint: 12, safetyStock: 4, status: 'ACTIVE', totalStock: 28 },
  { id: 10, sku: 'HOME-COOK-001', barcode: '8901234567899', name: 'Non-Stick Ceramic Cookware Set', categoryId: 3, categoryName: 'Home & Kitchen', categoryCode: 'HOME', brand: 'GreenPan', purchasePrice: 75.00, sellingPrice: 149.00, minStockLevel: 6, reorderPoint: 15, safetyStock: 5, status: 'ACTIVE', totalStock: 19 },
  { id: 11, sku: 'FOOT-SNEAK-01', barcode: '8901234567900', name: 'Air Cushion Performance Sneakers', categoryId: 4, categoryName: 'Footwear & Athletic', categoryCode: 'FOOT', brand: 'Nike Pro', purchasePrice: 55.00, sellingPrice: 119.99, minStockLevel: 8, reorderPoint: 20, safetyStock: 8, status: 'ACTIVE', totalStock: 8 },
  { id: 12, sku: 'BEAUTY-SRM-01', barcode: '8901234567901', name: 'Hydrating Hyaluronic Acid Serum', categoryId: 5, categoryName: 'Beauty & Personal Care', categoryCode: 'BEAUTY', brand: 'GlowLabs', purchasePrice: 12.00, sellingPrice: 28.00, minStockLevel: 20, reorderPoint: 40, safetyStock: 10, status: 'ACTIVE', totalStock: 110 },
];

export const MOCK_WAREHOUSES: Warehouse[] = [
  { id: 1, code: 'WH-CENTRAL', name: 'Central Distribution Hub', addressLine1: '400 Logistics Blvd', city: 'Dallas', state: 'TX', postalCode: '75201', country: 'USA', capacitySqft: 250000, managerName: 'Marcus Vance', contactEmail: 'marcus.vance@xyzretail.com', contactPhone: '+1-214-555-0101', active: true, totalSkus: 32, totalUnits: 4200 },
  { id: 2, code: 'WH-WEST', name: 'West Coast Regional Center', addressLine1: '880 Harbor Pkwy', city: 'Ontario', state: 'CA', postalCode: '91761', country: 'USA', capacitySqft: 180000, managerName: 'Sarah Lin', contactEmail: 'sarah.lin@xyzretail.com', contactPhone: '+1-909-555-0122', active: true, totalSkus: 28, totalUnits: 1500 },
  { id: 3, code: 'WH-SOUTH', name: 'Southeast Gateway Facility', addressLine1: '120 Piedmont Ave', city: 'Atlanta', state: 'GA', postalCode: '30303', country: 'USA', capacitySqft: 140000, managerName: 'Devon Scott', contactEmail: 'devon.scott@xyzretail.com', contactPhone: '+1-404-555-0144', active: true, totalSkus: 24, totalUnits: 902 },
];

export const MOCK_STORES: Store[] = [
  { id: 1, code: 'STR-NYC-01', name: 'Fifth Avenue Flagship Store', addressLine1: '650 5th Ave', city: 'New York', state: 'NY', postalCode: '10019', storeType: 'FLAGSHIP', managerName: 'Elena Rodriguez', contactEmail: 'elena.rodriguez@xyzretail.com', contactPhone: '+1-212-555-0180', active: true, totalSkus: 26, totalUnits: 380 },
  { id: 2, code: 'STR-CHI-01', name: 'Michigan Avenue Retail Store', addressLine1: '800 N Michigan Ave', city: 'Chicago', state: 'IL', postalCode: '60611', storeType: 'STANDARD', managerName: 'Noah Bell', contactEmail: 'noah.bell@xyzretail.com', contactPhone: '+1-312-555-0199', active: true, totalSkus: 22, totalUnits: 250 },
  { id: 3, code: 'STR-MIA-01', name: 'South Beach Boutique Store', addressLine1: '1020 Ocean Dr', city: 'Miami', state: 'FL', postalCode: '33139', storeType: 'OUTLET', managerName: 'Camila Reyes', contactEmail: 'camila.reyes@xyzretail.com', contactPhone: '+1-305-555-0177', active: true, totalSkus: 18, totalUnits: 190 },
  { id: 4, code: 'STR-SEA-01', name: 'Downtown Seattle Store', addressLine1: '400 Pine St', city: 'Seattle', state: 'WA', postalCode: '98101', storeType: 'STANDARD', managerName: 'Liam Chen', contactEmail: 'liam.chen@xyzretail.com', contactPhone: '+1-206-555-0166', active: true, totalSkus: 20, totalUnits: 210 },
  { id: 5, code: 'STR-AUS-01', name: 'Austin Domain Express Hub', addressLine1: '11410 Century Oaks Terrace', city: 'Austin', state: 'TX', postalCode: '78758', storeType: 'EXPRESS', managerName: 'Chloe Bennett', contactEmail: 'chloe.bennett@xyzretail.com', contactPhone: '+1-512-555-0133', active: true, totalSkus: 15, totalUnits: 140 },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 1, productId: 1, sku: 'APP-SHIRT-001', productName: 'Oxford Cotton Shirt', barcode: '8901234567890', categoryName: 'Apparel & Fashion', sellingPrice: 35.00, purchasePrice: 18.00, locationType: 'WAREHOUSE', locationId: 1, locationName: 'Central Distribution Hub', currentStock: 70, reservedStock: 10, availableStock: 60, reorderPoint: 25, safetyStock: 5 },
  { id: 2, productId: 1, sku: 'APP-SHIRT-001', productName: 'Oxford Cotton Shirt', barcode: '8901234567890', categoryName: 'Apparel & Fashion', sellingPrice: 35.00, purchasePrice: 18.00, locationType: 'STORE', locationId: 1, locationName: 'Fifth Avenue Flagship Store', currentStock: 4, reservedStock: 0, availableStock: 4, reorderPoint: 15, safetyStock: 5, lowStock: true },
  { id: 3, productId: 5, sku: 'ELEC-DEV-001', productName: 'Premium Wireless Mouse', barcode: '8901234567894', categoryName: 'Electronics & Gadgets', sellingPrice: 49.99, purchasePrice: 25.00, locationType: 'WAREHOUSE', locationId: 1, locationName: 'Central Distribution Hub', currentStock: 12, reservedStock: 0, availableStock: 12, reorderPoint: 25, safetyStock: 10, lowStock: true },
  { id: 4, productId: 2, sku: 'APP-DENIM-001', productName: 'Slim Fit Denim Jeans', barcode: '8901234567891', categoryName: 'Apparel & Fashion', sellingPrice: 59.99, purchasePrice: 28.00, locationType: 'WAREHOUSE', locationId: 1, locationName: 'Central Distribution Hub', currentStock: 50, reservedStock: 8, availableStock: 42, reorderPoint: 30, safetyStock: 10 },
  { id: 5, productId: 11, sku: 'FOOT-SNEAK-01', productName: 'Air Cushion Performance Sneakers', barcode: '8901234567900', categoryName: 'Footwear & Athletic', sellingPrice: 119.99, purchasePrice: 55.00, locationType: 'WAREHOUSE', locationId: 2, locationName: 'West Coast Regional Center', currentStock: 8, reservedStock: 0, availableStock: 8, reorderPoint: 20, safetyStock: 8, lowStock: true },
];

export const MOCK_DASHBOARD: DashboardAnalytics = {
  totalSkus: 32,
  totalInventoryUnits: 6602,
  totalValuation: 247850.00,
  lowStockItemsCount: 3,
  outOfStockItemsCount: 0,
  openOrdersCount: 6,
  pendingTransfersCount: 2,
  pendingPurchaseOrdersCount: 3,
  monthlyRevenue: 142850.00,
  stockTurnoverRatio: 4.2,
  categoryShare: [
    { name: 'Apparel & Fashion', count: 8, valuation: 72300 },
    { name: 'Electronics & Audio', count: 6, valuation: 68200 },
    { name: 'Home & Kitchen', count: 6, valuation: 49800 },
    { name: 'Footwear & Athletic', count: 4, valuation: 44200 },
    { name: 'Beauty & Personal Care', count: 4, valuation: 26460 },
    { name: 'Outdoor & Sports', count: 4, valuation: 27900 },
  ],
  monthlyTrend: [
    { month: 'May', stockIn: 1200, stockOut: 980, sales: 44100 },
    { month: 'Jun', stockIn: 1450, stockOut: 1120, sales: 50400 },
    { month: 'Jul', stockIn: 1100, stockOut: 1300, sales: 58500 },
    { month: 'Aug', stockIn: 1680, stockOut: 1420, sales: 63900 },
    { month: 'Sep', stockIn: 1890, stockOut: 1650, sales: 74250 },
    { month: 'Oct', stockIn: 2100, stockOut: 1950, sales: 87750 },
  ],
  warehouseValuation: [
    { warehouseName: 'Central Distribution Hub', totalUnits: 4200, valuation: 158000 },
    { warehouseName: 'West Coast Regional Center', totalUnits: 1500, valuation: 59000 },
    { warehouseName: 'Southeast Gateway Facility', totalUnits: 902, valuation: 30850 },
  ],
  topSellingProducts: [
    { sku: 'APP-TEE-001', name: 'Classic Crewneck T-Shirt', unitsSold: 420, revenue: 6720 },
    { sku: 'APP-SHIRT-001', name: 'Oxford Cotton Shirt', unitsSold: 310, revenue: 10850 },
    { sku: 'ELEC-DEV-001', name: 'Premium Wireless Mouse', unitsSold: 280, revenue: 13997 },
    { sku: 'APP-DENIM-001', name: 'Slim Fit Denim Jeans', unitsSold: 195, revenue: 11698 },
    { sku: 'FOOT-SNEAK-01', name: 'Air Cushion Running Shoes', unitsSold: 160, revenue: 19198 },
  ],
};

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 1, code: 'VEND-001', name: 'Apex Apparel Manufacturers', email: 'orders@apextextiles.com', phone: '+1-212-555-0199', paymentTerms: 'NET_30', leadTimeDays: 7, performanceScore: 98.5, active: true },
  { id: 2, code: 'VEND-002', name: 'TechnoCore Global Electronics', email: 'supply@technocore.com', phone: '+1-408-555-0188', paymentTerms: 'NET_15', leadTimeDays: 12, performanceScore: 95.2, active: true },
  { id: 3, code: 'VEND-003', name: 'Nordic Home Furnishings Ltd', email: 'sales@nordichome.com', phone: '+1-312-555-0177', paymentTerms: 'NET_30', leadTimeDays: 14, performanceScore: 97.0, active: true },
  { id: 4, code: 'VEND-004', name: 'Starlight Footwear Corporation', email: 'b2b@starlightshoes.com', phone: '+1-503-555-0166', paymentTerms: 'NET_45', leadTimeDays: 10, performanceScore: 99.1, active: true },
  { id: 5, code: 'VEND-005', name: 'PureBotanicals Cosmetics Co', email: 'accounts@purebotanicals.com', phone: '+1-800-555-0155', paymentTerms: 'NET_30', leadTimeDays: 5, performanceScore: 96.8, active: true },
];

export const MOCK_TRANSFERS: StockTransfer[] = [
  {
    id: 1,
    transferNumber: 'TRF-2026-001',
    sourceLocationType: 'WAREHOUSE',
    sourceLocationId: 1,
    sourceLocationName: 'Central Distribution Hub',
    destLocationType: 'STORE',
    destLocationId: 1,
    destLocationName: 'Fifth Avenue Flagship Store',
    status: 'IN_TRANSIT',
    carrier: 'BlueDart Logistics',
    trackingNumber: 'BD-EXP-889123',
    createdAt: new Date().toISOString(),
    items: [
      { productId: 1, productSku: 'APP-SHIRT-001', productName: 'Oxford Cotton Shirt', requestedQty: 25 },
      { productId: 2, productSku: 'APP-DENIM-001', productName: 'Slim Fit Denim Jeans', requestedQty: 15 },
    ],
  },
  {
    id: 2,
    transferNumber: 'TRF-2026-002',
    sourceLocationType: 'WAREHOUSE',
    sourceLocationId: 1,
    sourceLocationName: 'Central Distribution Hub',
    destLocationType: 'STORE',
    destLocationId: 2,
    destLocationName: 'Michigan Avenue Retail Store',
    status: 'APPROVED',
    carrier: 'BlueDart Logistics',
    trackingNumber: 'BD-EXP-889124',
    createdAt: new Date().toISOString(),
    items: [
      { productId: 5, productSku: 'ELEC-DEV-001', productName: 'Premium Wireless Mouse', requestedQty: 20 },
    ],
  },
];

export const MOCK_ORDERS: CustomerOrder[] = [
  {
    id: 1,
    orderNumber: 'ORD-2026-001',
    customerId: 1,
    customerName: 'Alice Smith',
    customerEmail: 'alice@example.com',
    fulfillmentLocationType: 'WAREHOUSE',
    fulfillmentLocationId: 1,
    fulfillmentLocationName: 'Central Distribution Hub',
    status: 'PENDING',
    paymentStatus: 'PAID',
    subtotal: 129.98,
    taxAmount: 6.50,
    shippingCost: 15.00,
    totalAmount: 151.48,
    shippingCarrier: 'BlueDart Express',
    trackingNumber: 'BD-EXP-489102',
    orderDate: new Date().toISOString(),
    items: [
      { productId: 1, productSku: 'APP-SHIRT-001', productName: 'Oxford Cotton Shirt', quantity: 2, allocatedQty: 2, fulfilledQty: 0, unitPrice: 35.00 },
      { productId: 2, productSku: 'APP-DENIM-001', productName: 'Slim Fit Denim Jeans', quantity: 1, allocatedQty: 1, fulfilledQty: 0, unitPrice: 59.98 },
    ],
  },
  {
    id: 2,
    orderNumber: 'ORD-2026-002',
    customerId: 2,
    customerName: 'Robert Johnson',
    customerEmail: 'robert@example.com',
    fulfillmentLocationType: 'WAREHOUSE',
    fulfillmentLocationId: 1,
    fulfillmentLocationName: 'Central Distribution Hub',
    status: 'SHIPPED',
    paymentStatus: 'PAID',
    subtotal: 99.98,
    taxAmount: 5.00,
    shippingCost: 15.00,
    totalAmount: 119.98,
    shippingCarrier: 'BlueDart Express',
    trackingNumber: 'BD-EXP-489103',
    orderDate: new Date(Date.now() - 86400000).toISOString(),
    items: [
      { productId: 5, productSku: 'ELEC-DEV-001', productName: 'Premium Wireless Mouse', quantity: 2, allocatedQty: 2, fulfilledQty: 2, unitPrice: 49.99 },
    ],
  },
];

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 1,
    poNumber: 'PO-2026-001',
    supplierId: 1,
    supplierName: 'Apex Apparel Manufacturers',
    supplierCode: 'VEND-001',
    destinationLocationType: 'WAREHOUSE',
    destinationLocationId: 1,
    destinationLocationName: 'Central Distribution Hub',
    status: 'APPROVED',
    subtotal: 5400.00,
    taxAmount: 270.00,
    shippingCost: 250.00,
    totalAmount: 5920.00,
    expectedDeliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    items: [
      { productId: 1, productSku: 'APP-SHIRT-001', productName: 'Oxford Cotton Shirt', quantityOrdered: 300, quantityReceived: 0, unitCost: 18.00, totalCost: 5400.00 },
    ],
  },
  {
    id: 2,
    poNumber: 'PO-2026-002',
    supplierId: 2,
    supplierName: 'TechnoCore Global Electronics',
    supplierCode: 'VEND-002',
    destinationLocationType: 'WAREHOUSE',
    destinationLocationId: 1,
    destinationLocationName: 'Central Distribution Hub',
    status: 'SUBMITTED',
    subtotal: 3750.00,
    taxAmount: 187.50,
    shippingCost: 120.00,
    totalAmount: 4057.50,
    expectedDeliveryDate: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    items: [
      { productId: 5, productSku: 'ELEC-DEV-001', productName: 'Premium Wireless Mouse', quantityOrdered: 150, quantityReceived: 0, unitCost: 25.00, totalCost: 3750.00 },
    ],
  },
];

export const MOCK_RETURNS: ReturnOrder[] = [
  {
    id: 1,
    rmaNumber: 'RMA-2026-001',
    orderId: 1,
    orderNumber: 'ORD-2026-001',
    customerId: 1,
    customerName: 'Alice Smith',
    status: 'REQUESTED',
    reason: 'Incorrect size sent by warehouse',
    refundAmount: 35.00,
    createdAt: new Date().toISOString(),
    items: [
      { productId: 1, productSku: 'APP-SHIRT-001', productName: 'Oxford Cotton Shirt', quantity: 1, condition: 'UNOPENED' },
    ],
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: 'Low Stock Alert: Air Cushion Sneakers',
    message: 'Current stock (8 units) in West Coast Center is below safety threshold (20 units).',
    type: 'LOW_STOCK',
    severity: 'WARNING',
    read: false,
    entityType: 'PRODUCT',
    entityId: '11',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'New Customer Order: ORD-2026-001',
    message: 'Order placed by Alice Smith totaling $151.48 requires fulfillment allocation.',
    type: 'ORDER_NEW',
    severity: 'INFO',
    read: false,
    entityType: 'ORDER',
    entityId: '1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 3,
    title: 'Stock Transfer Dispatched: TRF-2026-001',
    message: 'Carrier BlueDart picked up 40 items for 5th Avenue Flagship Store.',
    type: 'TRANSFER_STATUS',
    severity: 'INFO',
    read: true,
    entityType: 'TRANSFER',
    entityId: '1',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const MOCK_AUDIT_LOGS: any[] = [
  {
    id: 1,
    userId: 1,
    username: 'admin',
    action: 'LOGIN',
    resourceType: 'AUTHENTICATION',
    resourceId: 'admin',
    ipAddress: '127.0.0.1',
    details: 'User logged in successfully',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    userId: 2,
    username: 'wh_manager',
    action: 'TRANSFER_DISPATCH',
    resourceType: 'TRANSFER',
    resourceId: 'TRF-2026-001',
    ipAddress: '192.168.1.10',
    details: 'Dispatched 40 items to Fifth Avenue Flagship',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const MOCK_INTEGRATIONS: IntegrationConfig[] = [
  {
    id: 1,
    integrationName: 'SAP S/4HANA ERP Connector',
    systemType: 'ERP',
    endpointUrl: 'https://erp.xyzretail.internal/odata/v4/inventory',
    authType: 'OAUTH2',
    active: true,
    syncFrequencyMinutes: 15,
    lastSyncAt: new Date(Date.now() - 600000).toISOString(),
    lastSyncStatus: 'SUCCESS',
  },
  {
    id: 2,
    integrationName: 'BlueDart Logistics Gateway',
    systemType: 'LOGISTICS',
    endpointUrl: 'https://api.bluedart.com/v2/shipments',
    authType: 'API_KEY',
    active: true,
    syncFrequencyMinutes: 30,
    lastSyncAt: new Date(Date.now() - 1200000).toISOString(),
    lastSyncStatus: 'SUCCESS',
  },
  {
    id: 3,
    integrationName: 'Stripe Corporate Billing',
    systemType: 'PAYMENT',
    endpointUrl: 'https://api.stripe.com/v1',
    authType: 'API_KEY',
    active: true,
    syncFrequencyMinutes: 5,
    lastSyncAt: new Date(Date.now() - 180000).toISOString(),
    lastSyncStatus: 'SUCCESS',
  },
];

export const MOCK_USERS_LIST: User[] = [
  { id: 1, username: 'admin', email: 'admin@xyzretail.com', firstName: 'Alexander', lastName: 'Pierce', role: 'ROLE_ADMIN', status: 'ACTIVE' },
  { id: 2, username: 'wh_manager', email: 'marcus.vance@xyzretail.com', firstName: 'Marcus', lastName: 'Vance', role: 'ROLE_WAREHOUSE_MANAGER', status: 'ACTIVE', assignedLocationType: 'WAREHOUSE', assignedLocationId: 1, assignedLocationName: 'Central Distribution Hub' },
  { id: 3, username: 'store_mgr', email: 'elena.rodriguez@xyzretail.com', firstName: 'Elena', lastName: 'Rodriguez', role: 'ROLE_STORE_MANAGER', status: 'ACTIVE', assignedLocationType: 'STORE', assignedLocationId: 1, assignedLocationName: 'Fifth Ave Flagship Store' },
  { id: 4, username: 'proc_mgr', email: 'david.chen@xyzretail.com', firstName: 'David', lastName: 'Chen', role: 'ROLE_PROCUREMENT_MANAGER', status: 'ACTIVE' },
  { id: 5, username: 'inv_auditor', email: 'sarah.jenkins@xyzretail.com', firstName: 'Sarah', lastName: 'Jenkins', role: 'ROLE_INVENTORY_AUDITOR', status: 'ACTIVE' },
  { id: 6, username: 'logistics', email: 'rachel.patel@xyzretail.com', firstName: 'Rachel', lastName: 'Patel', role: 'ROLE_LOGISTICS_OFFICER', status: 'ACTIVE' },
  { id: 7, username: 'cashier', email: 'carlos.mendez@xyzretail.com', firstName: 'Carlos', lastName: 'Mendez', role: 'ROLE_CASHIER', status: 'ACTIVE' },
  { id: 8, username: 'analyst', email: 'sophia.taylor@xyzretail.com', firstName: 'Sophia', lastName: 'Taylor', role: 'ROLE_BUSINESS_ANALYST', status: 'ACTIVE' },
];

