package com.rims;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("dev")
class RimsApplicationTests {

    @Test
    @DisplayName("Verify Spring Boot application context loads successfully")
    void contextLoads() {
        assertTrue(true, "Application context loaded successfully with dev profile");
    }
}
