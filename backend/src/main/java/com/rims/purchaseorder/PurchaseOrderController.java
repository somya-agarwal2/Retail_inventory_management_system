package com.rims.purchaseorder;

import com.rims.common.response.ApiResponse;
import com.rims.common.response.PagedResponse;
import com.rims.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<PurchaseOrderDto>>> getPurchaseOrders(
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10, sort = "orderDate,desc") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.from(
                purchaseOrderService.getPurchaseOrders(supplierId, warehouseId, status, pageable))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> getPurchaseOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(purchaseOrderService.getPurchaseOrderById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PROCUREMENT_MANAGER')")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> createPurchaseOrder(
            @Valid @RequestBody PurchaseOrderDto.CreatePoRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 1L;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Purchase order created in DRAFT state", 
                        purchaseOrderService.createPurchaseOrder(request, userId)));
    }

    @PutMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PROCUREMENT_MANAGER')")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> submitPurchaseOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Purchase order submitted for approval", 
                purchaseOrderService.submitPurchaseOrder(id)));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PROCUREMENT_MANAGER')")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> approvePurchaseOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 1L;
        return ResponseEntity.ok(ApiResponse.success("Purchase order approved", 
                purchaseOrderService.approvePurchaseOrder(id, userId)));
    }

    @PostMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_STAFF')")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> receivePurchaseOrder(
            @PathVariable Long id,
            @Valid @RequestBody PurchaseOrderDto.ReceivePoRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 1L;
        return ResponseEntity.ok(ApiResponse.success("Goods received and inventory automatically updated", 
                purchaseOrderService.receivePurchaseOrder(id, request, userId)));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PROCUREMENT_MANAGER')")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> cancelPurchaseOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Purchase order cancelled", 
                purchaseOrderService.cancelPurchaseOrder(id)));
    }
}
