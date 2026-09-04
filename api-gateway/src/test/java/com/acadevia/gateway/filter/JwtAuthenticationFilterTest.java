package com.acadevia.gateway.filter;

import com.acadevia.gateway.util.JwtUtil;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

class JwtAuthenticationFilterTest {

    private static final String SECRET_KEY_STRING = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private SecretKey signingKey;
    private JwtUtil jwtUtil;
    private JwtAuthenticationFilter filter;
    private GatewayFilter gatewayFilter;

    @BeforeEach
    void setUp() {
        this.signingKey = Keys.hmacShaKeyFor(SECRET_KEY_STRING.getBytes(StandardCharsets.UTF_8));
        this.jwtUtil = new JwtUtil();
        this.jwtUtil.setSecretKey(SECRET_KEY_STRING);
        this.jwtUtil.init();
        this.filter = new JwtAuthenticationFilter(jwtUtil);
        this.gatewayFilter = filter.apply(new JwtAuthenticationFilter.Config());
    }

    private String createTestToken(Long userId, String email, String role, String fullName, long ttlMillis) {
        Map<String, Object> claims = new HashMap<>();
        if (userId != null) claims.put("userId", userId);
        if (email != null) claims.put("email", email);
        if (role != null) claims.put("role", role);
        if (fullName != null) claims.put("fullName", fullName);

        long now = System.currentTimeMillis();
        return Jwts.builder()
                .claims(claims)
                .subject(email != null ? email : "test@acadevia.com")
                .issuer("acadevia")
                .issuedAt(new Date(now))
                .expiration(new Date(now + ttlMillis))
                .signWith(signingKey)
                .compact();
    }

    // ========================================================================
    // 1. SECURITY TRUST BOUNDARY & SPOOFING PREVENTION TESTS
    // ========================================================================

    @Test
    @DisplayName("Security: Client-spoofed X-User-Role: ADMIN is removed and replaced by JWT role STUDENT")
    void testSpoofedRoleIsOverriddenByJwtClaim() {
        String studentToken = createTestToken(42L, "student@acadevia.com", "STUDENT", "Student User", 60000);

        MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/content/videos/upload")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + studentToken)
                .header("X-User-Role", "ADMIN") // Attacker attempts to spoof role
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicReference<HttpHeaders> capturedHeaders = new AtomicReference<>();
        GatewayFilterChain chain = filterExchange -> {
            capturedHeaders.set(filterExchange.getRequest().getHeaders());
            return Mono.empty();
        };

        gatewayFilter.filter(exchange, chain).block();

        HttpHeaders downstreamHeaders = capturedHeaders.get();
        assertNotNull(downstreamHeaders, "Request must reach downstream chain");

        List<String> roles = downstreamHeaders.get("X-User-Role");
        assertNotNull(roles, "X-User-Role must exist downstream");
        assertEquals(1, roles.size(), "X-User-Role must contain exactly one trusted value");
        assertEquals("STUDENT", roles.get(0), "X-User-Role must be STUDENT from JWT claims, not ADMIN");
        assertFalse(roles.contains("ADMIN"), "Downstream must never see client-supplied ADMIN role");
    }

    @Test
    @DisplayName("Security: Client-spoofed X-User-Id, X-User-Email, and X-User-Name are removed and replaced by JWT claims")
    void testAllSpoofedIdentityHeadersAreOverriddenByJwtClaims() {
        String studentToken = createTestToken(42L, "student@acadevia.com", "STUDENT", "Student User", 60000);

        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/users/profile")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + studentToken)
                .header("X-User-Id", "999")
                .header("X-User-Email", "attacker@spoof.com")
                .header("X-User-Role", "ADMIN")
                .header("X-User-Name", "Evil Attacker")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicReference<HttpHeaders> capturedHeaders = new AtomicReference<>();
        GatewayFilterChain chain = filterExchange -> {
            capturedHeaders.set(filterExchange.getRequest().getHeaders());
            return Mono.empty();
        };

        gatewayFilter.filter(exchange, chain).block();

        HttpHeaders downstreamHeaders = capturedHeaders.get();
        assertNotNull(downstreamHeaders);

        // Verify X-User-Id
        List<String> userIds = downstreamHeaders.get("X-User-Id");
        assertNotNull(userIds);
        assertEquals(1, userIds.size());
        assertEquals("42", userIds.get(0));
        assertFalse(userIds.contains("999"));

        // Verify X-User-Email
        List<String> emails = downstreamHeaders.get("X-User-Email");
        assertNotNull(emails);
        assertEquals(1, emails.size());
        assertEquals("student@acadevia.com", emails.get(0));
        assertFalse(emails.contains("attacker@spoof.com"));

        // Verify X-User-Role
        List<String> roles = downstreamHeaders.get("X-User-Role");
        assertNotNull(roles);
        assertEquals(1, roles.size());
        assertEquals("STUDENT", roles.get(0));

        // Verify X-User-Name
        List<String> names = downstreamHeaders.get("X-User-Name");
        assertNotNull(names);
        assertEquals(1, names.size());
        assertEquals("Student User", names.get(0));
        assertFalse(names.contains("Evil Attacker"));
    }

