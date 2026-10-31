package com.rims.supplier;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierDto {
    private Long id;

    @NotBlank(message = "Supplier code is required")
    private String code;

    @NotBlank(message = "Supplier name is required")
    private String name;

    @NotBlank(message = "Contact person is required")
    private String contactPerson;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    private String taxId;
    private String paymentTerms;
    private BigDecimal rating;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;

    public static SupplierDto fromEntity(Supplier s) {
        return SupplierDto.builder()
                .id(s.getId())
                .code(s.getCode())
                .name(s.getName())
                .contactPerson(s.getContactPerson())
                .email(s.getEmail())
                .phone(s.getPhone())
                .address(s.getAddress())
                .city(s.getCity())
                .state(s.getState())
                .taxId(s.getTaxId())
                .paymentTerms(s.getPaymentTerms())
                .rating(s.getRating())
                .status(s.getStatus())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
