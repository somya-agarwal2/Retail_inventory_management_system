package com.rims.purchaseorder;

import com.rims.common.exception.InvalidOperationException;
import com.rims.common.exception.ResourceNotFoundException;
import com.rims.inventory.InventoryService;
import com.rims.inventory.StockInRequest;
import com.rims.product.Product;
import com.rims.product.ProductRepository;
import com.rims.supplier.Supplier;
import com.rims.supplier.SupplierRepository;
import com.rims.warehouse.Warehouse;
import com.rims.warehouse.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    @Transactional(readOnly = true)
    public Page<PurchaseOrderDto> getPurchaseOrders(Long supplierId, Long warehouseId, String status, Pageable pageable) {
        return purchaseOrderRepository.findFilteredPurchaseOrders(supplierId, warehouseId, status, pageable)
                .map(PurchaseOrderDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public PurchaseOrderDto getPurchaseOrderById(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));
        return PurchaseOrderDto.fromEntity(po);
    }

    @Transactional
    public PurchaseOrderDto createPurchaseOrder(PurchaseOrderDto.CreatePoRequest request, Long userId) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + request.getWarehouseId()));

        String poNum = "PO-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        PurchaseOrder po = PurchaseOrder.builder()
                .poNumber(poNum)
                .supplier(supplier)
                .warehouse(warehouse)
                .status("DRAFT")
                .orderDate(LocalDate.now())
                .expectedDeliveryDate(request.getExpectedDeliveryDate())
                .notes(request.getNotes())
                .createdBy(userId)
                .items(new ArrayList<>())
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (PurchaseOrderDto.PoItemDto itemDto : request.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemDto.getProductId()));

            BigDecimal lineTotal = itemDto.getUnitPrice().multiply(BigDecimal.valueOf(itemDto.getOrderedQty()));
            total = total.add(lineTotal);

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .purchaseOrder(po)
                    .product(product)
                    .orderedQty(itemDto.getOrderedQty())
                    .receivedQty(0)
                    .unitPrice(itemDto.getUnitPrice())
                    .build();

            po.getItems().add(item);
        }

        po.setTotalAmount(total);
        return PurchaseOrderDto.fromEntity(purchaseOrderRepository.save(po));
    }

    @Transactional
    public PurchaseOrderDto submitPurchaseOrder(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));

        if (!"DRAFT".equalsIgnoreCase(po.getStatus())) {
            throw new InvalidOperationException("Only DRAFT purchase orders can be submitted");
        }

        po.setStatus("SUBMITTED");
        return PurchaseOrderDto.fromEntity(purchaseOrderRepository.save(po));
    }

    @Transactional
    public PurchaseOrderDto approvePurchaseOrder(Long id, Long userId) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));

        if (!"SUBMITTED".equalsIgnoreCase(po.getStatus()) && !"DRAFT".equalsIgnoreCase(po.getStatus())) {
            throw new InvalidOperationException("Purchase order cannot be approved from status: " + po.getStatus());
        }

        po.setStatus("APPROVED");
        po.setApprovedBy(userId);
        return PurchaseOrderDto.fromEntity(purchaseOrderRepository.save(po));
    }

    @Transactional
    public PurchaseOrderDto receivePurchaseOrder(Long id, PurchaseOrderDto.ReceivePoRequest request, Long userId) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));

        if (!"APPROVED".equalsIgnoreCase(po.getStatus()) && !"PARTIALLY_RECEIVED".equalsIgnoreCase(po.getStatus())) {
            throw new InvalidOperationException("Goods can only be received against APPROVED or PARTIALLY_RECEIVED purchase orders");
        }

        for (PurchaseOrderDto.ReceivePoRequest.ItemReceipt receipt : request.getItems()) {
            PurchaseOrderItem item = po.getItems().stream()
                    .filter(i -> i.getProduct().getId().equals(receipt.getProductId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Product " + receipt.getProductId() + " not in this PO"));

            if (receipt.getQuantityReceived() > 0) {
                item.setReceivedQty(item.getReceivedQty() + receipt.getQuantityReceived());

                // Auto-increment warehouse inventory via StockIn
                StockInRequest stockIn = StockInRequest.builder()
                        .productId(item.getProduct().getId())
                        .locationType("WAREHOUSE")
                        .locationId(po.getWarehouse().getId())
                        .quantity(receipt.getQuantityReceived())
                        .unitCost(item.getUnitPrice())
                        .referenceType("PURCHASE_ORDER")
                        .referenceId(po.getPoNumber())
                        .notes("Goods receipt note (GRN) for PO " + po.getPoNumber())
                        .build();

                inventoryService.stockIn(stockIn, userId);
            }
        }

        // Determine if all items are fully received
        boolean allComplete = true;
        for (PurchaseOrderItem item : po.getItems()) {
            if (item.getReceivedQty() < item.getOrderedQty()) {
                allComplete = false;
                break;
            }
        }

        po.setStatus(allComplete ? "RECEIVED" : "PARTIALLY_RECEIVED");
        po.setActualDeliveryDate(LocalDate.now());

        return PurchaseOrderDto.fromEntity(purchaseOrderRepository.save(po));
    }

    @Transactional
    public PurchaseOrderDto cancelPurchaseOrder(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));

        if ("RECEIVED".equalsIgnoreCase(po.getStatus())) {
            throw new InvalidOperationException("Cannot cancel a fully received purchase order");
        }

        po.setStatus("CANCELLED");
        return PurchaseOrderDto.fromEntity(purchaseOrderRepository.save(po));
    }
}
