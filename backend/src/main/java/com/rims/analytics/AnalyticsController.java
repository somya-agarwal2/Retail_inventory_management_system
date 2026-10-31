package com.rims.analytics;

import com.rims.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping({"/api/v1/analytics", "/api/v1/dashboard"})
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getUnifiedDashboardAnalytics()));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AnalyticsDto.DashboardSummaryDto>> getDashboardSummary() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDashboardSummary()));
    }

    @GetMapping("/charts")
    public ResponseEntity<ApiResponse<AnalyticsDto.ChartsDataDto>> getChartsData() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getChartsData()));
    }
}