    @Test
    @DisplayName("Security: Multi-value client-supplied headers are stripped and replaced by single trusted value")
    void testMultiValueSpoofedHeadersAreReplaced() {
        String teacherToken = createTestToken(10L, "teacher@acadevia.com", "TEACHER", "Teacher Jane", 60000);

        MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/content/videos/upload")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + teacherToken)
                .header("X-User-Role", "ADMIN", "SUPERADMIN", "ROOT") // Multiple spoofed values
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicReference<HttpHeaders> capturedHeaders = new AtomicReference<>();
        GatewayFilterChain chain = filterExchange -> {
            capturedHeaders.set(filterExchange.getRequest().getHeaders());
            return Mono.empty();
        };

        gatewayFilter.filter(exchange, chain).block();

        HttpHeaders downstreamHeaders = capturedHeaders.get();
        List<String> roles = downstreamHeaders.get("X-User-Role");
        assertNotNull(roles);
        assertEquals(1, roles.size(), "Multi-value header must be replaced with exactly one trusted value");
        assertEquals("TEACHER", roles.get(0));
    }

    @Test
    @DisplayName("Security: Spoofed header with null claim in JWT is completely removed")
    void testSpoofedHeaderRemovedWhenClaimIsNullInJwt() {
        // Token without fullName claim
        String tokenWithoutName = createTestToken(10L, "user@acadevia.com", "STUDENT", null, 60000);

        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/users/profile")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenWithoutName)
                .header("X-User-Name", "Spoofed Client Name")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicReference<HttpHeaders> capturedHeaders = new AtomicReference<>();
        GatewayFilterChain chain = filterExchange -> {
            capturedHeaders.set(filterExchange.getRequest().getHeaders());
            return Mono.empty();
        };

        gatewayFilter.filter(exchange, chain).block();

        HttpHeaders downstreamHeaders = capturedHeaders.get();
        assertNull(downstreamHeaders.getFirst("X-User-Name"), "Spoofed header must be completely stripped when JWT claim is null");
    }

    // ========================================================================
    // 2. NORMAL AUTHENTICATION SCENARIOS
    // ========================================================================

    @Test
    @DisplayName("Auth: Missing Authorization header returns 401 Unauthorized")
    void testMissingAuthorizationHeaderReturns401() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/content/videos/1").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicBoolean chainCalled = new AtomicBoolean(false);
        GatewayFilterChain chain = filterExchange -> {
            chainCalled.set(true);
            return Mono.empty();
        };

        gatewayFilter.filter(exchange, chain).block();

