package com.rims.purchaseorder;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderDto {
    private Long id;
    private String poNumber;
    private Long supplierId;
    private String supplierName;
    private String supplierCode;
    private Long warehouseId;
    private String warehouseName;
    private String status;
    private LocalDate orderDate;
    private LocalDate expectedDeliveryDate;
    private LocalDate actualDeliveryDate;
    private BigDecimal totalAmount;
    private String notes;
    private Long createdBy;
    private Long approvedBy;
    private List<PoItemDto> items;
    private Instant createdAt;
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PoItemDto {
        private Long id;
        @NotNull(message = "Product ID is required")
        private Long productId;
        private String productSku;
        private String productName;
        @NotNull(message = "Ordered quantity is required")
        private Integer orderedQty;
        private Integer receivedQty;
        @NotNull(message = "Unit price is required")
        private BigDecimal unitPrice;
        private BigDecimal lineTotal;

        public static PoItemDto fromEntity(PurchaseOrderItem item) {
            return PoItemDto.builder()
                    .id(item.getId())
                    .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                    .productSku(item.getProduct() != null ? item.getProduct().getSku() : null)
                    .productName(item.getProduct() != null ? item.getProduct().getName() : null)
                    .orderedQty(item.getOrderedQty())
                    .receivedQty(item.getReceivedQty())
                    .unitPrice(item.getUnitPrice())
                    .lineTotal(item.getLineTotal())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePoRequest {
        @NotNull(message = "Supplier ID is required")
        private Long supplierId;
        @NotNull(message = "Warehouse ID is required")
        private Long warehouseId;
        private LocalDate expectedDeliveryDate;
        private String notes;
        @NotEmpty(message = "Items list cannot be empty")
        private List<PoItemDto> items;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReceivePoRequest {
        @NotNull(message = "Received items list cannot be empty")
        private List<ItemReceipt> items;
        private String notes;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class ItemReceipt {
            @NotNull(message = "Product ID is required")
            private Long productId;
            @NotNull(message = "Received quantity is required")
            private Integer quantityReceived;
        }
    }

    public static PurchaseOrderDto fromEntity(PurchaseOrder po) {
        return PurchaseOrderDto.builder()
                .id(po.getId())
                .poNumber(po.getPoNumber())
                .supplierId(po.getSupplier() != null ? po.getSupplier().getId() : null)
                .supplierName(po.getSupplier() != null ? po.getSupplier().getName() : null)
                .supplierCode(po.getSupplier() != null ? po.getSupplier().getCode() : null)
                .warehouseId(po.getWarehouse() != null ? po.getWarehouse().getId() : null)
                .warehouseName(po.getWarehouse() != null ? po.getWarehouse().getName() : null)
                .status(po.getStatus())
                .orderDate(po.getOrderDate())
                .expectedDeliveryDate(po.getExpectedDeliveryDate())
                .actualDeliveryDate(po.getActualDeliveryDate())
                .totalAmount(po.getTotalAmount())
                .notes(po.getNotes())
                .createdBy(po.getCreatedBy())
                .approvedBy(po.getApprovedBy())
                .items(po.getItems() != null ? po.getItems().stream().map(PoItemDto::fromEntity).collect(Collectors.toList()) : List.of())
                .createdAt(po.getCreatedAt())
                .updatedAt(po.getUpdatedAt())
                .build();
    }
}
