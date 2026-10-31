package com.rims;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Retail Inventory Management System (RIMS)
 * Project Code: PRG_RIMS_001
 * Client: XYZ Retail Corporation
 */
@SpringBootApplication
@EnableTransactionManagement
@EnableScheduling
public class RimsApplication {

    public static void main(String[] args) {
        SpringApplication.run(RimsApplication.class, args);
    }
}
