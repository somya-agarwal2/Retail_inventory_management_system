package com.rims.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryDto {
    private Long id;
    private Long productId;
    private String productSku;
    private String productBarcode;
    private String productName;
    private String categoryName;
    private BigDecimal purchasePrice;
    private BigDecimal sellingPrice;
    private String locationType;
    private Long locationId;
    private String locationName;
    private Integer currentStock;
    private Integer reservedStock;
    private Integer availableStock;
    private Integer reorderPoint;
    private Integer safetyStock;
    private String aisleBin;
    private boolean isLowStock;
    private BigDecimal stockValue;
    private Instant lastRestockedAt;
    private Instant updatedAt;

    public static InventoryDto fromEntity(Inventory inv, String locationName) {
        BigDecimal unitCost = inv.getProduct() != null ? inv.getProduct().getPurchasePrice() : BigDecimal.ZERO;
        BigDecimal totalVal = unitCost.multiply(BigDecimal.valueOf(inv.getCurrentStock()));

        return InventoryDto.builder()
                .id(inv.getId())
                .productId(inv.getProduct() != null ? inv.getProduct().getId() : null)
                .productSku(inv.getProduct() != null ? inv.getProduct().getSku() : null)
                .productBarcode(inv.getProduct() != null ? inv.getProduct().getBarcode() : null)
                .productName(inv.getProduct() != null ? inv.getProduct().getName() : null)
                .categoryName(inv.getProduct() != null && inv.getProduct().getCategory() != null ? inv.getProduct().getCategory().getName() : null)
                .purchasePrice(unitCost)
                .sellingPrice(inv.getProduct() != null ? inv.getProduct().getSellingPrice() : BigDecimal.ZERO)
                .locationType(inv.getLocationType())
                .locationId(inv.getLocationId())
                .locationName(locationName)
                .currentStock(inv.getCurrentStock())
                .reservedStock(inv.getReservedStock())
                .availableStock(inv.getAvailableStock())
                .reorderPoint(inv.getReorderPoint())
                .safetyStock(inv.getSafetyStock())
                .aisleBin(inv.getAisleBin())
                .isLowStock(inv.getCurrentStock() <= inv.getReorderPoint())
                .stockValue(totalVal)
                .lastRestockedAt(inv.getLastRestockedAt())
                .updatedAt(inv.getUpdatedAt())
                .build();
    }
}
