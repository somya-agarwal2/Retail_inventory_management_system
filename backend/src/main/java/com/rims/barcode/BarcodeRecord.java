package com.rims.barcode;

import com.rims.product.Product;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "barcode_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BarcodeRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "barcode_value", nullable = false, unique = true, length = 100)
    private String barcodeValue;

    @Column(name = "barcode_format", length = 30)
    @Builder.Default
    private String barcodeFormat = "CODE_128";

    @Builder.Default
    @Column(name = "generated_date", nullable = false)
    private Instant generatedDate = Instant.now();

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;
}
