package com.rims.store;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreDto {
    private Long id;

    @NotBlank(message = "Store code is required")
    private String code;

    @NotBlank(message = "Store name is required")
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Postal code is required")
    private String postalCode;

    private String storeManager;
    private String phone;
    private String email;

    @Builder.Default
    private boolean active = true;
    private Instant createdAt;
    private Instant updatedAt;

    public static StoreDto fromEntity(Store store) {
        return StoreDto.builder()
                .id(store.getId())
                .code(store.getCode())
                .name(store.getName())
                .address(store.getAddress())
                .city(store.getCity())
                .state(store.getState())
                .postalCode(store.getPostalCode())
                .storeManager(store.getStoreManager())
                .phone(store.getPhone())
                .email(store.getEmail())
                .active(store.isActive())
                .createdAt(store.getCreatedAt())
                .updatedAt(store.getUpdatedAt())
                .build();
    }
}
