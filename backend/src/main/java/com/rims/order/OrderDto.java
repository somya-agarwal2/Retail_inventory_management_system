package com.rims.order;

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
public class OrderDto {
    private Long id;
    private String orderNumber;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String shippingAddress;
    private String fulfillmentLocationType;
    private Long fulfillmentLocationId;
    private String fulfillmentLocationName;
    private String status;
    private String paymentStatus;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal shippingCost;
    private BigDecimal totalAmount;
    private String shippingCarrier;
    private String trackingNumber;
    private Instant orderDate;
    private Instant shippedDate;
    private Instant deliveredDate;
    private List<OrderItemDto> items;
    private Instant createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDto {
        private Long id;
        @NotNull(message = "Product ID is required")
        private Long productId;
        private String productSku;
        private String productName;
        @NotNull(message = "Quantity is required")
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal lineTotal;
        private Integer allocatedQty;
        private Integer fulfilledQty;

        public static OrderItemDto fromEntity(OrderItem item) {
            return OrderItemDto.builder()
                    .id(item.getId())
                    .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                    .productSku(item.getProduct() != null ? item.getProduct().getSku() : null)
                    .productName(item.getProduct() != null ? item.getProduct().getName() : null)
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .lineTotal(item.getLineTotal())
                    .allocatedQty(item.getAllocatedQty())
                    .fulfilledQty(item.getFulfilledQty())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateOrderRequest {
        @NotNull(message = "Customer ID is required")
        private Long customerId;
        @NotNull(message = "Fulfillment location type is required (WAREHOUSE / STORE)")
        private String fulfillmentLocationType;
        @NotNull(message = "Fulfillment location ID is required")
        private Long fulfillmentLocationId;
        private String shippingCarrier;
        @NotEmpty(message = "Order must contain at least one item")
        private List<OrderItemDto> items;
    }

    public static OrderDto fromEntity(CustomerOrder order, String locationName) {
        String custName = order.getCustomer() != null 
                ? order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName() 
                : "Walk-in Customer";

        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .customerName(custName)
                .customerEmail(order.getCustomer() != null ? order.getCustomer().getEmail() : null)
                .customerPhone(order.getCustomer() != null ? order.getCustomer().getPhone() : null)
                .shippingAddress(order.getCustomer() != null ? order.getCustomer().getShippingAddress() : null)
                .fulfillmentLocationType(order.getFulfillmentLocationType())
                .fulfillmentLocationId(order.getFulfillmentLocationId())
                .fulfillmentLocationName(locationName)
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .subtotal(order.getSubtotal())
                .taxAmount(order.getTaxAmount())
                .shippingCost(order.getShippingCost())
                .totalAmount(order.getTotalAmount())
                .shippingCarrier(order.getShippingCarrier())
                .trackingNumber(order.getTrackingNumber())
                .orderDate(order.getOrderDate())
                .shippedDate(order.getShippedDate())
                .deliveredDate(order.getDeliveredDate())
                .items(order.getItems() != null ? order.getItems().stream().map(OrderItemDto::fromEntity).collect(Collectors.toList()) : List.of())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
