export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  assignedLocationType?: 'WAREHOUSE' | 'STORE' | null;
  assignedLocationId?: number | null;
  assignedLocationName?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  code: string;
  description?: string;
  active: boolean;
  productCount?: number;
}

export interface Product {
  id: number;
  sku: string;
  barcode: string;
  name: string;
  description?: string;
  categoryId: number;
  categoryName?: string;
  categoryCode?: string;
  brand: string;
  purchasePrice: number;
  sellingPrice: number;
  imageUrl?: string;
  minStockLevel: number;
  reorderPoint: number;
  safetyStock: number;
  status: 'ACTIVE' | 'DISCONTINUED' | 'DRAFT';
  weightKg?: number;
  dimensionsCm?: string;
  totalStock?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  capacitySqft: number;
  managerName?: string;
  contactEmail?: string;
  contactPhone?: string;
  active: boolean;
  totalSkus?: number;
  totalUnits?: number;
}

export interface Store {
  id: number;
  code: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  storeType: 'FLAGSHIP' | 'OUTLET' | 'STANDARD' | 'EXPRESS';
  managerName?: string;
  contactEmail?: string;
  contactPhone?: string;
  active: boolean;
  totalSkus?: number;
  totalUnits?: number;
}

export interface InventoryItem {
  id: number;
  productId: number;
  sku: string;
  productName: string;
  barcode: string;
  categoryName: string;
  sellingPrice: number;
  purchasePrice: number;
  locationType: 'WAREHOUSE' | 'STORE';
  locationId: number;
  locationName: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderPoint: number;
  safetyStock: number;
  aisle?: string;
  shelf?: string;
  bin?: string;
  lastRestockedAt?: string;
  lowStock?: boolean;
}

export interface StockTransaction {
  id: number;
  transactionRef: string;
  productId: number;
  productSku: string;
  productName: string;
  locationType: 'WAREHOUSE' | 'STORE';
  locationId: number;
  transactionType: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT_ADD' | 'ADJUSTMENT_SUBTRACT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ORDER_FULFILL' | 'RETURN_RESTOCK';
  quantity: number;
  balanceAfter: number;
  unitCost: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  performedByUserId?: number;
  performedByUsername?: string;
  createdAt: string;
}

export interface StockTransfer {
  id: number;
  transferNumber: string;
  sourceLocationType: 'WAREHOUSE' | 'STORE';
  sourceLocationId: number;
  sourceLocationName?: string;
  destLocationType: 'WAREHOUSE' | 'STORE';
  destLocationId: number;
  destLocationName?: string;
  status: 'DRAFT' | 'REQUESTED' | 'APPROVED' | 'IN_TRANSIT' | 'RECEIVED' | 'REJECTED' | 'CANCELLED';
  carrier?: string;
  trackingNumber?: string;
  notes?: string;
  requestedBy?: number;
  approvedBy?: number;
  createdAt: string;
  receivedDate?: string;
  items: StockTransferItem[];
}

export interface StockTransferItem {
  id?: number;
  productId: number;
  productSku?: string;
  productName?: string;
  requestedQty: number;
  shippedQty?: number;
  receivedQty?: number;
  unitCost?: number;
}

export interface Supplier {
  id: number;
  code: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  taxNumber?: string;
  paymentTerms: string;
  leadTimeDays: number;
  performanceScore?: number;
  active: boolean;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierId: number;
  supplierName?: string;
  supplierCode?: string;
  destinationLocationType: 'WAREHOUSE' | 'STORE';
  destinationLocationId: number;
  destinationLocationName?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  notes?: string;
  expectedDeliveryDate?: string;
  createdAt: string;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id?: number;
  productId: number;
  productSku?: string;
  productName?: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
}

export interface CustomerOrder {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  fulfillmentLocationType: 'WAREHOUSE' | 'STORE';
  fulfillmentLocationId: number;
  fulfillmentLocationName?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PICKED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  shippingCarrier?: string;
  trackingNumber?: string;
  orderDate: string;
  shippedDate?: string;
  deliveredDate?: string;
  items: CustomerOrderItem[];
  statusHistory?: OrderStatusHistory[];
}

export interface CustomerOrderItem {
  id?: number;
  productId: number;
  productSku?: string;
  productName?: string;
  quantity: number;
  allocatedQty: number;
  fulfilledQty: number;
  unitPrice: number;
}

export interface OrderStatusHistory {
  id?: number;
  previousStatus?: string;
  newStatus: string;
  comment?: string;
  changedBy?: number;
  createdAt?: string;
}

export interface ReturnOrder {
  id: number;
  rmaNumber: string;
  orderId: number;
  orderNumber?: string;
  customerId: number;
  customerName?: string;
  status: 'REQUESTED' | 'APPROVED' | 'RECEIVED' | 'INSPECTED' | 'RESTOCKED' | 'REFUNDED' | 'REJECTED';
  reason: string;
  refundAmount: number;
  inspectionNotes?: string;
  disposition?: 'RESTOCK' | 'SCRAP' | 'REFURBISH' | 'RETURN_TO_VENDOR';
  restockLocationType?: 'WAREHOUSE' | 'STORE';
  restockLocationId?: number;
  restockLocationName?: string;
  createdAt: string;
  items: ReturnOrderItem[];
}

export interface ReturnOrderItem {
  id?: number;
  productId: number;
  productSku?: string;
  productName?: string;
  quantity: number;
  reason?: string;
  condition?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'ORDER_NEW' | 'TRANSFER_STATUS' | 'PO_STATUS' | 'SYSTEM';
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  read: boolean;
  entityType?: string;
  entityId?: string;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  userId?: number;
  username: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  details?: string;
  createdAt: string;
}

export interface IntegrationConfig {
  id: number;
  integrationName: string;
  systemType: 'ERP' | 'ACCOUNTING' | 'LOGISTICS' | 'PAYMENT';
  endpointUrl: string;
  authType: 'API_KEY' | 'OAUTH2' | 'BASIC';
  active: boolean;
  syncFrequencyMinutes: number;
  lastSyncAt?: string;
  lastSyncStatus?: 'SUCCESS' | 'ERROR' | 'PENDING';
}

export interface DashboardAnalytics {
  totalSkus: number;
  totalInventoryUnits: number;
  totalValuation: number;
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
  openOrdersCount: number;
  pendingTransfersCount: number;
  pendingPurchaseOrdersCount: number;
  monthlyRevenue: number;
  stockTurnoverRatio: number;
  categoryShare: { name: string; count: number; valuation: number }[];
  monthlyTrend: { month: string; stockIn: number; stockOut: number; sales: number }[];
  warehouseValuation: { warehouseName: string; totalUnits: number; valuation: number }[];
  topSellingProducts: { sku: string; name: string; unitsSold: number; revenue: number }[];
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}
