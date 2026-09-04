# ============================================================
# Acadevia - leaderboard-service Dockerfile
# Multi-stage build: Maven build → JRE runtime
# ============================================================

# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build

COPY pom.xml ./pom.xml
RUN sed -i '/<modules>/,/<\/modules>/d' pom.xml
COPY leaderboard-service/pom.xml ./leaderboard-service/pom.xml
COPY leaderboard-service/src ./leaderboard-service/src
COPY leaderboard-service/target/*.jar ./leaderboard-service/target/

RUN if [ ! -f leaderboard-service/target/*.jar ]; then       mvn -f leaderboard-service/pom.xml package -DskipTests -B -q;     fi

# Stage 2: Runtime
FROM eclipse-temurin:17-jre

# curl is required for the actuator-based health check below
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Security: create non-root user
RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -s /bin/sh appuser

WORKDIR /app

# Copy JAR from builder
COPY --from=builder /build/leaderboard-service/target/*.jar app.jar

# JVM settings (overridable via JAVA_OPTS env)
ENV JAVA_OPTS="-Xms256m -Xmx512m \
  -XX:+UseG1GC \
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8088

# Health check using Spring Boot actuator
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -fsS http://localhost:8088/actuator/health || exit 1

# Never run as root
USER appuser

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