        assertFalse(chainCalled.get(), "Downstream must not be called when authorization header is missing");
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    }

    @Test
    @DisplayName("Auth: Malformed Authorization header without 'Bearer ' prefix returns 401")
    void testMalformedAuthorizationHeaderReturns401() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/content/videos/1")
                .header(HttpHeaders.AUTHORIZATION, "Basic dXNlcjpwYXNz")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicBoolean chainCalled = new AtomicBoolean(false);
        GatewayFilterChain chain = filterExchange -> {
            chainCalled.set(true);
            return Mono.empty();
        };

        gatewayFilter.filter(exchange, chain).block();

        assertFalse(chainCalled.get());
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    }

    @Test
    @DisplayName("Auth: Invalid JWT signature or token content returns 401")
    void testInvalidJwtReturns401() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/content/videos/1")
                .header(HttpHeaders.AUTHORIZATION, "Bearer invalid.jwt.token")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicBoolean chainCalled = new AtomicBoolean(false);
        GatewayFilterChain chain = filterExchange -> {
            chainCalled.set(true);
            return Mono.empty();
        };

        gatewayFilter.filter(exchange, chain).block();

        assertFalse(chainCalled.get());
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    }

    @Test
    @DisplayName("Auth: Expired JWT token returns 401 Unauthorized")
    void testExpiredJwtReturns401() {
        // Token expired 10 seconds ago
        String expiredToken = createTestToken(42L, "student@acadevia.com", "STUDENT", "Student User", -10000);

        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/content/videos/1")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + expiredToken)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicBoolean chainCalled = new AtomicBoolean(false);
        GatewayFilterChain chain = filterExchange -> {
            chainCalled.set(true);
            return Mono.empty();
        };

        gatewayFilter.filter(exchange, chain).block();

        assertFalse(chainCalled.get(), "Downstream must not be called with expired token");
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    }

    @Test
    @DisplayName("Auth: Valid JWT without client headers proceeds with trusted identity")
    void testValidJwtProceedsWithTrustedIdentity() {
        String token = createTestToken(101L, "teacher@acadevia.com", "TEACHER", "Prof Smith", 60000);

        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/content/videos/1")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicReference<HttpHeaders> capturedHeaders = new AtomicReference<>();
        GatewayFilterChain chain = filterExchange -> {
            capturedHeaders.set(filterExchange.getRequest().getHeaders());
            return Mono.empty();
        };

        gatewayFilter.filter(exchange, chain).block();

        HttpHeaders downstreamHeaders = capturedHeaders.get();
        assertNotNull(downstreamHeaders);
        assertEquals("101", downstreamHeaders.getFirst("X-User-Id"));
        assertEquals("teacher@acadevia.com", downstreamHeaders.getFirst("X-User-Email"));
        assertEquals("TEACHER", downstreamHeaders.getFirst("X-User-Role"));
        assertEquals("Prof Smith", downstreamHeaders.getFirst("X-User-Name"));
    }

    // ========================================================================
    // 3. PUBLIC ENDPOINT MATCHING & SANITIZATION TESTS
    // ========================================================================

    @Test
    @DisplayName("Public Endpoint: /api/v1/auth/login exact match skips auth requirement")
    void testPublicEndpointExactMatchSkipsAuth() {
        MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/auth/login").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicBoolean chainCalled = new AtomicBoolean(false);
        GatewayFilterChain chain = filterExchange -> {
            chainCalled.set(true);
            return Mono.empty();
        };

        gatewayFilter.filter(exchange, chain).block();
        assertTrue(chainCalled.get(), "Public endpoint must be passed downstream without Authorization header");
    }

    @Test
    @DisplayName("Public Endpoint: Trailing slash /api/v1/auth/login/ skips auth requirement")
    void testPublicEndpointWithTrailingSlashSkipsAuth() {
        MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/auth/login/").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicBoolean chainCalled = new AtomicBoolean(false);
        GatewayFilterChain chain = filterExchange -> {
            chainCalled.set(true);
            return Mono.empty();
        };

        gatewayFilter.filter(exchange, chain).block();
        assertTrue(chainCalled.get());
    }

    @Test
    @DisplayName("Public Endpoint: Legitimate subpath /api/v1/auth/register/student skips auth requirement")
    void testPublicEndpointSubpathSkipsAuth() {
        MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/auth/register/student").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicBoolean chainCalled = new AtomicBoolean(false);
        GatewayFilterChain chain = filterExchange -> {
            chainCalled.set(true);
            return Mono.empty();
        };

        gatewayFilter.filter(exchange, chain).block();
        assertTrue(chainCalled.get());
    }

    @Test
    @DisplayName("Security: Prefix substring bypass /api/v1/auth/loginanything is REJECTED with 401")
    void testPublicEndpointPrefixBypassIsBlocked() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/auth/loginanything").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicBoolean chainCalled = new AtomicBoolean(false);
        GatewayFilterChain chain = filterExchange -> {
            chainCalled.set(true);
            return Mono.empty();
        };

        gatewayFilter.filter(exchange, chain).block();
        assertFalse(chainCalled.get(), "/api/v1/auth/loginanything must not bypass authentication");
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    }

    @Test
    @DisplayName("Security: Public endpoint strips client-supplied identity headers")
    void testPublicEndpointStripsClientIdentityHeaders() {
        MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/auth/login")
                .header("X-User-Role", "ADMIN")
                .header("X-User-Id", "1")
                .header("X-User-Email", "admin@acadevia.com")
                .header("X-User-Name", "Admin User")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicReference<HttpHeaders> capturedHeaders = new AtomicReference<>();
        GatewayFilterChain chain = filterExchange -> {
            capturedHeaders.set(filterExchange.getRequest().getHeaders());
            return Mono.empty();
        };

        gatewayFilter.filter(exchange, chain).block();

        HttpHeaders downstreamHeaders = capturedHeaders.get();
        assertNotNull(downstreamHeaders);
        assertNull(downstreamHeaders.getFirst("X-User-Role"), "Public endpoint must strip X-User-Role");
        assertNull(downstreamHeaders.getFirst("X-User-Id"), "Public endpoint must strip X-User-Id");
        assertNull(downstreamHeaders.getFirst("X-User-Email"), "Public endpoint must strip X-User-Email");
        assertNull(downstreamHeaders.getFirst("X-User-Name"), "Public endpoint must strip X-User-Name");
    }
}
