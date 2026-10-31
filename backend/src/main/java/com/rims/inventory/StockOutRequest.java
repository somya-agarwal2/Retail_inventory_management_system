package com.rims.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockOutRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotBlank(message = "Location type is required (WAREHOUSE / STORE)")
    private String locationType;

    @NotNull(message = "Location ID is required")
    private Long locationId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotBlank(message = "Reason is required (e.g. DAMAGED_IN_STORE, EXPIRED, INTERNAL_USE)")
    private String reason;

    private String notes;
}
