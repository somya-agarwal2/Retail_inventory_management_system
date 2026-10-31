package com.rims.product;

import com.rims.category.Category;
import com.rims.category.CategoryRepository;
import com.rims.common.exception.DuplicateResourceException;
import com.rims.common.exception.InvalidOperationException;
import com.rims.common.exception.ResourceNotFoundException;
import com.rims.common.util.CsvHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CsvHelper csvHelper;

    @Transactional(readOnly = true)
    public Page<ProductDto> getProducts(String search, Long categoryId, String status, Pageable pageable) {
        return productRepository.searchProducts(search, categoryId, status, pageable)
                .map(p -> ProductDto.fromEntity(p, 0));
    }

    @Transactional(readOnly = true)
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return ProductDto.fromEntity(product, 0);
    }

    @Transactional(readOnly = true)
    public ProductDto getProductByBarcode(String barcode) {
        Product product = productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with barcode: " + barcode));
        return ProductDto.fromEntity(product, 0);
    }

    @Transactional(readOnly = true)
    public ProductDto getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU: " + sku));
        return ProductDto.fromEntity(product, 0);
    }

    @Transactional
    public ProductDto createProduct(ProductDto dto) {
        validatePricing(dto);

        if (productRepository.existsBySku(dto.getSku())) {
            throw new DuplicateResourceException("SKU '" + dto.getSku() + "' already exists");
        }
        if (productRepository.existsByBarcode(dto.getBarcode())) {
            throw new DuplicateResourceException("Barcode '" + dto.getBarcode() + "' is already in use");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

        Product product = Product.builder()
                .sku(dto.getSku().toUpperCase().trim())
                .barcode(dto.getBarcode().trim())
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .category(category)
                .brand(dto.getBrand().trim())
                .purchasePrice(dto.getPurchasePrice())
                .sellingPrice(dto.getSellingPrice())
                .imageUrl(dto.getImageUrl())
                .minStockLevel(dto.getMinStockLevel() != null ? dto.getMinStockLevel() : 10)
                .reorderPoint(dto.getReorderPoint() != null ? dto.getReorderPoint() : 25)
                .safetyStock(dto.getSafetyStock() != null ? dto.getSafetyStock() : 5)
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .weightKg(dto.getWeightKg())
                .dimensionsCm(dto.getDimensionsCm())
                .build();

        return ProductDto.fromEntity(productRepository.save(product), 0);
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductDto dto) {
        validatePricing(dto);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (!product.getSku().equalsIgnoreCase(dto.getSku()) && productRepository.existsBySku(dto.getSku())) {
            throw new DuplicateResourceException("SKU '" + dto.getSku() + "' is already in use");
        }
        if (!product.getBarcode().equalsIgnoreCase(dto.getBarcode()) && productRepository.existsByBarcode(dto.getBarcode())) {
            throw new DuplicateResourceException("Barcode '" + dto.getBarcode() + "' is already in use");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

        product.setSku(dto.getSku().toUpperCase().trim());
        product.setBarcode(dto.getBarcode().trim());
        product.setName(dto.getName().trim());
        product.setDescription(dto.getDescription());
        product.setCategory(category);
        product.setBrand(dto.getBrand().trim());
        product.setPurchasePrice(dto.getPurchasePrice());
        product.setSellingPrice(dto.getSellingPrice());
        product.setImageUrl(dto.getImageUrl());
        product.setMinStockLevel(dto.getMinStockLevel());
        product.setReorderPoint(dto.getReorderPoint());
        product.setSafetyStock(dto.getSafetyStock());
        product.setStatus(dto.getStatus());
        product.setWeightKg(dto.getWeightKg());
        product.setDimensionsCm(dto.getDimensionsCm());

        return ProductDto.fromEntity(productRepository.save(product), 0);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        product.setStatus("DISCONTINUED");
        productRepository.save(product);
    }

    @Transactional
    public int bulkImportCsv(MultipartFile file) throws IOException {
        if (!csvHelper.hasCsvFormat(file)) {
            throw new InvalidOperationException("Uploaded file must be a valid CSV file");
        }

        List<ProductDto> dtos = csvHelper.parseProductsCsv(file);
        int importedCount = 0;

        for (ProductDto dto : dtos) {
            if (productRepository.existsBySku(dto.getSku()) || productRepository.existsByBarcode(dto.getBarcode())) {
                continue; // Skip existing SKUs in bulk import to avoid aborting the entire batch
            }
            createProduct(dto);
            importedCount++;
        }
        return importedCount;
    }

    @Transactional(readOnly = true)
    public ByteArrayInputStream exportProductsCsv() throws IOException {
        List<Product> products = productRepository.findAll();
        List<ProductDto> dtos = products.stream()
                .map(p -> ProductDto.fromEntity(p, 0))
                .collect(Collectors.toList());
        return csvHelper.productsToCsv(dtos);
    }

    private void validatePricing(ProductDto dto) {
        if (dto.getSellingPrice() != null && dto.getPurchasePrice() != null) {
            if (dto.getSellingPrice().compareTo(dto.getPurchasePrice()) < 0) {
                throw new InvalidOperationException("Selling price cannot be less than purchase price");
            }
        }
    }
}
