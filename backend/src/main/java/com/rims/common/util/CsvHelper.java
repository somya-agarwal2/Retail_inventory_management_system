package com.rims.common.util;

import com.rims.product.ProductDto;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class CsvHelper {

    private static final String[] HEADERS = {
        "SKU", "Barcode", "Name", "Description", "CategoryId", "Brand", 
        "PurchasePrice", "SellingPrice", "MinStockLevel", "ReorderPoint", "SafetyStock", "Status"
    };

    public boolean hasCsvFormat(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && (contentType.equals("text/csv") || contentType.equals("application/vnd.ms-excel"));
    }

    public List<ProductDto> parseProductsCsv(MultipartFile file) throws IOException {
        try (BufferedReader fileReader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(fileReader, CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).setTrim(true).build())) {

            List<ProductDto> products = new ArrayList<>();
            Iterable<CSVRecord> csvRecords = csvParser.getRecords();

            for (CSVRecord record : csvRecords) {
                ProductDto dto = ProductDto.builder()
                        .sku(record.get("SKU"))
                        .barcode(record.get("Barcode"))
                        .name(record.get("Name"))
                        .description(record.isSet("Description") ? record.get("Description") : "")
                        .categoryId(Long.parseLong(record.get("CategoryId")))
                        .brand(record.get("Brand"))
                        .purchasePrice(new BigDecimal(record.get("PurchasePrice")))
                        .sellingPrice(new BigDecimal(record.get("SellingPrice")))
                        .minStockLevel(record.isSet("MinStockLevel") ? Integer.parseInt(record.get("MinStockLevel")) : 10)
                        .reorderPoint(record.isSet("ReorderPoint") ? Integer.parseInt(record.get("ReorderPoint")) : 25)
                        .safetyStock(record.isSet("SafetyStock") ? Integer.parseInt(record.get("SafetyStock")) : 5)
                        .status(record.isSet("Status") ? record.get("Status") : "ACTIVE")
                        .build();
                products.add(dto);
            }
            return products;
        }
    }

    public ByteArrayInputStream productsToCsv(List<ProductDto> products) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out, true, StandardCharsets.UTF_8),
                     CSVFormat.DEFAULT.builder().setHeader(HEADERS).build())) {

            for (ProductDto p : products) {
                csvPrinter.printRecord(
                        p.getSku(),
                        p.getBarcode(),
                        p.getName(),
                        p.getDescription(),
                        p.getCategoryId(),
                        p.getBrand(),
                        p.getPurchasePrice(),
                        p.getSellingPrice(),
                        p.getMinStockLevel(),
                        p.getReorderPoint(),
                        p.getSafetyStock(),
                        p.getStatus()
                );
            }
            csvPrinter.flush();
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}
