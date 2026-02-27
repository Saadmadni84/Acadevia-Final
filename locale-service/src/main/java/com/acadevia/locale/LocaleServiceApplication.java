package com.acadevia.locale;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableDiscoveryClient
@EnableCaching
@EnableKafka
@EnableScheduling
public class LocaleServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(LocaleServiceApplication.class, args);
    }
}
