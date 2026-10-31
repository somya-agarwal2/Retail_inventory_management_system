package com.rims.purchaseorder;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Optional<PurchaseOrder> findByPoNumber(String poNumber);

    @Query("SELECT po FROM PurchaseOrder po WHERE " +
           "(:supplierId IS NULL OR po.supplier.id = :supplierId) AND " +
           "(:warehouseId IS NULL OR po.warehouse.id = :warehouseId) AND " +
           "(:status IS NULL OR po.status = :status)")
    Page<PurchaseOrder> findFilteredPurchaseOrders(
            @Param("supplierId") Long supplierId,
            @Param("warehouseId") Long warehouseId,
            @Param("status") String status,
            Pageable pageable);

    @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE po.status = 'RECEIVED'")
    long countCompletedPurchaseOrders();

    @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE po.status IN ('SUBMITTED', 'APPROVED', 'PARTIALLY_RECEIVED')")
    long countPendingPurchaseOrders();
}
