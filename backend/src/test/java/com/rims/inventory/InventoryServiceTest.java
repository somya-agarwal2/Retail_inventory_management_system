package com.rims.inventory;

import com.rims.common.exception.InsufficientStockException;
import com.rims.notification.NotificationService;
import com.rims.product.Product;
import com.rims.product.ProductRepository;
import com.rims.stock.StockTransaction;
import com.rims.stock.StockTransactionRepository;
import com.rims.warehouse.Warehouse;
import com.rims.warehouse.WarehouseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private WarehouseRepository warehouseRepository;

    @Mock
    private StockTransactionRepository stockTransactionRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private InventoryService inventoryService;

    private Product testProduct;
    private Inventory existingInventory;
    private Warehouse warehouse;

    @BeforeEach
    void setUp() {
        testProduct = Product.builder()
                .id(1L)
                .sku("APP-SHIRT-001")
                .name("Oxford Cotton Shirt")
                .purchasePrice(new BigDecimal("18.00"))
                .sellingPrice(new BigDecimal("35.00"))
                .reorderPoint(15)
                .safetyStock(5)
                .build();

        existingInventory = Inventory.builder()
                .id(10L)
                .product(testProduct)
                .locationType("WAREHOUSE")
                .locationId(1L)
                .currentStock(50)
                .reservedStock(10)
                .reorderPoint(15)
                .safetyStock(5)
                .build();

        warehouse = Warehouse.builder()
                .id(1L)
                .code("WH-CENTRAL")
                .name("Central Distribution Hub")
                .build();
    }

    @Test
    @DisplayName("Scenario 1: Stock-In increases current stock and records a ledger transaction")
    void testStockIn_Success() {
        StockInRequest request = StockInRequest.builder()
                .productId(1L)
                .locationType("WAREHOUSE")
                .locationId(1L)
                .quantity(20)
                .referenceType("PURCHASE_ORDER")
                .referenceId("PO-2026-001")
                .unitCost(new BigDecimal("18.00"))
                .notes("Standard restock")
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(warehouseRepository.existsById(1L)).thenReturn(true);
        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(warehouse));
        when(inventoryRepository.findWithLock(1L, "WAREHOUSE", 1L)).thenReturn(Optional.of(existingInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(i -> i.getArgument(0));

        InventoryDto result = inventoryService.stockIn(request, 100L);

        assertNotNull(result);
        assertEquals(70, result.getCurrentStock()); // 50 + 20
        verify(stockTransactionRepository, times(1)).save(any(StockTransaction.class));
    }

    @Test
    @DisplayName("Scenario 2: Stock-Out decreases current stock when requested quantity <= available stock")
    void testStockOut_Success() {
        // Available stock is currentStock (50) - reservedStock (10) = 40
        StockOutRequest request = StockOutRequest.builder()
                .productId(1L)
                .locationType("WAREHOUSE")
                .locationId(1L)
                .quantity(30)
                .reason("STORE_TRANSFER")
                .notes("Transfer to retail store")
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(warehouseRepository.existsById(1L)).thenReturn(true);
        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(warehouse));
        when(inventoryRepository.findWithLock(1L, "WAREHOUSE", 1L)).thenReturn(Optional.of(existingInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(i -> i.getArgument(0));

        InventoryDto result = inventoryService.stockOut(request, 100L);

        assertNotNull(result);
        assertEquals(20, result.getCurrentStock()); // 50 - 30 = 20
        verify(stockTransactionRepository, times(1)).save(any(StockTransaction.class));
    }

    @Test
    @DisplayName("Scenario 3: Stock-Out is rejected with InsufficientStockException when quantity > available stock")
    void testStockOut_InsufficientStock() {
        // Available stock is 50 - 10 = 40. Requesting 45 must be rejected.
        StockOutRequest request = StockOutRequest.builder()
                .productId(1L)
                .locationType("WAREHOUSE")
                .locationId(1L)
                .quantity(45)
                .reason("STORE_TRANSFER")
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(warehouseRepository.existsById(1L)).thenReturn(true);
        when(inventoryRepository.findWithLock(1L, "WAREHOUSE", 1L)).thenReturn(Optional.of(existingInventory));

        InsufficientStockException exception = assertThrows(InsufficientStockException.class, () -> {
            inventoryService.stockOut(request, 100L);
        });

        assertTrue(exception.getMessage().contains("exceeds available stock"));
        verify(inventoryRepository, never()).save(any(Inventory.class));
        verify(stockTransactionRepository, never()).save(any(StockTransaction.class));
    }

    @Test
    @DisplayName("Scenario 4: Stock-Out triggering low-stock threshold dispatches alert notification")
    void testStockOut_LowStockTrigger() {
        // Available is 40. Stock-out of 38 leaves currentStock = 12, which is <= reorderPoint 15.
        StockOutRequest request = StockOutRequest.builder()
                .productId(1L)
                .locationType("WAREHOUSE")
                .locationId(1L)
                .quantity(38)
                .reason("DAMAGE_DISPOSAL")
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(warehouseRepository.existsById(1L)).thenReturn(true);
        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(warehouse));
        when(inventoryRepository.findWithLock(1L, "WAREHOUSE", 1L)).thenReturn(Optional.of(existingInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(i -> i.getArgument(0));

        InventoryDto result = inventoryService.stockOut(request, 100L);

        assertEquals(12, result.getCurrentStock());
        verify(notificationService, times(1)).createNotification(
                contains("Low Stock Alert"),
                contains("12 units"),
                eq("LOW_STOCK"),
                eq("PRODUCT"),
                eq("1")
        );
    }
}
