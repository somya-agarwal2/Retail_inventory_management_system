package com.rims.integration;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "integration_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntegrationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "integration_id", nullable = false)
    private IntegrationConfig integration;

    @Column(name = "sync_type", nullable = false, length = 50)
    private String syncType; // INBOUND_PRODUCTS, OUTBOUND_ORDERS, ACCOUNTING_LEDGER

    @Column(nullable = false, length = 30)
    private String status; // SUCCESS, FAILED, RETRYING

    @Column(name = "records_processed", nullable = false)
    @Builder.Default
    private Integer recordsProcessed = 0;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "payload_summary", columnDefinition = "TEXT")
    private String payloadSummary;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;
}
