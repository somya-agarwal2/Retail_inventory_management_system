package com.rims.inventory;

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
public class StockAdjustmentRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotBlank(message = "Location type is required")
    private String locationType;

    @NotNull(message = "Location ID is required")
    private Long locationId;

    @NotNull(message = "New actual counted stock is required")
    private Integer newActualStock;

    @NotBlank(message = "Reason for audit adjustment is required")
    private String reason;

    private String notes;
}
