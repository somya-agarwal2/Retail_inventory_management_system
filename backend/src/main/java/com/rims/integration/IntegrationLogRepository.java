package com.rims.integration;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IntegrationLogRepository extends JpaRepository<IntegrationLog, Long> {
    List<IntegrationLog> findTop20ByOrderByStartedAtDesc();
    Page<IntegrationLog> findAllByOrderByStartedAtDesc(Pageable pageable);
}
