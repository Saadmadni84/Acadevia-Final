# ============================================================
# Acadevia - api-gateway Dockerfile
# Multi-stage build: Maven build → JRE runtime
# ============================================================

# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build

# Copy parent POM and service POM for dependency caching
COPY pom.xml ./pom.xml
COPY api-gateway/pom.xml ./api-gateway/pom.xml

# Download dependencies (cached unless POM changes)
RUN mvn dependency:go-offline -pl api-gateway -am -B -q

# Copy source code
COPY api-gateway/src ./api-gateway/src

# Build JAR (skip tests — they run in CI)
RUN mvn package -pl api-gateway -am -DskipTests -B -q

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine

# Security: create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copy JAR from builder
COPY --from=builder /build/api-gateway/target/*.jar app.jar

# JVM settings (overridable via JAVA_OPTS env)
ENV JAVA_OPTS="-Xms256m -Xmx512m \
  -XX:+UseG1GC \
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

# Health check using Spring Boot actuator
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

# Never run as root
USER appuser

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
