package com.rims.transfer;

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
@RequestMapping("/api/v1/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<TransferDto>>> getTransfers(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sourceType,
            @RequestParam(required = false) Long sourceId,
            @RequestParam(required = false) String destType,
            @RequestParam(required = false) Long destId,
            @PageableDefault(size = 10, sort = "createdAt,desc") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.from(
                transferService.getTransfers(status, sourceType, sourceId, destType, destId, pageable))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransferDto>> getTransferById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(transferService.getTransferById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'STORE_MANAGER')")
    public ResponseEntity<ApiResponse<TransferDto>> createTransfer(
            @Valid @RequestBody TransferDto.CreateTransferRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 1L;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Transfer initiated successfully", transferService.createTransfer(request, userId)));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<ApiResponse<TransferDto>> approveTransfer(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 1L;
        return ResponseEntity.ok(ApiResponse.success("Transfer approved", transferService.approveTransfer(id, userId)));
    }

    @PutMapping("/{id}/dispatch")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'STORE_MANAGER')")
    public ResponseEntity<ApiResponse<TransferDto>> dispatchTransfer(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 1L;
        return ResponseEntity.ok(ApiResponse.success("Transfer dispatched and in transit", transferService.dispatchTransfer(id, userId)));
    }

    @PutMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'STORE_MANAGER')")
    public ResponseEntity<ApiResponse<TransferDto>> receiveTransfer(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 1L;
        return ResponseEntity.ok(ApiResponse.success("Transfer received and inventory updated", transferService.receiveTransfer(id, userId)));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'STORE_MANAGER')")
    public ResponseEntity<ApiResponse<TransferDto>> cancelTransfer(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 1L;
        return ResponseEntity.ok(ApiResponse.success("Transfer cancelled", transferService.cancelTransfer(id, userId)));
    }
}
