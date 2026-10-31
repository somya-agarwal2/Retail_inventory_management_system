package com.rims.rfid;

import com.rims.product.Product;
import com.rims.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class RfidService {

    private final RfidScanLogRepository scanLogRepository;
    private final ProductRepository productRepository;
    private final SimulatedRfidReader simulatedReader;
    private final Random random = new Random();

    @Transactional(readOnly = true)
    public List<RfidScanLog> getRecentScans() {
        return scanLogRepository.findTop20ByOrderByScanTimestampDesc();
    }

    @Transactional(readOnly = true)
    public Page<RfidScanLog> getAllScans(Pageable pageable) {
        return scanLogRepository.findAllByOrderByScanTimestampDesc(pageable);
    }

    @Transactional
    public List<RfidScanLog> simulateDockScan(String locationType, Long locationId, String scanType, Long userId) {
        List<Product> products = productRepository.findAll();
        if (products.isEmpty()) {
            return List.of();
        }

        List<RfidAdapter.RfidTagResult> rawTags = simulatedReader.readTags("ANT-01", 1000);
        List<RfidScanLog> savedLogs = new ArrayList<>();

        for (RfidAdapter.RfidTagResult tag : rawTags) {
            Product randomProduct = products.get(random.nextInt(products.size()));

            RfidScanLog log = RfidScanLog.builder()
                    .epcTag(tag.epcTag())
                    .product(randomProduct)
                    .locationType(locationType != null ? locationType : "WAREHOUSE")
                    .locationId(locationId != null ? locationId : 1L)
                    .scanType(scanType != null ? scanType : "INBOUND_DOCK")
                    .scannedBy(userId)
                    .signalStrengthRssi(tag.rssi())
                    .build();

            savedLogs.add(scanLogRepository.save(log));
        }

        return savedLogs;
    }
}
