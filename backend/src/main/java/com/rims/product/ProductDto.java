package com.rims.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {

    private Long id;

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotBlank(message = "Barcode is required")
    private String barcode;

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private String categoryName;
    private String categoryCode;

    @NotBlank(message = "Brand is required")
    private String brand;

    @NotNull(message = "Purchase price is required")
    @DecimalMin(value = "0.0", message = "Purchase price must be positive")
    private BigDecimal purchasePrice;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.0", message = "Selling price must be positive")
    private BigDecimal sellingPrice;

    private String imageUrl;

    @Builder.Default
    private Integer minStockLevel = 10;

    @Builder.Default
    private Integer reorderPoint = 25;

    @Builder.Default
    private Integer safetyStock = 5;

    @Builder.Default
    private String status = "ACTIVE";

    private BigDecimal weightKg;
    private String dimensionsCm;
    private Instant createdAt;
    private Instant updatedAt;
    private Integer totalStock;

    public static ProductDto fromEntity(Product product, Integer totalStock) {
        return ProductDto.builder()
                .id(product.getId())
                .sku(product.getSku())
                .barcode(product.getBarcode())
                .name(product.getName())
                .description(product.getDescription())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categoryCode(product.getCategory() != null ? product.getCategory().getCode() : null)
                .brand(product.getBrand())
                .purchasePrice(product.getPurchasePrice())
                .sellingPrice(product.getSellingPrice())
                .imageUrl(product.getImageUrl())
                .minStockLevel(product.getMinStockLevel())
                .reorderPoint(product.getReorderPoint())
                .safetyStock(product.getSafetyStock())
                .status(product.getStatus())
                .weightKg(product.getWeightKg())
                .dimensionsCm(product.getDimensionsCm())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .totalStock(totalStock)
                .build();
    }
}
