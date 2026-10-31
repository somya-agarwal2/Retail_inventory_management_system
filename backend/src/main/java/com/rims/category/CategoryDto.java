package com.rims.category;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
    private Long id;

    @NotBlank(message = "Category code is required")
    private String code;

    @NotBlank(message = "Category name is required")
    private String name;

    private String description;
    private Long parentId;
    @Builder.Default
    private boolean active = true;
    private Instant createdAt;
    private Instant updatedAt;
    private long productCount;

    public static CategoryDto fromEntity(Category category, long count) {
        return CategoryDto.builder()
                .id(category.getId())
                .code(category.getCode())
                .name(category.getName())
                .description(category.getDescription())
                .parentId(category.getParentId())
                .active(category.isActive())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .productCount(count)
                .build();
    }
}
