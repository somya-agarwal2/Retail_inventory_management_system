package com.rims.rfid;

import com.rims.product.Product;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "rfid_scan_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RfidScanLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "epc_tag", nullable = false, length = 100)
    private String epcTag;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "location_type", nullable = false, length = 20)
    private String locationType; // WAREHOUSE, STORE

    @Column(name = "location_id", nullable = false)
    private Long locationId;

    @Column(name = "scan_type", nullable = false, length = 30)
    private String scanType; // INBOUND_DOCK, OUTBOUND_DISPATCH, AUDIT_CYCLE

    @Column(name = "scanned_by")
    private Long scannedBy;

    @Column(name = "signal_strength_rssi")
    @Builder.Default
    private Integer signalStrengthRssi = -65;

    @Builder.Default
    @Column(name = "scan_timestamp", nullable = false, updatable = false)
    private Instant scanTimestamp = Instant.now();
}
