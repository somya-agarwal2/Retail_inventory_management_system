package com.rims.transfer;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferDto {
    private Long id;
    private String transferNumber;
    private String sourceType;
    private Long sourceId;
    private String sourceName;
    private String destinationType;
    private Long destinationId;
    private String destinationName;
    private String status;
    private Long initiatedBy;
    private Long approvedBy;
    private Long receivedBy;
    private String notes;
    private Instant departureTime;
    private Instant arrivalTime;
    private List<TransferItemDto> items;
    private Instant createdAt;
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransferItemDto {
        private Long id;
        @NotNull(message = "Product ID is required")
        private Long productId;
        private String productSku;
        private String productName;
        @NotNull(message = "Requested quantity is required")
        private Integer requestedQty;
        private Integer shippedQty;
        private Integer receivedQty;
        private String notes;

        public static TransferItemDto fromEntity(StockTransferItem item) {
            return TransferItemDto.builder()
                    .id(item.getId())
                    .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                    .productSku(item.getProduct() != null ? item.getProduct().getSku() : null)
                    .productName(item.getProduct() != null ? item.getProduct().getName() : null)
                    .requestedQty(item.getRequestedQty())
                    .shippedQty(item.getShippedQty())
                    .receivedQty(item.getReceivedQty())
                    .notes(item.getNotes())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateTransferRequest {
        @NotNull(message = "Source location type is required")
        private String sourceType;
        @NotNull(message = "Source location ID is required")
        private Long sourceId;
        @NotNull(message = "Destination location type is required")
        private String destinationType;
        @NotNull(message = "Destination location ID is required")
        private Long destinationId;
        private String notes;
        @NotEmpty(message = "At least one item must be included in the transfer")
        private List<TransferItemDto> items;
    }

    public static TransferDto fromEntity(StockTransfer st, String sourceName, String destName) {
        return TransferDto.builder()
                .id(st.getId())
                .transferNumber(st.getTransferNumber())
                .sourceType(st.getSourceType())
                .sourceId(st.getSourceId())
                .sourceName(sourceName)
                .destinationType(st.getDestinationType())
                .destinationId(st.getDestinationId())
                .destinationName(destName)
                .status(st.getStatus())
                .initiatedBy(st.getInitiatedBy())
                .approvedBy(st.getApprovedBy())
                .receivedBy(st.getReceivedBy())
                .notes(st.getNotes())
                .departureTime(st.getDepartureTime())
                .arrivalTime(st.getArrivalTime())
                .items(st.getItems() != null ? st.getItems().stream().map(TransferItemDto::fromEntity).collect(Collectors.toList()) : List.of())
                .createdAt(st.getCreatedAt())
                .updatedAt(st.getUpdatedAt())
                .build();
    }
}
