package com.rims.transfer;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stock_transfers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTransfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transfer_number", nullable = false, unique = true, length = 100)
    private String transferNumber;

    @Column(name = "source_type", nullable = false, length = 20)
    private String sourceType; // WAREHOUSE, STORE

    @Column(name = "source_id", nullable = false)
    private Long sourceId;

    @Column(name = "destination_type", nullable = false, length = 20)
    private String destinationType; // WAREHOUSE, STORE

    @Column(name = "destination_id", nullable = false)
    private Long destinationId;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, IN_TRANSIT, COMPLETED, CANCELLED

    @Column(name = "initiated_by", nullable = false)
    private Long initiatedBy;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "received_by")
    private Long receivedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "departure_time")
    private Instant departureTime;

    @Column(name = "arrival_time")
    private Instant arrivalTime;

    @OneToMany(mappedBy = "transfer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<StockTransferItem> items = new ArrayList<>();

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
