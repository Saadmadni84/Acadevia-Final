package com.acadevia.game.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {
    // Redis cache config is automatically handled by Spring Boot Data Redis starter
    // Can override default cache manager here if needed
}
