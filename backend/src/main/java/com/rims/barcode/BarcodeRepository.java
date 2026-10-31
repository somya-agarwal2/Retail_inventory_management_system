package com.rims.barcode;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BarcodeRepository extends JpaRepository<BarcodeRecord, Long> {
    Optional<BarcodeRecord> findByBarcodeValue(String barcodeValue);
    Optional<BarcodeRecord> findByProductId(Long productId);
}
