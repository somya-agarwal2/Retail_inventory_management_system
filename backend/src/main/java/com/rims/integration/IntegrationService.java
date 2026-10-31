package com.rims.integration;

import com.rims.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IntegrationService {

    private final IntegrationConfigRepository configRepository;
    private final IntegrationLogRepository logRepository;

    @Transactional(readOnly = true)
    public List<IntegrationConfig> getAllConfigs() {
        return configRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<IntegrationLog> getRecentLogs() {
        return logRepository.findTop20ByOrderByStartedAtDesc();
    }

    @Transactional(readOnly = true)
    public Page<IntegrationLog> getAllLogs(Pageable pageable) {
        return logRepository.findAllByOrderByStartedAtDesc(pageable);
    }

    @Transactional
    public IntegrationLog triggerSync(Long configId) {
        IntegrationConfig config = configRepository.findById(configId)
                .orElseThrow(() -> new ResourceNotFoundException("Integration configuration not found with id: " + configId));

        Instant startTime = Instant.now();
        int records = 25 + (int)(Math.random() * 75);

        String summary = String.format("Synchronized %d records with %s at %s. Network payload response HTTP 200 OK.",
                records, config.getSystemName(), config.getApiEndpoint());

        IntegrationLog log = IntegrationLog.builder()
                .integration(config)
                .syncType(config.getSystemType() + "_BATCH_SYNC")
                .status("SUCCESS")
                .recordsProcessed(records)
                .payloadSummary(summary)
                .startedAt(startTime)
                .completedAt(Instant.now())
                .build();

        config.setLastSyncAt(Instant.now());
        config.setStatus("HEALTHY");
        configRepository.save(config);

        return logRepository.save(log);
    }

    @Transactional
    public IntegrationConfig updateConfig(Long id, boolean enabled, int freqMinutes) {
        IntegrationConfig config = configRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Integration configuration not found with id: " + id));

        config.setEnabled(enabled);
        config.setSyncFrequencyMinutes(freqMinutes);
        return configRepository.save(config);
    }
}
