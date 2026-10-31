package com.rims.inventory;

import com.rims.product.Product;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "inventory", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"product_id", "location_type", "location_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "location_type", nullable = false, length = 20)
    private String locationType; // WAREHOUSE, STORE

    @Column(name = "location_id", nullable = false)
    private Long locationId;

    @Column(name = "current_stock", nullable = false)
    @Builder.Default
    private Integer currentStock = 0;

    @Column(name = "reserved_stock", nullable = false)
    @Builder.Default
    private Integer reservedStock = 0;

    @Column(name = "reorder_point", nullable = false)
    @Builder.Default
    private Integer reorderPoint = 20;

    @Column(name = "safety_stock", nullable = false)
    @Builder.Default
    private Integer safetyStock = 5;

    @Column(name = "aisle_bin", length = 50)
    private String aisleBin;

    @Column(name = "last_restocked_at")
    private Instant lastRestockedAt;

    @Builder.Default
    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public Integer getAvailableStock() {
        return Math.max(0, (currentStock != null ? currentStock : 0) - (reservedStock != null ? reservedStock : 0));
    }

    @PreUpdate
    @PrePersist
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
