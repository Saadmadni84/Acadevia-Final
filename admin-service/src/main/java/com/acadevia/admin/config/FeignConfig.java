package com.acadevia.admin.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor adminFeignInterceptor() {
        return requestTemplate -> {
            requestTemplate.header("X-Service-Name", "admin-service");
            requestTemplate.header("X-Service-Role", "ADMIN");
        };
    }
}
