import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { Barcodes } from './pages/Barcodes';
import { Rfid } from './pages/Rfid';
import { Inventory } from './pages/Inventory';
import { StockIn } from './pages/StockIn';
import { StockOut } from './pages/StockOut';
import { InventoryHistory } from './pages/InventoryHistory';
import { Transfers } from './pages/Transfers';
import { Orders } from './pages/Orders';
import { Returns } from './pages/Returns';
import { Suppliers } from './pages/Suppliers';
import { PurchaseOrders } from './pages/PurchaseOrders';
import { WarehousesStores } from './pages/WarehousesStores';
import { Users } from './pages/Users';
import { AuditLogs } from './pages/AuditLogs';
import { Integrations } from './pages/Integrations';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/barcodes" element={<Barcodes />} />
            <Route path="/rfid" element={<Rfid />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/stock-in" element={<StockIn />} />
            <Route path="/inventory/stock-out" element={<StockOut />} />
            <Route path="/inventory/history" element={<InventoryHistory />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/warehouses" element={<WarehousesStores />} />
            <Route path="/stores" element={<WarehousesStores />} />
            <Route path="/users" element={<Users />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/integrations" element={<Integrations />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
