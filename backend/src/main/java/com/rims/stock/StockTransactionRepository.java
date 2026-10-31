package com.rims.stock;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {

    @Query("SELECT st FROM StockTransaction st WHERE " +
           "(:productId IS NULL OR st.product.id = :productId) AND " +
           "(:locationType IS NULL OR st.locationType = :locationType) AND " +
           "(:locationId IS NULL OR st.locationId = :locationId) AND " +
           "(:txType IS NULL OR st.transactionType = :txType) AND " +
           "(:startDate IS NULL OR st.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR st.createdAt <= :endDate)")
    Page<StockTransaction> findFilteredTransactions(
            @Param("productId") Long productId,
            @Param("locationType") String locationType,
            @Param("locationId") Long locationId,
            @Param("txType") String txType,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            Pageable pageable);

    List<StockTransaction> findTop15ByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(st) FROM StockTransaction st WHERE st.transactionType = 'STOCK_IN'")
    long countStockInTransactions();

    @Query("SELECT COUNT(st) FROM StockTransaction st WHERE st.transactionType = 'STOCK_OUT'")
    long countStockOutTransactions();
}
