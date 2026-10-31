import axios from 'axios';
import {
  AuthResponse,
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
  Notification,
  AuditLog,
  IntegrationConfig,
  DashboardAnalytics,
  PagedResponse,
  ApiResponse,
  User,
} from '../types';
import {
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  MOCK_WAREHOUSES,
  MOCK_STORES,
  MOCK_INVENTORY,
  MOCK_DASHBOARD,
  MOCK_SUPPLIERS,
  MOCK_TRANSFERS,
  MOCK_ORDERS,
  MOCK_PURCHASE_ORDERS,
  MOCK_RETURNS,
  MOCK_NOTIFICATIONS,
  MOCK_AUDIT_LOGS,
  MOCK_INTEGRATIONS,
  MOCK_USERS_LIST,
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper for Mock Fallback Data during Preview/Demo Mode
const getMockResponse = (url: string = ''): any => {
  const cleanUrl = url.split('?')[0];

  if (cleanUrl.includes('/auth/me')) {
    const saved = localStorage.getItem('rims_user');
    return saved ? JSON.parse(saved) : MOCK_USERS_LIST[0];
  }
  if (cleanUrl.includes('/dashboard')) {
    return MOCK_DASHBOARD;
  }
  if (cleanUrl.includes('/products')) {
    return { content: MOCK_PRODUCTS, page: 0, size: 20, totalElements: MOCK_PRODUCTS.length, totalPages: 1, last: true };
  }
  if (cleanUrl.includes('/categories')) {
    return MOCK_CATEGORIES;
  }
  if (cleanUrl.includes('/warehouses')) {
    return MOCK_WAREHOUSES;
  }
  if (cleanUrl.includes('/stores')) {
    return MOCK_STORES;
  }
  if (cleanUrl.includes('/inventory')) {
    return { content: MOCK_INVENTORY, page: 0, size: 20, totalElements: MOCK_INVENTORY.length, totalPages: 1, last: true };
  }
  if (cleanUrl.includes('/stock-transactions')) {
    return { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, last: true };
  }
  if (cleanUrl.includes('/transfers')) {
    return { content: MOCK_TRANSFERS, page: 0, size: 20, totalElements: MOCK_TRANSFERS.length, totalPages: 1, last: true };
  }
  if (cleanUrl.includes('/suppliers')) {
    return MOCK_SUPPLIERS;
  }
  if (cleanUrl.includes('/purchase-orders')) {
    return { content: MOCK_PURCHASE_ORDERS, page: 0, size: 20, totalElements: MOCK_PURCHASE_ORDERS.length, totalPages: 1, last: true };
  }
  if (cleanUrl.includes('/orders')) {
    return { content: MOCK_ORDERS, page: 0, size: 20, totalElements: MOCK_ORDERS.length, totalPages: 1, last: true };
  }
  if (cleanUrl.includes('/returns')) {
    return { content: MOCK_RETURNS, page: 0, size: 20, totalElements: MOCK_RETURNS.length, totalPages: 1, last: true };
  }
  if (cleanUrl.includes('/notifications')) {
    return MOCK_NOTIFICATIONS;
  }
  if (cleanUrl.includes('/audit-logs')) {
    return { content: MOCK_AUDIT_LOGS, page: 0, size: 20, totalElements: MOCK_AUDIT_LOGS.length, totalPages: 1, last: true };
  }
  if (cleanUrl.includes('/integrations')) {
    return MOCK_INTEGRATIONS;
  }
  if (cleanUrl.includes('/users')) {
    return MOCK_USERS_LIST;
  }
  if (cleanUrl.includes('/reports')) {
    return {
      title: 'Retail Inventory Report',
      generatedAt: new Date().toISOString(),
      recordCount: 12,
      summary: { totalStock: 6602, totalValuation: 247850 },
      rows: MOCK_INVENTORY.map((item, idx) => ({
        id: idx + 1,
        sku: item.sku,
        name: item.productName,
        category: item.categoryName,
        location: item.locationName,
        currentStock: item.currentStock,
        valuation: item.currentStock * item.purchasePrice,
        status: item.currentStock < item.reorderPoint ? 'LOW_STOCK' : 'HEALTHY',
      })),
    };
  }
  return { success: true };
};

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rims_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global 401 & Demo/Offline Fallback
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isDemoToken = localStorage.getItem('rims_jwt_token')?.startsWith('demo-jwt-token-');
    const isNetworkOr404 =
      !error.response ||
      error.response.status === 404 ||
      error.response.status === 502 ||
      error.response.status === 503 ||
      error.code === 'ERR_NETWORK';

    if (error.response && error.response.status === 401 && !isDemoToken) {
      localStorage.removeItem('rims_jwt_token');
      localStorage.removeItem('rims_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (isDemoToken || isNetworkOr404) {
      const url = error.config?.url || '';
      const mockResult = getMockResponse(url);
      return Promise.resolve({
        data: {
          success: true,
          data: mockResult,
          timestamp: new Date().toISOString(),
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config,
      });
    }

    return Promise.reject(error);
  }
);

// ==================== AUTH APIs ====================
export const authApi = {
  login: async (credentials: { username: string; password: string }): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return res.data.data;
  },
  getProfile: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },
};

