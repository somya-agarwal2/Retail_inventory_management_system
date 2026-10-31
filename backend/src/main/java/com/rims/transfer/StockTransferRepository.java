package com.rims.transfer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StockTransferRepository extends JpaRepository<StockTransfer, Long> {
    Optional<StockTransfer> findByTransferNumber(String transferNumber);

    @Query("SELECT st FROM StockTransfer st WHERE " +
           "(:status IS NULL OR st.status = :status) AND " +
           "(:sourceType IS NULL OR st.sourceType = :sourceType) AND " +
           "(:sourceId IS NULL OR st.sourceId = :sourceId) AND " +
           "(:destinationType IS NULL OR st.destinationType = :destinationType) AND " +
           "(:destinationId IS NULL OR st.destinationId = :destinationId)")
    Page<StockTransfer> findFilteredTransfers(
            @Param("status") String status,
            @Param("sourceType") String sourceType,
            @Param("sourceId") Long sourceId,
            @Param("destinationType") String destinationType,
            @Param("destinationId") Long destinationId,
            Pageable pageable);
}
