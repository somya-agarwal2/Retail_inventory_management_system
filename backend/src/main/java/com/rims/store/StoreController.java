package com.rims.store;

import com.rims.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StoreDto>>> getAllStores() {
        return ResponseEntity.ok(ApiResponse.success(storeService.getAllStores()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StoreDto>> getStoreById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(storeService.getStoreById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<StoreDto>> createStore(@Valid @RequestBody StoreDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Store created successfully", storeService.createStore(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<StoreDto>> updateStore(
            @PathVariable Long id,
            @Valid @RequestBody StoreDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Store updated successfully", storeService.updateStore(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteStore(@PathVariable Long id) {
        storeService.deleteStore(id);
        return ResponseEntity.ok(ApiResponse.success("Store deactivated successfully", null));
    }
}
