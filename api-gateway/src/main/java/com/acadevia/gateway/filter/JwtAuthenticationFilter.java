package com.acadevia.gateway.filter;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import com.acadevia.gateway.util.JwtUtil;

import reactor.core.publisher.Mono;

/**
 * Gateway Filter for JWT Authentication.
 * Validates JWT token and extracts user details into headers for downstream services.
 */
@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtUtil jwtUtil;

    // List of public endpoints that don't satisfy the global pattern match 
    // but might be covered if applied globally. However, this filter is applied
    // via routes configuration, so skip logic is mostly for safety if applied globally or broadly.
    // The requirement says: SKIP JWT validation for these PUBLIC paths.
    private static final List<String> PUBLIC_ENDPOINTS = List.of(
            "/api/v1/auth/register",
            "/api/v1/auth/login",
            "/api/v1/auth/refresh-token",
            "/api/v1/auth/forgot-password",
            "/api/v1/auth/reset-password",
            "/api/v1/analytics/platform-stats",
            "/api/v1/analytics/completion-rate",
            "/api/v1/analytics/weekly-progress",
            "/api/v1/analytics/subject-distribution",
            "/api/v1/courses/popular",
            "/api/v1/i18n/languages",
            "/api/v1/geography/states"
    );

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();

            if (isPublicEndpoint(path)) {
                return chain.filter(exchange);
            }

            if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Invalid Authorization Header", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            if (!jwtUtil.validateToken(token)) {
                return onError(exchange, "Invalid JWT Token", HttpStatus.UNAUTHORIZED);
            }

            try {
                // Extract claims and pass to downstream
                String userId = jwtUtil.getUserId(token);
                String email = jwtUtil.getUserEmail(token);
                String role = jwtUtil.getUserRole(token);
                String fullName = jwtUtil.getUserFullName(token);

                ServerWebExchange modifiedExchange = exchange.mutate()
                        .request(r -> r.headers(headers -> {
                            if (userId != null) headers.add("X-User-Id", userId);
                            if (email != null) headers.add("X-User-Email", email);
                            if (role != null) headers.add("X-User-Role", role);
                            if (fullName != null) headers.add("X-User-Name", fullName);
                        }))
                        .build();

                return chain.filter(modifiedExchange);

            } catch (Exception e) {
                log.error("Error processing JWT token", e);
                return onError(exchange, "Token processing failed", HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private boolean isPublicEndpoint(String path) {
        return PUBLIC_ENDPOINTS.stream().anyMatch(path::startsWith);
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        log.error("Authentication Error: {}, Path: {}", err, exchange.getRequest().getPath());
        exchange.getResponse().setStatusCode(httpStatus);
        return exchange.getResponse().setComplete();
    }

    public static class Config {
        // Configuration properties can be added here
    }
}
