package com.rims.stock;

import com.rims.product.Product;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "stock_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_ref", nullable = false, unique = true, length = 100)
    private String transactionRef;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "location_type", nullable = false, length = 20)
    private String locationType; // WAREHOUSE, STORE

    @Column(name = "location_id", nullable = false)
    private Long locationId;

    @Column(name = "transaction_type", nullable = false, length = 30)
    private String transactionType; // STOCK_IN, STOCK_OUT, TRANSFER_IN, TRANSFER_OUT, ADJUSTMENT_ADD, ADJUSTMENT_SUBTRACT, ORDER_RESERVE, ORDER_RELEASE, ORDER_FULFILL, RETURN_RESTOCK, DAMAGE_WRITEOFF

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "balance_after", nullable = false)
    private Integer balanceAfter;

    @Column(name = "unit_cost", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal unitCost = BigDecimal.ZERO;

    @Column(name = "reference_type", nullable = false, length = 50)
    private String referenceType; // PURCHASE_ORDER, CUSTOMER_ORDER, STOCK_TRANSFER, MANUAL_AUDIT, RETURN_RMA

    @Column(name = "reference_id", nullable = false, length = 100)
    private String referenceId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "performed_by_user_id")
    private Long performedByUserId;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
