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

    // List of identity headers that form the security trust boundary between Gateway and downstream services
    public static final String HEADER_USER_ID = "X-User-Id";
    public static final String HEADER_USER_EMAIL = "X-User-Email";
    public static final String HEADER_USER_ROLE = "X-User-Role";
    public static final String HEADER_USER_NAME = "X-User-Name";

    private static final List<String> IDENTITY_HEADERS = List.of(
            HEADER_USER_ID,
            HEADER_USER_EMAIL,
            HEADER_USER_ROLE,
            HEADER_USER_NAME
    );

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
            "/api/v1/content/videos/by-chapter",
            "/api/v1/content/videos/by-module",
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
                // Ensure client cannot smuggle downstream identity headers on public endpoints
                ServerWebExchange sanitizedExchange = exchange.mutate()
                        .request(r -> r.headers(headers -> {
                            for (String header : IDENTITY_HEADERS) {
                                headers.remove(header);
                            }
                        }))
                        .build();
                return chain.filter(sanitizedExchange);
            }

            String token = null;
            if (exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                } else {
                    return onError(exchange, "Invalid Authorization Header", HttpStatus.UNAUTHORIZED);
                }
            } else if (exchange.getRequest().getQueryParams().containsKey("token")) {
                token = exchange.getRequest().getQueryParams().getFirst("token");
            }

            if (token == null || token.isBlank()) {
                return onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
            }

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
                            // 1. Remove all client-supplied identity headers to prevent spoofing
                            for (String header : IDENTITY_HEADERS) {
                                headers.remove(header);
                            }

                            // 2. Set only trusted values derived from the validated JWT
                            if (userId != null) headers.set(HEADER_USER_ID, userId);
                            if (email != null) headers.set(HEADER_USER_EMAIL, email);
                            if (role != null) headers.set(HEADER_USER_ROLE, role);
                            if (fullName != null) headers.set(HEADER_USER_NAME, fullName);
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
        if (path == null) {
            return false;
        }
        String normalizedPath = (path.endsWith("/") && path.length() > 1)
                ? path.substring(0, path.length() - 1)
                : path;
        return PUBLIC_ENDPOINTS.stream().anyMatch(endpoint ->
                normalizedPath.equals(endpoint) || normalizedPath.startsWith(endpoint + "/")
        ) || normalizedPath.matches(".*/videos/\\d+/stream");
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
