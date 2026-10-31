package com.rims.stock;

import com.rims.common.response.ApiResponse;
import com.rims.common.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/transactions")
@RequiredArgsConstructor
public class StockTransactionController {

    private final StockTransactionRepository stockTransactionRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<StockTransaction>>> getTransactions(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) String locationType,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) String txType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @PageableDefault(size = 20, sort = "createdAt,desc") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.from(
                stockTransactionRepository.findFilteredTransactions(productId, locationType, locationId, txType, startDate, endDate, pageable))));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<StockTransaction>>> getRecentTransactions() {
        return ResponseEntity.ok(ApiResponse.success(stockTransactionRepository.findTop15ByOrderByCreatedAtDesc()));
    }
}
