package com.rims.category;

import com.rims.common.exception.DuplicateResourceException;
import com.rims.common.exception.ResourceNotFoundException;
import com.rims.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAllByOrderByCreatedAtAsc().stream()
                .map(cat -> {
                    long count = productRepository.countByCategoryId(cat.getId());
                    return CategoryDto.fromEntity(cat, count);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        long count = productRepository.countByCategoryId(category.getId());
        return CategoryDto.fromEntity(category, count);
    }

    @Transactional
    public CategoryDto createCategory(CategoryDto dto) {
        if (categoryRepository.existsByCode(dto.getCode())) {
            throw new DuplicateResourceException("Category code '" + dto.getCode() + "' already exists");
        }

        Category category = Category.builder()
                .code(dto.getCode().toUpperCase().trim())
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .parentId(dto.getParentId())
                .active(dto.isActive())
                .build();

        Category saved = categoryRepository.save(category);
        return CategoryDto.fromEntity(saved, 0);
    }

    @Transactional
    public CategoryDto updateCategory(Long id, CategoryDto dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (!category.getCode().equalsIgnoreCase(dto.getCode()) && categoryRepository.existsByCode(dto.getCode())) {
            throw new DuplicateResourceException("Category code '" + dto.getCode() + "' is already in use");
        }

        category.setCode(dto.getCode().toUpperCase().trim());
        category.setName(dto.getName().trim());
        category.setDescription(dto.getDescription());
        category.setParentId(dto.getParentId());
        category.setActive(dto.isActive());

        Category updated = categoryRepository.save(category);
        long count = productRepository.countByCategoryId(updated.getId());
        return CategoryDto.fromEntity(updated, count);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        category.setActive(false);
        categoryRepository.save(category);
    }
}
