package com.acadevia.content.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Configuration
public class AsyncConfig {

    @Bean(name = "downloadExecutor")
    public ExecutorService downloadExecutor() {
        return Executors.newFixedThreadPool(5);
    }

    @Bean(name = "videoProcessingExecutor")
    public ExecutorService videoProcessingExecutor() {
        return Executors.newFixedThreadPool(3);
    }
}
