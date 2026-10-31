package com.rims.barcode;

import com.rims.common.exception.ResourceNotFoundException;
import com.rims.common.util.BarcodeGenerator;
import com.rims.product.Product;
import com.rims.product.ProductDto;
import com.rims.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BarcodeService {

    private final ProductRepository productRepository;
    private final BarcodeRepository barcodeRepository;
    private final BarcodeGenerator barcodeGenerator;

    public String generateBarcodeSvg(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU: " + sku));

        return barcodeGenerator.generateCode128Svg(product.getBarcode());
    }

    @Transactional(readOnly = true)
    public ProductDto scanBarcode(String barcodeValue) {
        Product product = productRepository.findByBarcode(barcodeValue.trim())
                .orElseThrow(() -> new ResourceNotFoundException("No product matches scanned barcode: " + barcodeValue));

        return ProductDto.fromEntity(product, 0);
    }
}
