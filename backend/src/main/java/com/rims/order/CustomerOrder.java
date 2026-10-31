package com.rims.order;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customer_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 100)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "fulfillment_location_type", nullable = false, length = 20)
    private String fulfillmentLocationType; // WAREHOUSE, STORE

    @Column(name = "fulfillment_location_id", nullable = false)
    private Long fulfillmentLocationId;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING"; 
    // PENDING, CONFIRMED, PROCESSING, PICKED, PACKED, SHIPPED, DELIVERED, CANCELLED, RETURN_REQUESTED, RETURNED, REFUNDED

    @Column(name = "payment_status", length = 20)
    @Builder.Default
    private String paymentStatus = "PAID"; // PAID, PENDING, REFUNDED

    @Column(nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "shipping_cost", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal shippingCost = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "shipping_carrier", length = 100)
    @Builder.Default
    private String shippingCarrier = "BlueDart Express";

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    @Builder.Default
    @Column(name = "order_date", nullable = false)
    private Instant orderDate = Instant.now();

    @Column(name = "shipped_date")
    private Instant shippedDate;

    @Column(name = "delivered_date")
    private Instant deliveredDate;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderStatusHistory> statusHistory = new ArrayList<>();

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Builder.Default
    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
