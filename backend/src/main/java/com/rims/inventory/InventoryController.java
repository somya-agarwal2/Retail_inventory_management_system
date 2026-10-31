package com.rims.inventory;

import com.rims.common.response.ApiResponse;
import com.rims.common.response.PagedResponse;
import com.rims.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<InventoryDto>>> getInventory(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) String locationType,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) Boolean isLowStock,
            @PageableDefault(size = 15, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.from(
                inventoryService.getInventory(productId, locationType, locationId, isLowStock, pageable))));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<InventoryDto>> getProductInventory(
            @PathVariable Long productId,
            @RequestParam String locationType,
            @RequestParam Long locationId) {
        return ResponseEntity.ok(ApiResponse.success(
                inventoryService.getProductInventory(productId, locationType, locationId)));
    }

    @PostMapping("/stock-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'STORE_MANAGER', 'INVENTORY_STAFF')")
    public ResponseEntity<ApiResponse<InventoryDto>> stockIn(
            @Valid @RequestBody StockInRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 1L;
        return ResponseEntity.ok(ApiResponse.success("Stock-in completed successfully", 
                inventoryService.stockIn(request, userId)));
    }

    @PostMapping("/stock-out")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'STORE_MANAGER', 'INVENTORY_STAFF')")
    public ResponseEntity<ApiResponse<InventoryDto>> stockOut(
            @Valid @RequestBody StockOutRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 1L;
        return ResponseEntity.ok(ApiResponse.success("Stock-out completed successfully", 
                inventoryService.stockOut(request, userId)));
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'STORE_MANAGER')")
    public ResponseEntity<ApiResponse<InventoryDto>> adjustStock(
            @Valid @RequestBody StockAdjustmentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 1L;
        return ResponseEntity.ok(ApiResponse.success("Stock count adjusted successfully", 
                inventoryService.adjustStock(request, userId)));
    }
}
