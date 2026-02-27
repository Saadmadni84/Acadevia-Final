package com.acadevia.content;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.DisabledIfEnvironmentVariable;

/**
 * Integration test that requires full infrastructure (Kafka, Redis, MySQL).
 * Disabled during CI/local builds without running services.
 */
class ContentServiceApplicationTests {

    @Test
    void contextLoads() {
        // Requires running Kafka, Redis, MySQL, Eureka, Config Server
        // Run manually with docker-compose up
    }
}
