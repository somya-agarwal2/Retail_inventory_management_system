package com.rims.integration;

import com.rims.common.response.ApiResponse;
import com.rims.common.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/integrations")
@RequiredArgsConstructor
public class IntegrationController {

    private final IntegrationService integrationService;

    @GetMapping("/configs")
    public ResponseEntity<ApiResponse<List<IntegrationConfig>>> getConfigs() {
        return ResponseEntity.ok(ApiResponse.success(integrationService.getAllConfigs()));
    }

    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<PagedResponse<IntegrationLog>>> getLogs(
            @PageableDefault(size = 15, sort = "startedAt,desc") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.from(integrationService.getAllLogs(pageable))));
    }

    @PostMapping("/sync/{configId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<IntegrationLog>> triggerSync(@PathVariable Long configId) {
        return ResponseEntity.ok(ApiResponse.success("Sync executed successfully", 
                integrationService.triggerSync(configId)));
    }

    @PutMapping("/configs/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<IntegrationConfig>> updateConfig(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        boolean enabled = body.containsKey("enabled") ? (Boolean) body.get("enabled") : true;
        int freq = body.containsKey("syncFrequencyMinutes") ? (Integer) body.get("syncFrequencyMinutes") : 30;
        return ResponseEntity.ok(ApiResponse.success("Integration configuration updated", 
                integrationService.updateConfig(id, enabled, freq)));
    }
}
