package com.rims.inventory;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductIdAndLocationTypeAndLocationId(Long productId, String locationType, Long locationId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.product.id = :productId AND i.locationType = :locationType AND i.locationId = :locationId")
    Optional<Inventory> findWithLock(@Param("productId") Long productId,
                                     @Param("locationType") String locationType,
                                     @Param("locationId") Long locationId);

    List<Inventory> findByLocationTypeAndLocationId(String locationType, Long locationId);

    List<Inventory> findByProductId(Long productId);

    @Query("SELECT i FROM Inventory i WHERE i.currentStock <= i.reorderPoint")
    List<Inventory> findLowStockItems();

    @Query("SELECT COALESCE(SUM(i.currentStock), 0) FROM Inventory i WHERE i.product.id = :productId")
    Integer sumCurrentStockByProductId(@Param("productId") Long productId);

    @Query("SELECT COALESCE(SUM(i.currentStock), 0) FROM Inventory i")
    Long sumTotalInventoryUnits();

    @Query("SELECT COALESCE(SUM(CAST(i.currentStock AS bigdecimal) * i.product.purchasePrice), 0.0) FROM Inventory i")
    BigDecimal sumTotalInventoryValuation();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.currentStock <= i.reorderPoint AND i.currentStock > 0")
    long countLowStockItems();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.currentStock = 0")
    long countOutOfStockItems();

    @Query("SELECT i FROM Inventory i WHERE " +
           "(:productId IS NULL OR i.product.id = :productId) AND " +
           "(:locationType IS NULL OR i.locationType = :locationType) AND " +
           "(:locationId IS NULL OR i.locationId = :locationId) AND " +
           "(:isLowStock IS NULL OR (:isLowStock = true AND i.currentStock <= i.reorderPoint))")
    Page<Inventory> findFilteredInventory(@Param("productId") Long productId,
                                          @Param("locationType") String locationType,
                                          @Param("locationId") Long locationId,
                                          @Param("isLowStock") Boolean isLowStock,
                                          Pageable pageable);
}
