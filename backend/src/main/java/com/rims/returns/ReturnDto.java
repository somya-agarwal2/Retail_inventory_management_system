package com.rims.returns;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReturnDto {
    private Long id;
    private String returnNumber;
    private Long orderId;
    private String orderNumber;
    private Long customerId;
    private String customerName;
    private String returnReason;
    private String overallCondition;
    private String status;
    private BigDecimal refundAmount;
    private Long processedBy;
    private List<ReturnItemDto> items;
    private Instant createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReturnItemDto {
        private Long id;
        @NotNull(message = "Product ID is required")
        private Long productId;
        private String productSku;
        private String productName;
        @NotNull(message = "Quantity is required")
        private Integer quantity;
        private String conditionStatus;
        private boolean restocked;
        private String inspectionNotes;

        public static ReturnItemDto fromEntity(ReturnItem item) {
            return ReturnItemDto.builder()
                    .id(item.getId())
                    .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                    .productSku(item.getProduct() != null ? item.getProduct().getSku() : null)
                    .productName(item.getProduct() != null ? item.getProduct().getName() : null)
                    .quantity(item.getQuantity())
                    .conditionStatus(item.getConditionStatus())
                    .restocked(item.isRestocked())
                    .inspectionNotes(item.getInspectionNotes())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateReturnRequest {
        @NotNull(message = "Order ID is required")
        private Long orderId;
        @NotNull(message = "Customer ID is required")
        private Long customerId;
        @NotNull(message = "Return reason is required")
        private String returnReason;
        @NotNull(message = "Condition is required (SELLABLE / DAMAGED / DEFECTIVE)")
        private String overallCondition;
        @NotEmpty(message = "Return must include items")
        private List<ReturnItemDto> items;
    }

    public static ReturnDto fromEntity(ReturnOrder ro) {
        String custName = ro.getCustomer() != null 
                ? ro.getCustomer().getFirstName() + " " + ro.getCustomer().getLastName() 
                : "Customer #" + (ro.getCustomer() != null ? ro.getCustomer().getId() : "");

        return ReturnDto.builder()
                .id(ro.getId())
                .returnNumber(ro.getReturnNumber())
                .orderId(ro.getOrder() != null ? ro.getOrder().getId() : null)
                .orderNumber(ro.getOrder() != null ? ro.getOrder().getOrderNumber() : null)
                .customerId(ro.getCustomer() != null ? ro.getCustomer().getId() : null)
                .customerName(custName)
                .returnReason(ro.getReturnReason())
                .overallCondition(ro.getOverallCondition())
                .status(ro.getStatus())
                .refundAmount(ro.getRefundAmount())
                .processedBy(ro.getProcessedBy())
                .items(ro.getItems() != null ? ro.getItems().stream().map(ReturnItemDto::fromEntity).collect(Collectors.toList()) : List.of())
                .createdAt(ro.getCreatedAt())
                .build();
    }
}
