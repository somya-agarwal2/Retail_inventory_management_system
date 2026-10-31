package com.rims.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockInRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotBlank(message = "Location type is required (WAREHOUSE / STORE)")
    private String locationType;

    @NotNull(message = "Location ID is required")
    private Long locationId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private BigDecimal unitCost;

    @NotBlank(message = "Reference type is required (e.g. PURCHASE_ORDER, MANUAL)")
    private String referenceType;

    @NotBlank(message = "Reference ID is required")
    private String referenceId;

    private String notes;
}
