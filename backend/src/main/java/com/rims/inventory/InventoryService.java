package com.rims.inventory;

import com.rims.common.exception.InsufficientStockException;
import com.rims.common.exception.ResourceNotFoundException;
import com.rims.notification.NotificationService;
import com.rims.product.Product;
import com.rims.product.ProductRepository;
import com.rims.stock.StockTransaction;
import com.rims.stock.StockTransactionRepository;
import com.rims.store.Store;
import com.rims.store.StoreRepository;
import com.rims.warehouse.Warehouse;
import com.rims.warehouse.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final StoreRepository storeRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public Page<InventoryDto> getInventory(Long productId, String locationType, Long locationId, Boolean isLowStock, Pageable pageable) {
        return inventoryRepository.findFilteredInventory(productId, locationType, locationId, isLowStock, pageable)
                .map(inv -> InventoryDto.fromEntity(inv, resolveLocationName(inv.getLocationType(), inv.getLocationId())));
    }

    @Transactional(readOnly = true)
    public InventoryDto getProductInventory(Long productId, String locationType, Long locationId) {
        Inventory inv = inventoryRepository.findByProductIdAndLocationTypeAndLocationId(productId, locationType, locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product " + productId + " at " + locationType + " " + locationId));
        return InventoryDto.fromEntity(inv, resolveLocationName(inv.getLocationType(), inv.getLocationId()));
    }

    @Transactional
    public InventoryDto stockIn(StockInRequest request, Long userId) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));
        validateLocation(request.getLocationType(), request.getLocationId());

        Inventory inventory = inventoryRepository.findWithLock(request.getProductId(), request.getLocationType(), request.getLocationId())
                .orElseGet(() -> Inventory.builder()
                        .product(product)
                        .locationType(request.getLocationType())
                        .locationId(request.getLocationId())
                        .currentStock(0)
                        .reservedStock(0)
                        .reorderPoint(product.getReorderPoint())
                        .safetyStock(product.getSafetyStock())
                        .build());

        inventory.setCurrentStock(inventory.getCurrentStock() + request.getQuantity());
        inventory.setLastRestockedAt(Instant.now());
        Inventory saved = inventoryRepository.save(inventory);

        BigDecimal unitCost = request.getUnitCost() != null ? request.getUnitCost() : product.getPurchasePrice();
        String txRef = "TX-IN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        StockTransaction tx = StockTransaction.builder()
                .transactionRef(txRef)
                .product(product)
                .locationType(request.getLocationType())
                .locationId(request.getLocationId())
                .transactionType("STOCK_IN")
                .quantity(request.getQuantity())
                .balanceAfter(saved.getCurrentStock())
                .unitCost(unitCost)
                .referenceType(request.getReferenceType())
                .referenceId(request.getReferenceId())
                .notes(request.getNotes())
                .performedByUserId(userId)
                .build();
        stockTransactionRepository.save(tx);

        return InventoryDto.fromEntity(saved, resolveLocationName(saved.getLocationType(), saved.getLocationId()));
    }

    @Transactional
    public InventoryDto stockOut(StockOutRequest request, Long userId) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));
        validateLocation(request.getLocationType(), request.getLocationId());

        Inventory inventory = inventoryRepository.findWithLock(request.getProductId(), request.getLocationType(), request.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for stock-out at " + request.getLocationType() + " " + request.getLocationId()));

        if (inventory.getAvailableStock() < request.getQuantity()) {
            throw new InsufficientStockException("Requested quantity (" + request.getQuantity() + 
                    ") exceeds available stock (" + inventory.getAvailableStock() + ") for SKU " + product.getSku());
        }

        inventory.setCurrentStock(inventory.getCurrentStock() - request.getQuantity());
        Inventory saved = inventoryRepository.save(inventory);

        String txRef = "TX-OUT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        StockTransaction tx = StockTransaction.builder()
                .transactionRef(txRef)
                .product(product)
                .locationType(request.getLocationType())
                .locationId(request.getLocationId())
                .transactionType("STOCK_OUT")
                .quantity(-request.getQuantity())
                .balanceAfter(saved.getCurrentStock())
                .unitCost(product.getPurchasePrice())
                .referenceType("MANUAL_AUDIT")
                .referenceId(request.getReason())
                .notes(request.getNotes())
                .performedByUserId(userId)
                .build();
        stockTransactionRepository.save(tx);

        checkAndTriggerLowStockAlert(saved);

        return InventoryDto.fromEntity(saved, resolveLocationName(saved.getLocationType(), saved.getLocationId()));
    }

    @Transactional
    public InventoryDto adjustStock(StockAdjustmentRequest request, Long userId) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));
        validateLocation(request.getLocationType(), request.getLocationId());

        Inventory inventory = inventoryRepository.findWithLock(request.getProductId(), request.getLocationType(), request.getLocationId())
                .orElseGet(() -> Inventory.builder()
                        .product(product)
                        .locationType(request.getLocationType())
                        .locationId(request.getLocationId())
                        .currentStock(0)
                        .reservedStock(0)
                        .reorderPoint(product.getReorderPoint())
                        .safetyStock(product.getSafetyStock())
                        .build());

        int oldStock = inventory.getCurrentStock();
        int newStock = Math.max(0, request.getNewActualStock());
        int diff = newStock - oldStock;

        inventory.setCurrentStock(newStock);
        Inventory saved = inventoryRepository.save(inventory);

        String txType = diff >= 0 ? "ADJUSTMENT_ADD" : "ADJUSTMENT_SUBTRACT";
        String txRef = "TX-ADJ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        StockTransaction tx = StockTransaction.builder()
                .transactionRef(txRef)
                .product(product)
                .locationType(request.getLocationType())
                .locationId(request.getLocationId())
                .transactionType(txType)
                .quantity(diff)
                .balanceAfter(newStock)
                .unitCost(product.getPurchasePrice())
                .referenceType("MANUAL_AUDIT")
                .referenceId(request.getReason())
                .notes(request.getNotes() != null ? request.getNotes() : "Physical count adjustment from " + oldStock + " to " + newStock)
                .performedByUserId(userId)
                .build();
        stockTransactionRepository.save(tx);

        checkAndTriggerLowStockAlert(saved);

        return InventoryDto.fromEntity(saved, resolveLocationName(saved.getLocationType(), saved.getLocationId()));
    }

    @Transactional
    public void reserveStock(Long productId, String locationType, Long locationId, int quantity) {
        Inventory inventory = inventoryRepository.findWithLock(productId, locationType, locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory record not found to reserve stock"));

        if (inventory.getAvailableStock() < quantity) {
            throw new InsufficientStockException("Cannot reserve " + quantity + " units. Available: " + inventory.getAvailableStock());
        }

        inventory.setReservedStock(inventory.getReservedStock() + quantity);
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void releaseReservedStock(Long productId, String locationType, Long locationId, int quantity) {
        inventoryRepository.findWithLock(productId, locationType, locationId).ifPresent(inventory -> {
            inventory.setReservedStock(Math.max(0, inventory.getReservedStock() - quantity));
            inventoryRepository.save(inventory);
        });
    }

    @Transactional
    public void fulfillReservedStock(Long productId, String locationType, Long locationId, int quantity, String orderRef, Long userId) {
        Inventory inventory = inventoryRepository.findWithLock(productId, locationType, locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for fulfillment"));

        inventory.setReservedStock(Math.max(0, inventory.getReservedStock() - quantity));
        inventory.setCurrentStock(Math.max(0, inventory.getCurrentStock() - quantity));
        Inventory saved = inventoryRepository.save(inventory);

        String txRef = "TX-FULFILL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        StockTransaction tx = StockTransaction.builder()
                .transactionRef(txRef)
                .product(saved.getProduct())
                .locationType(locationType)
                .locationId(locationId)
                .transactionType("ORDER_FULFILL")
                .quantity(-quantity)
                .balanceAfter(saved.getCurrentStock())
                .unitCost(saved.getProduct().getPurchasePrice())
                .referenceType("CUSTOMER_ORDER")
                .referenceId(orderRef)
                .notes("Dispatched for order " + orderRef)
                .performedByUserId(userId)
                .build();
        stockTransactionRepository.save(tx);

        checkAndTriggerLowStockAlert(saved);
    }

    public void checkAndTriggerLowStockAlert(Inventory inventory) {
        if (inventory.getCurrentStock() <= inventory.getReorderPoint()) {
            String locationName = resolveLocationName(inventory.getLocationType(), inventory.getLocationId());
            String title = "Low Stock Alert: " + inventory.getProduct().getSku();
            String message = String.format("Stock level for '%s' at %s is now %d units (Reorder threshold: %d).",
                    inventory.getProduct().getName(), locationName, inventory.getCurrentStock(), inventory.getReorderPoint());

            notificationService.createNotification(title, message, "LOW_STOCK", "PRODUCT", inventory.getProduct().getId().toString());
        }
    }

    public String resolveLocationName(String locationType, Long locationId) {
        if ("WAREHOUSE".equalsIgnoreCase(locationType)) {
            return warehouseRepository.findById(locationId).map(Warehouse::getName).orElse("Warehouse #" + locationId);
        } else if ("STORE".equalsIgnoreCase(locationType)) {
            return storeRepository.findById(locationId).map(Store::getName).orElse("Store #" + locationId);
        }
        return locationType + " #" + locationId;
    }

    private void validateLocation(String locationType, Long locationId) {
        if ("WAREHOUSE".equalsIgnoreCase(locationType)) {
            if (!warehouseRepository.existsById(locationId)) {
                throw new ResourceNotFoundException("Warehouse not found with id: " + locationId);
            }
        } else if ("STORE".equalsIgnoreCase(locationType)) {
            if (!storeRepository.existsById(locationId)) {
                throw new ResourceNotFoundException("Store not found with id: " + locationId);
            }
        } else {
            throw new ResourceNotFoundException("Invalid location type: " + locationType);
        }
    }
}
