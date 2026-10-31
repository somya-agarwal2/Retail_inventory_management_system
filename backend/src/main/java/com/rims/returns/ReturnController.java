package com.rims.returns;

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
@RequestMapping("/api/v1/returns")
@RequiredArgsConstructor
public class ReturnController {

    private final ReturnService returnService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ReturnDto>>> getReturns(
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10, sort = "createdAt,desc") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.from(
                returnService.getReturns(orderId, status, pageable))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReturnDto>> getReturnById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(returnService.getReturnById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF')")
    public ResponseEntity<ApiResponse<ReturnDto>> createReturn(
            @Valid @RequestBody ReturnDto.CreateReturnRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 1L;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Return RMA initiated successfully", 
                        returnService.createReturn(request, userId)));
    }

    @PutMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<ApiResponse<ReturnDto>> inspectAndReceive(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 1L;
        String condition = body != null ? body.get("condition") : "SELLABLE";
        return ResponseEntity.ok(ApiResponse.success("Return inspected, processed and restocked if eligible", 
                returnService.inspectAndReceive(id, condition, userId)));
    }

    @PutMapping("/{id}/refund")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER')")
    public ResponseEntity<ApiResponse<ReturnDto>> refundReturn(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Refund processed successfully", 
                returnService.refundReturn(id)));
    }
}
