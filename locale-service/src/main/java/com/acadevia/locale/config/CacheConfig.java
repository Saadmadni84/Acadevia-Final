package com.acadevia.locale.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();

        Map<String, RedisCacheConfiguration> caches = new HashMap<>();
        caches.put("activeLanguages", defaultConfig.entryTtl(Duration.ofHours(6)));
        caches.put("translationBundle", defaultConfig.entryTtl(Duration.ofHours(1)));
        caches.put("translationBundleCategory", defaultConfig.entryTtl(Duration.ofHours(1)));
        caches.put("translationResolve", defaultConfig.entryTtl(Duration.ofHours(1)));
        caches.put("languagePack", defaultConfig.entryTtl(Duration.ofHours(1)));
        caches.put("contentTranslation", defaultConfig.entryTtl(Duration.ofMinutes(30)));
        caches.put("stateLanguage", defaultConfig.entryTtl(Duration.ofHours(24)));
        caches.put("translationStats", defaultConfig.entryTtl(Duration.ofMinutes(30)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(caches)
                .build();
    }
}
