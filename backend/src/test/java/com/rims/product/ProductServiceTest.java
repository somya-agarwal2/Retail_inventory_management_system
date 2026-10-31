package com.rims.product;

import com.rims.category.Category;
import com.rims.category.CategoryRepository;
import com.rims.common.exception.DuplicateResourceException;
import com.rims.common.exception.InvalidOperationException;
import com.rims.common.util.CsvHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CsvHelper csvHelper;

    @InjectMocks
    private ProductService productService;

    private Category category;
    private ProductDto validDto;

    @BeforeEach
    void setUp() {
        category = Category.builder()
                .id(1L)
                .name("Electronics")
                .code("ELEC")
                .active(true)
                .build();

        validDto = ProductDto.builder()
                .sku("ELEC-DEV-001")
                .barcode("8901234567890")
                .name("Premium Wireless Mouse")
                .categoryId(1L)
                .brand("Logitech")
                .purchasePrice(new BigDecimal("25.00"))
                .sellingPrice(new BigDecimal("49.99"))
                .minStockLevel(10)
                .reorderPoint(25)
                .safetyStock(5)
                .status("ACTIVE")
                .build();
    }

    @Test
    @DisplayName("Scenario 1: Successfully create a product with valid details")
    void testCreateProduct_Success() {
        when(productRepository.existsBySku("ELEC-DEV-001")).thenReturn(false);
        when(productRepository.existsByBarcode("8901234567890")).thenReturn(false);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        Product savedProduct = Product.builder()
                .id(100L)
                .sku("ELEC-DEV-001")
                .barcode("8901234567890")
                .name("Premium Wireless Mouse")
                .category(category)
                .brand("Logitech")
                .purchasePrice(new BigDecimal("25.00"))
                .sellingPrice(new BigDecimal("49.99"))
                .minStockLevel(10)
                .reorderPoint(25)
                .safetyStock(5)
                .status("ACTIVE")
                .build();

        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        ProductDto created = productService.createProduct(validDto);

        assertNotNull(created);
        assertEquals("ELEC-DEV-001", created.getSku());
        assertEquals("Premium Wireless Mouse", created.getName());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("Scenario 2: Reject product creation when SKU already exists")
    void testCreateProduct_DuplicateSku() {
        when(productRepository.existsBySku("ELEC-DEV-001")).thenReturn(true);

        DuplicateResourceException exception = assertThrows(DuplicateResourceException.class, () -> {
            productService.createProduct(validDto);
        });

        assertTrue(exception.getMessage().contains("already exists"));
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    @DisplayName("Scenario 3: Reject product creation when selling price is lower than purchase price")
    void testCreateProduct_InvalidPricing() {
        validDto.setSellingPrice(new BigDecimal("15.00")); // lower than purchase price 25.00

        InvalidOperationException exception = assertThrows(InvalidOperationException.class, () -> {
            productService.createProduct(validDto);
        });

        assertTrue(exception.getMessage().contains("Selling price cannot be less than purchase price"));
        verify(productRepository, never()).save(any(Product.class));
    }
}
