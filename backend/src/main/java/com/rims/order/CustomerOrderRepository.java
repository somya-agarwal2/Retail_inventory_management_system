package com.rims.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    Optional<CustomerOrder> findByOrderNumber(String orderNumber);

    @Query("SELECT o FROM CustomerOrder o WHERE " +
           "(:customerId IS NULL OR o.customer.id = :customerId) AND " +
           "(:locationType IS NULL OR o.fulfillmentLocationType = :locationType) AND " +
           "(:locationId IS NULL OR o.fulfillmentLocationId = :locationId) AND " +
           "(:status IS NULL OR o.status = :status)")
    Page<CustomerOrder> findFilteredOrders(
            @Param("customerId") Long customerId,
            @Param("locationType") String locationType,
            @Param("locationId") Long locationId,
            @Param("status") String status,
            Pageable pageable);

    @Query("SELECT COUNT(o) FROM CustomerOrder o WHERE o.status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'PICKED', 'PACKED')")
    long countPendingOrders();

    @Query("SELECT COUNT(o) FROM CustomerOrder o WHERE o.status IN ('SHIPPED', 'DELIVERED')")
    long countCompletedOrders();
}
