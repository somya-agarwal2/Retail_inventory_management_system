package com.rims.reports;

import com.rims.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportsController {

    private final ReportsService reportsService;

    @GetMapping("/{reportType}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getReport(@PathVariable String reportType) {
        return ResponseEntity.ok(ApiResponse.success(reportsService.generateReport(reportType)));
    }

    @GetMapping("/{reportType}/export")
    public ResponseEntity<Resource> exportReportCsv(@PathVariable String reportType) throws IOException {
        InputStreamResource file = new InputStreamResource(reportsService.exportReportToCsv(reportType));
        String filename = "rims_report_" + reportType + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(file);
    }
}
