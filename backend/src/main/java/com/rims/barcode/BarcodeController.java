package com.rims.barcode;

import com.rims.common.response.ApiResponse;
import com.rims.product.ProductDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/barcode")
@RequiredArgsConstructor
public class BarcodeController {

    private final BarcodeService barcodeService;

    @GetMapping(value = "/generate/{sku}", produces = "image/svg+xml")
    public ResponseEntity<String> generateBarcodeSvg(@PathVariable String sku) {
        String svg = barcodeService.generateBarcodeSvg(sku);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("image/svg+xml"))
                .body(svg);
    }

    @PostMapping("/scan")
    public ResponseEntity<ApiResponse<ProductDto>> scanBarcode(@RequestBody Map<String, String> request) {
        String barcode = request.get("barcode");
        return ResponseEntity.ok(ApiResponse.success("Barcode recognized", barcodeService.scanBarcode(barcode)));
    }
}
