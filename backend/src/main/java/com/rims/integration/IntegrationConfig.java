package com.rims.integration;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "integration_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntegrationConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "system_name", nullable = false, unique = true, length = 100)
    private String systemName;

    @Column(name = "system_type", nullable = false, length = 50)
    private String systemType; // ERP, ACCOUNTING, LOGISTICS

    @Column(name = "is_enabled", nullable = false)
    @Builder.Default
    private boolean enabled = true;

    @Column(name = "api_endpoint", nullable = false)
    private String apiEndpoint;

    @Column(name = "auth_type", nullable = false, length = 30)
    @Builder.Default
    private String authType = "API_KEY"; // API_KEY, OAUTH2, BEARER_TOKEN

    @Column(name = "api_key_masked", length = 50)
    private String apiKeyMasked;

    @Column(name = "sync_frequency_minutes", nullable = false)
    @Builder.Default
    private Integer syncFrequencyMinutes = 30;

    @Column(name = "last_sync_at")
    private Instant lastSyncAt;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "HEALTHY"; // HEALTHY, DEGRADED, OFFLINE

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
