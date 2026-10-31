package com.rims.returns;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.rims.product.Product;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "return_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "return_id", nullable = false)
    private ReturnOrder returnOrder;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "condition_status", nullable = false, length = 30)
    private String conditionStatus; // SELLABLE, DAMAGED, DEFECTIVE

    @Column(name = "is_restocked", nullable = false)
    @Builder.Default
    private boolean restocked = false;

    @Column(name = "inspection_notes", columnDefinition = "TEXT")
    private String inspectionNotes;
}
