package com.rims.returns;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReturnRepository extends JpaRepository<ReturnOrder, Long> {
    Optional<ReturnOrder> findByReturnNumber(String returnNumber);

    @Query("SELECT r FROM ReturnOrder r WHERE " +
           "(:orderId IS NULL OR r.order.id = :orderId) AND " +
           "(:status IS NULL OR r.status = :status)")
    Page<ReturnOrder> findFilteredReturns(@Param("orderId") Long orderId,
                                          @Param("status") String status,
                                          Pageable pageable);
}
