# ============================================================
# Acadevia - analytics-service Dockerfile
# Multi-stage build: Maven build → JRE runtime
# ============================================================

# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build

# Copy parent POM and service POM for dependency caching
COPY pom.xml ./pom.xml
COPY analytics-service/pom.xml ./analytics-service/pom.xml

# Download dependencies (cached unless POM changes)
RUN mvn dependency:go-offline -pl analytics-service -am -B -q

# Copy source code
COPY analytics-service/src ./analytics-service/src

# Build JAR (skip tests — they run in CI)
RUN mvn package -pl analytics-service -am -DskipTests -B -q

# Stage 2: Runtime
FROM eclipse-temurin:17-jre

# Security: create non-root user
RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -s /bin/sh appuser

WORKDIR /app

# Copy JAR from builder
COPY --from=builder /build/analytics-service/target/*.jar app.jar

# JVM settings (overridable via JAVA_OPTS env)
ENV JAVA_OPTS="-Xms256m -Xmx512m \
  -XX:+UseG1GC \
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8091

# Health check using Spring Boot actuator
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8091/actuator/health || exit 1

# Never run as root
USER appuser

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
