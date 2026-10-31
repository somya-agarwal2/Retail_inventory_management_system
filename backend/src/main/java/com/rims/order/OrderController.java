package com.rims.order;

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

import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<OrderDto>>> getOrders(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String locationType,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10, sort = "orderDate,desc") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.from(
                orderService.getOrders(customerId, locationType, locationId, status, pageable))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF')")
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(
            @Valid @RequestBody OrderDto.CreateOrderRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 1L;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created and stock reserved successfully", 
                        orderService.createOrder(request, userId)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER', 'WAREHOUSE_MANAGER', 'SALES_STAFF')")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 1L;
        String newStatus = body.get("status");
        String comment = body.get("comment");
        return ResponseEntity.ok(ApiResponse.success("Order status updated", 
                orderService.updateStatus(id, newStatus, comment, userId)));
    }

    @PutMapping("/{id}/ship")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'STORE_MANAGER')")
    public ResponseEntity<ApiResponse<OrderDto>> shipOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 1L;
        return ResponseEntity.ok(ApiResponse.success("Order dispatched and inventory deducted", 
                orderService.shipOrder(id, userId)));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF')")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 1L;
        String reason = body != null ? body.get("reason") : "Customer requested cancellation";
        return ResponseEntity.ok(ApiResponse.success("Order cancelled and reserved stock restored", 
                orderService.cancelOrder(id, reason, userId)));
    }
}