// ==================== PRODUCTS APIs ====================
export const productsApi = {
  getAll: async (params?: { search?: string; categoryId?: number; status?: string; page?: number; size?: number }): Promise<PagedResponse<Product>> => {
    const res = await api.get<ApiResponse<PagedResponse<Product>>>('/products', { params });
    return res.data.data;
  },
  getById: async (id: number): Promise<Product> => {
    const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data;
  },
  getBySku: async (sku: string): Promise<Product> => {
    const res = await api.get<ApiResponse<Product>>(`/products/sku/${sku}`);
    return res.data.data;
  },
  getByBarcode: async (barcode: string): Promise<Product> => {
    const res = await api.get<ApiResponse<Product>>(`/products/barcode/${barcode}`);
    return res.data.data;
  },
  create: async (product: Partial<Product>): Promise<Product> => {
    const res = await api.post<ApiResponse<Product>>('/products', product);
    return res.data.data;
  },
  update: async (id: number, product: Partial<Product>): Promise<Product> => {
    const res = await api.put<ApiResponse<Product>>(`/products/${id}`, product);
    return res.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
  exportCsv: async (): Promise<Blob> => {
    const res = await api.get('/products/export/csv', { responseType: 'blob' });
    return res.data;
  },
  importCsv: async (file: File): Promise<{ count: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<ApiResponse<{ count: number }>>('/products/import/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
};

// ==================== CATEGORIES APIs ====================
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await api.get<ApiResponse<Category[]>>('/categories');
    return res.data.data;
  },
  create: async (category: Partial<Category>): Promise<Category> => {
    const res = await api.post<ApiResponse<Category>>('/categories', category);
    return res.data.data;
  },
  update: async (id: number, category: Partial<Category>): Promise<Category> => {
    const res = await api.put<ApiResponse<Category>>(`/categories/${id}`, category);
    return res.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

// ==================== LOCATIONS (WAREHOUSES & STORES) ====================
export const locationsApi = {
  getWarehouses: async (): Promise<Warehouse[]> => {
    const res = await api.get<ApiResponse<Warehouse[]>>('/warehouses');
    return res.data.data;
  },
  createWarehouse: async (warehouse: Partial<Warehouse>): Promise<Warehouse> => {
    const res = await api.post<ApiResponse<Warehouse>>('/warehouses', warehouse);
    return res.data.data;
  },
  updateWarehouse: async (id: number, warehouse: Partial<Warehouse>): Promise<Warehouse> => {
    const res = await api.put<ApiResponse<Warehouse>>(`/warehouses/${id}`, warehouse);
    return res.data.data;
  },
  getStores: async (): Promise<Store[]> => {
    const res = await api.get<ApiResponse<Store[]>>('/stores');
    return res.data.data;
  },
  createStore: async (store: Partial<Store>): Promise<Store> => {
    const res = await api.post<ApiResponse<Store>>('/stores', store);
    return res.data.data;
  },
  updateStore: async (id: number, store: Partial<Store>): Promise<Store> => {
    const res = await api.put<ApiResponse<Store>>(`/stores/${id}`, store);
    return res.data.data;
  },
};

// ==================== INVENTORY & TRANSACTIONS ====================
export const inventoryApi = {
  getOverview: async (params?: {
    productId?: number;
    locationType?: string;
    locationId?: number;
    isLowStock?: boolean;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<InventoryItem>> => {
    const res = await api.get<ApiResponse<PagedResponse<InventoryItem>>>('/inventory', { params });
    return res.data.data;
  },
  stockIn: async (payload: {
    productId: number;
    locationType: 'WAREHOUSE' | 'STORE';
    locationId: number;
    quantity: number;
    unitCost?: number;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
  }): Promise<InventoryItem> => {
    const res = await api.post<ApiResponse<InventoryItem>>('/inventory/stock-in', payload);
    return res.data.data;
  },
  stockOut: async (payload: {
    productId: number;
    locationType: 'WAREHOUSE' | 'STORE';
    locationId: number;
    quantity: number;
    reason: string;
    notes?: string;
  }): Promise<InventoryItem> => {
    const res = await api.post<ApiResponse<InventoryItem>>('/inventory/stock-out', payload);
    return res.data.data;
  },
  adjustStock: async (payload: {
    productId: number;
    locationType: 'WAREHOUSE' | 'STORE';
    locationId: number;
    newActualStock: number;
    reason: string;
    notes?: string;
  }): Promise<InventoryItem> => {
    const res = await api.post<ApiResponse<InventoryItem>>('/inventory/adjust', payload);
    return res.data.data;
  },
  getTransactions: async (params?: {
    productId?: number;
    locationType?: string;
    locationId?: number;
    transactionType?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<StockTransaction>> => {
    const res = await api.get<ApiResponse<PagedResponse<StockTransaction>>>('/stock-transactions', { params });
    return res.data.data;
  },
};

// ==================== STOCK TRANSFERS ====================
export const transfersApi = {
  getAll: async (params?: { status?: string; page?: number; size?: number }): Promise<PagedResponse<StockTransfer>> => {
    const res = await api.get<ApiResponse<PagedResponse<StockTransfer>>>('/transfers', { params });
    return res.data.data;
  },
  getById: async (id: number): Promise<StockTransfer> => {
    const res = await api.get<ApiResponse<StockTransfer>>(`/transfers/${id}`);
    return res.data.data;
  },
  create: async (transfer: any): Promise<StockTransfer> => {
    const res = await api.post<ApiResponse<StockTransfer>>('/transfers', transfer);
    return res.data.data;
  },
  updateStatus: async (id: number, status: string, comment?: string): Promise<StockTransfer> => {
    const res = await api.put<ApiResponse<StockTransfer>>(`/transfers/${id}/status`, { status, comment });
    return res.data.data;
  },
  receive: async (id: number, receivedItems: { itemId: number; receivedQty: number }[]): Promise<StockTransfer> => {
    const res = await api.post<ApiResponse<StockTransfer>>(`/transfers/${id}/receive`, { receivedItems });
    return res.data.data;
  },
};

// ==================== SUPPLIERS & PURCHASE ORDERS ====================
export const suppliersApi = {
  getAll: async (): Promise<Supplier[]> => {
    const res = await api.get<ApiResponse<Supplier[]>>('/suppliers');
    return res.data.data;
  },
  create: async (supplier: Partial<Supplier>): Promise<Supplier> => {
    const res = await api.post<ApiResponse<Supplier>>('/suppliers', supplier);
    return res.data.data;
  },
  update: async (id: number, supplier: Partial<Supplier>): Promise<Supplier> => {
    const res = await api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, supplier);
    return res.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },
};

export const purchaseOrdersApi = {
  getAll: async (params?: { supplierId?: number; status?: string; page?: number; size?: number }): Promise<PagedResponse<PurchaseOrder>> => {
    const res = await api.get<ApiResponse<PagedResponse<PurchaseOrder>>>('/purchase-orders', { params });
    return res.data.data;
  },
  getById: async (id: number): Promise<PurchaseOrder> => {
    const res = await api.get<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}`);
    return res.data.data;
  },
  create: async (po: any): Promise<PurchaseOrder> => {
    const res = await api.post<ApiResponse<PurchaseOrder>>('/purchase-orders', po);
    return res.data.data;
  },
  updateStatus: async (id: number, status: string): Promise<PurchaseOrder> => {
    const res = await api.put<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}/status`, { status });
    return res.data.data;
  },
  receive: async (id: number, items: { itemId: number; quantityReceived: number }[]): Promise<PurchaseOrder> => {
    const res = await api.post<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}/receive`, { items });
    return res.data.data;
  },
};

// ==================== CUSTOMER ORDERS & RETURNS ====================
export const ordersApi = {
  getAll: async (params?: { customerId?: number; status?: string; locationType?: string; locationId?: number; page?: number; size?: number }): Promise<PagedResponse<CustomerOrder>> => {
    const res = await api.get<ApiResponse<PagedResponse<CustomerOrder>>>('/orders', { params });
    return res.data.data;
  },
  getById: async (id: number): Promise<CustomerOrder> => {
    const res = await api.get<ApiResponse<CustomerOrder>>(`/orders/${id}`);
    return res.data.data;
  },
  create: async (order: any): Promise<CustomerOrder> => {
    const res = await api.post<ApiResponse<CustomerOrder>>('/orders', order);
    return res.data.data;
  },
  updateStatus: async (id: number, status: string, comment?: string): Promise<CustomerOrder> => {
    const res = await api.put<ApiResponse<CustomerOrder>>(`/orders/${id}/status`, { status, comment });
    return res.data.data;
  },
  ship: async (id: number): Promise<CustomerOrder> => {
    const res = await api.post<ApiResponse<CustomerOrder>>(`/orders/${id}/ship`);
    return res.data.data;
  },
  cancel: async (id: number, reason: string): Promise<CustomerOrder> => {
    const res = await api.post<ApiResponse<CustomerOrder>>(`/orders/${id}/cancel`, { reason });
    return res.data.data;
  },
};

export const returnsApi = {
  getAll: async (params?: { status?: string; page?: number; size?: number }): Promise<PagedResponse<ReturnOrder>> => {
    const res = await api.get<ApiResponse<PagedResponse<ReturnOrder>>>('/returns', { params });
    return res.data.data;
  },
  getById: async (id: number): Promise<ReturnOrder> => {
    const res = await api.get<ApiResponse<ReturnOrder>>(`/returns/${id}`);
    return res.data.data;
  },
  create: async (rma: any): Promise<ReturnOrder> => {
    const res = await api.post<ApiResponse<ReturnOrder>>('/returns', rma);
    return res.data.data;
  },
  processDisposition: async (id: number, payload: { disposition: string; restockLocationType?: string; restockLocationId?: number; notes?: string }): Promise<ReturnOrder> => {
    const res = await api.post<ApiResponse<ReturnOrder>>(`/returns/${id}/process`, payload);
    return res.data.data;
  },
};

// ==================== BARCODE & RFID ====================
export const barcodeRfidApi = {
  generateBarcodeSvg: async (sku: string): Promise<string> => {
    const res = await api.get<string>(`/barcodes/generate/${sku}`, { responseType: 'text' });
    return res.data;
  },
  verifyBarcode: async (barcode: string): Promise<Product> => {
    const res = await api.get<ApiResponse<Product>>(`/barcodes/verify/${barcode}`);
    return res.data.data;
  },
  simulateDockDoorScan: async (payload: { gateNumber: string; epcCodes: string[]; locationType: string; locationId: number }): Promise<any> => {
    const res = await api.post<ApiResponse<any>>('/rfid/simulate-dock-door', payload);
    return res.data.data;
  },
  getRfidLogs: async (params?: { page?: number; size?: number }): Promise<PagedResponse<any>> => {
    const res = await api.get<ApiResponse<PagedResponse<any>>>('/rfid/logs', { params });
    return res.data.data;
  },
};

// ==================== ANALYTICS & REPORTS ====================
export const analyticsApi = {
  getDashboardAnalytics: async (): Promise<DashboardAnalytics> => {
    const res = await api.get<ApiResponse<DashboardAnalytics>>('/analytics/dashboard');
    return res.data.data;
  },
  getReport: async (reportType: string, params?: Record<string, any>): Promise<any> => {
    const res = await api.get<ApiResponse<any>>(`/reports/${reportType}`, { params });
    return res.data.data;
  },
  downloadReportCsv: async (reportType: string, params?: Record<string, any>): Promise<Blob> => {
    const res = await api.get(`/reports/${reportType}/csv`, { params, responseType: 'blob' });
    return res.data;
  },
};

// ==================== NOTIFICATIONS & AUDIT ====================
export const notificationsApi = {
  getAll: async (params?: { unreadOnly?: boolean }): Promise<Notification[]> => {
    const res = await api.get<ApiResponse<Notification[]>>('/notifications', { params });
    return res.data.data;
  },
  markAsRead: async (id: number): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },
  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/mark-all-read');
  },
};

export const auditLogsApi = {
  getAll: async (params?: { page?: number; size?: number; resourceType?: string }): Promise<PagedResponse<AuditLog>> => {
    const res = await api.get<ApiResponse<PagedResponse<AuditLog>>>('/audit-logs', { params });
    return res.data.data;
  },
};

// ==================== SYSTEM INTEGRATIONS & USERS ====================
export const integrationsApi = {
  getAll: async (): Promise<IntegrationConfig[]> => {
    const res = await api.get<ApiResponse<IntegrationConfig[]>>('/integrations');
    return res.data.data;
  },
  syncNow: async (id: number): Promise<any> => {
    const res = await api.post<ApiResponse<any>>(`/integrations/${id}/sync`);
    return res.data.data;
  },
  updateConfig: async (id: number, config: Partial<IntegrationConfig>): Promise<IntegrationConfig> => {
    const res = await api.put<ApiResponse<IntegrationConfig>>(`/integrations/${id}`, config);
    return res.data.data;
  },
};

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const res = await api.get<ApiResponse<User[]>>('/users');
    return res.data.data;
  },
  create: async (user: any): Promise<User> => {
    const res = await api.post<ApiResponse<User>>('/users', user);
    return res.data.data;
  },
  updateStatus: async (id: number, status: string): Promise<User> => {
    const res = await api.put<ApiResponse<User>>(`/users/${id}/status`, { status });
    return res.data.data;
  },
};

export default api;
