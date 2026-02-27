package com.acadevia.gateway.filter;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

/**
 * Filter for logging incoming requests and setting correlation ID.
 */
@Component
public class RequestLoggingFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String requestId = UUID.randomUUID().toString();
        
        // Add Request ID to headers for downstream
        ServerWebExchange modifiedExchange = exchange.mutate()
                .request(r -> r.headers(h -> h.add("X-Request-Id", requestId)))
                .build();
        
        // Add to MDC (Note: Reactive context handling for MDC is more complex, 
        // this is a simplified approach or works if MDC is propagated purely via thread-local which isn't guaranteed in WebFlux)
        // A robust reactive logging solution would use Context.
        
        log.info("Request: Method={}, Path={}, RequestId={}", 
                modifiedExchange.getRequest().getMethod(),
                modifiedExchange.getRequest().getURI().getPath(),
                requestId);

        long startTime = System.currentTimeMillis();

        return chain.filter(modifiedExchange)
                .then(Mono.fromRunnable(() -> {
                     long duration = System.currentTimeMillis() - startTime;
                     log.info("Response: Status={}, RequestId={}, Duration={}ms",
                             exchange.getResponse().getStatusCode(),
                             requestId,
                             duration);
                }));
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
