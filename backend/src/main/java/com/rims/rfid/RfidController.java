package com.rims.rfid;

import com.rims.common.response.ApiResponse;
import com.rims.common.response.PagedResponse;
import com.rims.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rfid")
@RequiredArgsConstructor
public class RfidController {

    private final RfidService rfidService;

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<RfidScanLog>>> getRecentScans() {
        return ResponseEntity.ok(ApiResponse.success(rfidService.getRecentScans()));
    }

    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<PagedResponse<RfidScanLog>>> getAllScans(
            @PageableDefault(size = 15, sort = "scanTimestamp,desc") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.from(rfidService.getAllScans(pageable))));
    }

    @PostMapping("/simulate-scan")
    public ResponseEntity<ApiResponse<List<RfidScanLog>>> simulateScan(
            @RequestBody(required = false) Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        String locationType = body != null && body.containsKey("locationType") ? (String) body.get("locationType") : "WAREHOUSE";
        Long locationId = body != null && body.containsKey("locationId") ? Long.valueOf(body.get("locationId").toString()) : 1L;
        String scanType = body != null && body.containsKey("scanType") ? (String) body.get("scanType") : "INBOUND_DOCK";
        Long userId = principal != null ? principal.getId() : 1L;

        List<RfidScanLog> scans = rfidService.simulateDockScan(locationType, locationId, scanType, userId);
        return ResponseEntity.ok(ApiResponse.success("Captured " + scans.size() + " RFID tag signals", scans));
    }
}
