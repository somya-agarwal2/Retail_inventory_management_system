package com.rims.transfer;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.rims.product.Product;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stock_transfer_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTransferItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transfer_id", nullable = false)
    private StockTransfer transfer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "requested_qty", nullable = false)
    private Integer requestedQty;

    @Column(name = "shipped_qty")
    @Builder.Default
    private Integer shippedQty = 0;

    @Column(name = "received_qty")
    @Builder.Default
    private Integer receivedQty = 0;

    @Column(length = 255)
    private String notes;
}
