package com.rims.reports;

import com.rims.inventory.Inventory;
import com.rims.inventory.InventoryRepository;
import com.rims.inventory.InventoryService;
import com.rims.order.CustomerOrder;
import com.rims.order.CustomerOrderRepository;
import com.rims.product.Product;
import com.rims.product.ProductRepository;
import com.rims.purchaseorder.PurchaseOrder;
import com.rims.purchaseorder.PurchaseOrderRepository;
import com.rims.stock.StockTransaction;
import com.rims.stock.StockTransactionRepository;
import com.rims.supplier.Supplier;
import com.rims.supplier.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportsService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final CustomerOrderRepository orderRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryService inventoryService;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> generateReport(String reportType) {
        String type = reportType != null ? reportType.toLowerCase().replace("-", "_") : "inventory_summary";

        return switch (type) {
            case "inventory_summary" -> getInventorySummaryReport();
            case "stock_movement" -> getStockMovementReport();
            case "low_stock" -> getLowStockReport();
            case "out_of_stock" -> getOutOfStockReport();
            case "inventory_valuation" -> getInventoryValuationReport();
            case "purchase_orders", "purchase_order" -> getPurchaseOrderReport();
            case "sales_orders", "sales_order" -> getSalesOrderReport();
            case "product_performance" -> getProductPerformanceReport();
            case "supplier_performance" -> getSupplierPerformanceReport();
            case "inventory_turnover" -> getInventoryTurnoverReport();
            default -> getInventorySummaryReport();
        };
    }

    private List<Map<String, Object>> getInventorySummaryReport() {
        List<Inventory> items = inventoryRepository.findAll();
        List<Map<String, Object>> rows = new ArrayList<>();

        for (Inventory i : items) {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("sku", i.getProduct().getSku());
            r.put("productName", i.getProduct().getName());
            r.put("category", i.getProduct().getCategory() != null ? i.getProduct().getCategory().getName() : "");
            r.put("location", inventoryService.resolveLocationName(i.getLocationType(), i.getLocationId()));
            r.put("currentStock", i.getCurrentStock());
            r.put("reservedStock", i.getReservedStock());
            r.put("availableStock", i.getAvailableStock());
            r.put("reorderPoint", i.getReorderPoint());
            r.put("valuation", i.getProduct().getPurchasePrice().multiply(BigDecimal.valueOf(i.getCurrentStock())));
            rows.add(r);
        }
        return rows;
    }

    private List<Map<String, Object>> getStockMovementReport() {
        List<StockTransaction> txs = stockTransactionRepository.findAll();
        List<Map<String, Object>> rows = new ArrayList<>();

        for (StockTransaction st : txs) {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("transactionRef", st.getTransactionRef());
            r.put("sku", st.getProduct().getSku());
            r.put("productName", st.getProduct().getName());
            r.put("location", inventoryService.resolveLocationName(st.getLocationType(), st.getLocationId()));
            r.put("type", st.getTransactionType());
            r.put("quantity", st.getQuantity());
            r.put("balanceAfter", st.getBalanceAfter());
            r.put("referenceType", st.getReferenceType());
            r.put("referenceId", st.getReferenceId());
            r.put("timestamp", st.getCreatedAt().toString());
            rows.add(r);
        }
        return rows;
    }

    private List<Map<String, Object>> getLowStockReport() {
        List<Inventory> items = inventoryRepository.findLowStockItems();
        List<Map<String, Object>> rows = new ArrayList<>();

        for (Inventory i : items) {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("sku", i.getProduct().getSku());
            r.put("productName", i.getProduct().getName());
            r.put("location", inventoryService.resolveLocationName(i.getLocationType(), i.getLocationId()));
            r.put("currentStock", i.getCurrentStock());
            r.put("reorderPoint", i.getReorderPoint());
            r.put("safetyStock", i.getSafetyStock());
            r.put("shortage", Math.max(0, i.getReorderPoint() - i.getCurrentStock()));
            r.put("urgency", i.getCurrentStock() == 0 ? "CRITICAL (OUT OF STOCK)" : "HIGH (BELOW REORDER POINT)");
            rows.add(r);
        }
        return rows;
    }

    private List<Map<String, Object>> getOutOfStockReport() {
        List<Inventory> items = inventoryRepository.findAll().stream()
                .filter(i -> i.getCurrentStock() == 0)
                .toList();
        List<Map<String, Object>> rows = new ArrayList<>();

        for (Inventory i : items) {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("sku", i.getProduct().getSku());
            r.put("productName", i.getProduct().getName());
            r.put("category", i.getProduct().getCategory() != null ? i.getProduct().getCategory().getName() : "");
            r.put("location", inventoryService.resolveLocationName(i.getLocationType(), i.getLocationId()));
            r.put("reorderPoint", i.getReorderPoint());
            r.put("action", "Urgent Purchase Order Required");
            rows.add(r);
        }
        return rows;
    }

    private List<Map<String, Object>> getInventoryValuationReport() {
        List<Inventory> items = inventoryRepository.findAll();
        List<Map<String, Object>> rows = new ArrayList<>();

        for (Inventory i : items) {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("sku", i.getProduct().getSku());
            r.put("productName", i.getProduct().getName());
            r.put("location", inventoryService.resolveLocationName(i.getLocationType(), i.getLocationId()));
            r.put("currentStock", i.getCurrentStock());
            r.put("costPrice", i.getProduct().getPurchasePrice());
            r.put("retailPrice", i.getProduct().getSellingPrice());
            BigDecimal totalCost = i.getProduct().getPurchasePrice().multiply(BigDecimal.valueOf(i.getCurrentStock()));
            BigDecimal totalRetail = i.getProduct().getSellingPrice().multiply(BigDecimal.valueOf(i.getCurrentStock()));
            r.put("totalCostValue", totalCost);
            r.put("totalRetailValue", totalRetail);
            r.put("unrealizedMargin", totalRetail.subtract(totalCost));
            rows.add(r);
        }
        return rows;
    }

    private List<Map<String, Object>> getPurchaseOrderReport() {
        List<PurchaseOrder> orders = purchaseOrderRepository.findAll();
        List<Map<String, Object>> rows = new ArrayList<>();

        for (PurchaseOrder po : orders) {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("poNumber", po.getPoNumber());
            r.put("supplier", po.getSupplier() != null ? po.getSupplier().getName() : "");
            r.put("warehouse", po.getWarehouse() != null ? po.getWarehouse().getName() : "");
            r.put("status", po.getStatus());
            r.put("orderDate", po.getOrderDate().toString());
            r.put("expectedDelivery", po.getExpectedDeliveryDate() != null ? po.getExpectedDeliveryDate().toString() : "N/A");
            r.put("totalAmount", po.getTotalAmount());
            r.put("itemCount", po.getItems().size());
            rows.add(r);
        }
        return rows;
    }

    private List<Map<String, Object>> getSalesOrderReport() {
        List<CustomerOrder> orders = orderRepository.findAll();
        List<Map<String, Object>> rows = new ArrayList<>();

        for (CustomerOrder o : orders) {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("orderNumber", o.getOrderNumber());
            r.put("customer", o.getCustomer() != null ? o.getCustomer().getFirstName() + " " + o.getCustomer().getLastName() : "Walk-in");
            r.put("fulfillmentLocation", inventoryService.resolveLocationName(o.getFulfillmentLocationType(), o.getFulfillmentLocationId()));
            r.put("status", o.getStatus());
            r.put("paymentStatus", o.getPaymentStatus());
            r.put("carrier", o.getShippingCarrier());
            r.put("trackingNumber", o.getTrackingNumber() != null ? o.getTrackingNumber() : "Pending");
            r.put("totalAmount", o.getTotalAmount());
            r.put("orderDate", o.getOrderDate().toString());
            rows.add(r);
        }
        return rows;
    }

    private List<Map<String, Object>> getProductPerformanceReport() {
        List<Product> products = productRepository.findAll();
        List<CustomerOrder> orders = orderRepository.findAll();
        List<Map<String, Object>> rows = new ArrayList<>();

        Map<Long, Integer> soldUnits = new HashMap<>();
        Map<Long, BigDecimal> revenue = new HashMap<>();

        for (CustomerOrder o : orders) {
            o.getItems().forEach(item -> {
                Long pid = item.getProduct().getId();
                soldUnits.put(pid, soldUnits.getOrDefault(pid, 0) + item.getQuantity());
                revenue.put(pid, revenue.getOrDefault(pid, BigDecimal.ZERO).add(item.getLineTotal()));
            });
        }

        for (Product p : products) {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("sku", p.getSku());
            r.put("name", p.getName());
            r.put("category", p.getCategory() != null ? p.getCategory().getName() : "");
            r.put("brand", p.getBrand());
            r.put("costPrice", p.getPurchasePrice());
            r.put("sellingPrice", p.getSellingPrice());
            r.put("unitsSold", soldUnits.getOrDefault(p.getId(), 0));
            r.put("totalRevenue", revenue.getOrDefault(p.getId(), BigDecimal.ZERO));
            rows.add(r);
        }
        return rows;
    }

    private List<Map<String, Object>> getSupplierPerformanceReport() {
        List<Supplier> suppliers = supplierRepository.findAll();
        List<PurchaseOrder> allPos = purchaseOrderRepository.findAll();
        List<Map<String, Object>> rows = new ArrayList<>();

        for (Supplier s : suppliers) {
            long totalPos = allPos.stream().filter(po -> po.getSupplier().getId().equals(s.getId())).count();
            long receivedPos = allPos.stream().filter(po -> po.getSupplier().getId().equals(s.getId()) && "RECEIVED".equalsIgnoreCase(po.getStatus())).count();
            double fulfillmentRate = totalPos > 0 ? ((double) receivedPos / totalPos) * 100.0 : 100.0;

            Map<String, Object> r = new LinkedHashMap<>();
            r.put("code", s.getCode());
            r.put("name", s.getName());
            r.put("contactPerson", s.getContactPerson());
            r.put("rating", s.getRating());
            r.put("paymentTerms", s.getPaymentTerms());
            r.put("totalPOs", totalPos);
            r.put("fulfilledPOs", receivedPos);
            r.put("fulfillmentRate", String.format("%.1f%%", fulfillmentRate));
            r.put("status", s.getStatus());
            rows.add(r);
        }
        return rows;
    }

    private List<Map<String, Object>> getInventoryTurnoverReport() {
        List<Product> products = productRepository.findAll();
        List<Map<String, Object>> rows = new ArrayList<>();

        for (Product p : products) {
            Integer totalStock = inventoryRepository.sumCurrentStockByProductId(p.getId());
            double stockOnHand = totalStock != null ? totalStock : 0;
            // Simulated 30-day velocity metric
            double monthlySold = Math.max(2.0, stockOnHand * 0.45);
            double turnoverRatio = stockOnHand > 0 ? (monthlySold * 12.0) / stockOnHand : 0.0;

            Map<String, Object> r = new LinkedHashMap<>();
            r.put("sku", p.getSku());
            r.put("productName", p.getName());
            r.put("category", p.getCategory() != null ? p.getCategory().getName() : "");
            r.put("stockOnHand", (long) stockOnHand);
            r.put("estimatedMonthlyDemand", (long) monthlySold);
            r.put("turnoverRatio", String.format("%.2f", turnoverRatio));
            r.put("daysOfSupply", stockOnHand > 0 ? (long)((stockOnHand / monthlySold) * 30) : 0);
            rows.add(r);
        }
        return rows;
    }

    public ByteArrayInputStream exportReportToCsv(String reportType) throws IOException {
        List<Map<String, Object>> reportData = generateReport(reportType);
        if (reportData.isEmpty()) {
            return new ByteArrayInputStream("No data available for this report".getBytes(StandardCharsets.UTF_8));
        }

        Set<String> headers = reportData.get(0).keySet();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVPrinter printer = new CSVPrinter(new PrintWriter(out, true, StandardCharsets.UTF_8),
                     CSVFormat.DEFAULT.builder().setHeader(headers.toArray(new String[0])).build())) {

            for (Map<String, Object> row : reportData) {
                printer.printRecord(row.values());
            }
            printer.flush();
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}
