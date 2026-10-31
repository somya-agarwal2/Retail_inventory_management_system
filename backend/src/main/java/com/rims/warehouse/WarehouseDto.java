package com.rims.warehouse;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseDto {
    private Long id;

    @NotBlank(message = "Warehouse code is required")
    private String code;

    @NotBlank(message = "Warehouse name is required")
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Postal code is required")
    private String postalCode;

    private String contactPerson;
    private String phone;
    private String email;

    @NotNull(message = "Capacity (sqft) is required")
    private Integer capacitySqft;

    @Builder.Default
    private boolean active = true;
    private Instant createdAt;
    private Instant updatedAt;

    public static WarehouseDto fromEntity(Warehouse warehouse) {
        return WarehouseDto.builder()
                .id(warehouse.getId())
                .code(warehouse.getCode())
                .name(warehouse.getName())
                .address(warehouse.getAddress())
                .city(warehouse.getCity())
                .state(warehouse.getState())
                .postalCode(warehouse.getPostalCode())
                .contactPerson(warehouse.getContactPerson())
                .phone(warehouse.getPhone())
                .email(warehouse.getEmail())
                .capacitySqft(warehouse.getCapacitySqft())
                .active(warehouse.isActive())
                .createdAt(warehouse.getCreatedAt())
                .updatedAt(warehouse.getUpdatedAt())
                .build();
    }
}
