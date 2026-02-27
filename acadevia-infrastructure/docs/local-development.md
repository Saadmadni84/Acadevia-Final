# Acadevia Platform — Local Development Guide

> **Version:** 1.0 | **Last Updated:** February 2026

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Manual Step-by-Step Setup](#manual-step-by-step-setup)
- [Working with Individual Services](#working-with-individual-services)
- [Frontend Development](#frontend-development)
- [Hot Reload Setup](#hot-reload-setup)
- [Running Tests](#running-tests)
- [Debugging](#debugging)
- [Code Quality](#code-quality)
- [Database Management](#database-management)
- [Kafka Management](#kafka-management)
- [Common Issues & Solutions](#common-issues--solutions)
- [Service URLs Reference](#service-urls-reference)

---

## Prerequisites

### Required Software

| Software | Version | Installation (macOS) | Installation (Linux) |
|----------|---------|---------------------|---------------------|
| Docker Desktop | 4.25+ | `brew install --cask docker` | [docs.docker.com](https://docs.docker.com/engine/install/) |
| Java JDK | 17 | `brew install openjdk@17` | `sudo apt install openjdk-17-jdk` |
| Maven | 3.9+ | `brew install maven` | `sudo apt install maven` |
| Node.js | 20 LTS | `brew install node@20` | `curl -fsSL https://deb.nodesource.com/setup_20.x \| sudo -E bash - && sudo apt install -y nodejs` |
| Git | 2.40+ | `brew install git` | `sudo apt install git` |

### Verify Installation

```bash
docker --version          # Docker version 24+
docker compose version    # Docker Compose version v2+
java -version             # openjdk version "17.x.x"
mvn -version              # Apache Maven 3.9+
node --version            # v20.x.x
npm --version             # 10.x.x
git --version             # git version 2.40+
```

### System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 8 GB | 16 GB |
| Disk | 10 GB free | 20 GB free |
| CPU | 4 cores | 8 cores |

> **Tip:** Docker Desktop should be allocated at least **6 GB RAM** and **4 CPUs** in Preferences → Resources.

---

## Quick Start

The fastest way to get the entire platform running locally:

```bash
# Clone and enter the project
git clone <repo-url> acadevia-platform
cd acadevia-platform

# Build all backend services
mvn clean install -DskipTests

# Start everything with one command
cd acadevia-infrastructure
make dev
```

Or use the setup script:

```bash
cd acadevia-infrastructure
./scripts/local-setup.sh
```

This will:
1. Check prerequisites (Docker, Java, Node, Maven)
2. Create `.env` from `.env.example` if needed
3. Start infrastructure (MySQL, Redis, Kafka, Zookeeper, MinIO)
4. Wait for health checks (MySQL, Redis, Kafka)
5. Create Kafka topics and MinIO buckets via init containers
6. Start all 14 application services + frontend
7. Print access URLs

**Expected startup time:** 3-5 minutes (first run may take longer for image downloads).

---

## Manual Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone <repo-url> acadevia-platform
cd acadevia-platform
```

### Step 2: Set Up Environment Variables

```bash
cd acadevia-infrastructure/docker

# Create .env from template
cp .env.example .env

# Or generate secrets automatically
cd ..
./scripts/generate-secrets.sh
```

### Step 3: Build Backend Services

```bash
cd acadevia-platform  # project root

# Full build with tests
mvn clean install

# Skip tests for faster builds
mvn clean install -DskipTests

# Build a specific service only
mvn clean install -pl auth-service -am -DskipTests
```

### Step 4: Start Infrastructure Only

```bash
cd acadevia-infrastructure
make dev-infra
```

This starts MySQL, Redis, Kafka, Zookeeper, MinIO, and Kafka UI.

Wait for infrastructure to be healthy:

```bash
# Watch container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Step 5: Start Application Services

```bash
make dev
```

Or start the full stack with `docker compose`:

```bash
cd acadevia-infrastructure/docker
docker compose up -d
```

### Step 6: Start Frontend (Development Mode)

```bash
cd acadevia-frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173` with hot module replacement.

### Step 7: Verify Everything Is Running

```bash
make health
```

---

## Working with Individual Services

### Run a Single Service from IDE

1. Start infrastructure: `make dev-infra`
2. Open the service in your IDE (e.g., `auth-service/`)
3. Set environment variables:

```bash
export SPRING_PROFILES_ACTIVE=dev
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=acadevia_auth
export DB_USER=root
export DB_PASS=root
export KAFKA_SERVERS=localhost:9092
export REDIS_HOST=localhost
export REDIS_PORT=6379
export JWT_SECRET=your-dev-secret-key-minimum-64-characters-long-for-hmac-sha256
```

4. Run the main class (e.g., `AuthServiceApplication.java`)

### Restart a Single Service (Docker)

```bash
# Restart only auth-service
cd acadevia-infrastructure/docker
docker compose restart auth-service

# View logs for a service
docker compose logs -f auth-service

# Or via Makefile
make dev-logs SERVICE=auth-service
```

### Rebuild a Single Service

```bash
# Rebuild Java
cd acadevia-platform
mvn clean install -pl auth-service -am -DskipTests

# Rebuild Docker image and restart
cd acadevia-infrastructure/docker
docker compose up -d --build auth-service
```

---

## Frontend Development

### Setup

```bash
cd acadevia-frontend
npm install
```

### Development Server

```bash
npm run dev
# → http://localhost:5173 (Vite dev server with HMR)
```

### Build for Production

```bash
npm run build
# Output: dist/
```

### Preview Production Build

```bash
npm run preview
```

### Environment Variables

Frontend environment variables are prefixed with `VITE_`:

```bash
# .env.local (create this file)
VITE_API_BASE_URL=http://localhost:8080
VITE_SOCKET_URL=ws://localhost:8080/ws
```

---

## Hot Reload Setup

### Frontend (Automatic)

Vite provides instant HMR out of the box. Any change to `.tsx`, `.ts`, `.css` files will be reflected immediately.

### Backend (Manual Restart Required)

Spring Boot services in Docker require a container restart on code changes:

```bash
# After changing code, rebuild and restart
mvn clean install -pl <service> -am -DskipTests
cd acadevia-infrastructure/docker
docker compose up -d --build <service>
```

### Backend (Spring Boot DevTools — IDE Mode)

When running a service directly from IDE (not Docker):

1. Add `spring-boot-devtools` dependency (already included)
2. Enable "Build project automatically" in IDE
3. The service will restart on classpath changes

**IntelliJ IDEA:**
- Settings → Build → Compiler → ✅ Build project automatically
- Settings → Advanced Settings → ✅ Allow auto-make to start even if developed application is currently running

**VS Code:**
- Use the Spring Boot Dashboard extension to run/restart services

---

## Running Tests

### All Backend Tests

```bash
make test
# or
mvn verify
```

### Single Service Tests

```bash
make test-service SERVICE=auth-service
# or
mvn verify -pl auth-service -am
```

### Test Coverage

```bash
make test-coverage SERVICE=auth-service
# Report at: auth-service/target/site/jacoco/index.html
```

### Frontend Unit Tests

```bash
make test-frontend
# or
cd acadevia-frontend && npm test
```

### E2E Tests (Playwright)

```bash
make test-e2e
# or
cd acadevia-frontend && npx playwright test
```

### Run a Specific Test Class

```bash
mvn test -pl auth-service -Dtest=AuthServiceTest
```

### Run a Specific Test Method

```bash
mvn test -pl auth-service -Dtest="AuthServiceTest#shouldLoginSuccessfully"
```

---

## Debugging

### IntelliJ IDEA

#### Remote Debug (Docker)

1. Add JVM debug args to the service in `docker-compose.yml`:
   ```yaml
   environment:
     JAVA_TOOL_OPTIONS: "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"
   ports:
     - "5005:5005"
   ```

2. In IntelliJ: **Run → Edit Configurations → + → Remote JVM Debug**
   - Host: `localhost`
   - Port: `5005`
   - Module: `auth-service`

3. Start the service, then attach the debugger.

#### Direct Run (Recommended for Dev)

1. Start infrastructure: `make dev-infra`
2. Open the service module in IntelliJ
3. Right-click the main class → **Debug**
4. Set environment variables in Run Configuration

### VS Code

#### Remote Debug (Docker)

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "Debug Auth Service",
      "request": "attach",
      "hostName": "localhost",
      "port": 5005,
      "projectName": "auth-service"
    }
  ]
}
```

#### Direct Run

Install the **Spring Boot Dashboard** extension and run services directly from VS Code.

### Debugging Frontend

1. Open Chrome DevTools (F12)
2. Source maps are enabled by default with Vite
3. Set breakpoints in the Sources tab
4. Use React DevTools extension for component debugging

#### VS Code (Frontend)

Add to `.vscode/launch.json`:

```json
{
  "type": "chrome",
  "name": "Debug Frontend",
  "request": "launch",
  "url": "http://localhost:5173",
  "webRoot": "${workspaceFolder}/acadevia-frontend/src"
}
```

---

## Code Quality

### Linting

```bash
# Run all linters (backend + frontend)
make lint

# Backend only (Checkstyle)
cd acadevia-platform && mvn checkstyle:check

# Frontend only (ESLint)
cd acadevia-frontend && npx eslint .
```

### Formatting

```bash
# Frontend (Prettier)
cd acadevia-frontend && npx prettier --write .
```

---

## Database Management

### Connect to MySQL

```bash
# Via Docker
docker exec -it acadevia-mysql mysql -u root -p

# Via local client
mysql -h localhost -P 3306 -u root -p
```

### List All Databases

```sql
SHOW DATABASES LIKE 'acadevia_%';
```

### Backup

```bash
make db-backup
# Saves to: acadevia-infrastructure/backups/acadevia_backup_<timestamp>.sql
```

### Restore

```bash
make db-restore FILE=backups/acadevia_backup_20260215_120000.sql
```

### Reset All Data

```bash
make dev-reset
# This stops containers, removes volumes, and clears all data
```

### Database Migrations

Migrations run automatically at service startup via Flyway (if configured) or Hibernate auto-DDL.

```bash
# Manual migration trigger
make db-migrate
```

---

## Kafka Management

### Kafka UI

Access the Kafka UI at: **http://localhost:8180**

Features:
- View topics and partitions
- Browse messages
- Monitor consumer groups
- View broker metrics

### CLI Commands

```bash
# List topics
docker exec acadevia-kafka kafka-topics --bootstrap-server localhost:9092 --list

# Describe a topic
docker exec acadevia-kafka kafka-topics --bootstrap-server localhost:9092 --describe --topic user.registered

# Consume messages from a topic
docker exec acadevia-kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic user.registered --from-beginning

# Produce a test message
docker exec -it acadevia-kafka kafka-console-producer --bootstrap-server localhost:9092 --topic user.registered
```

---

## Common Issues & Solutions

### Docker Compose Won't Start

**Symptom:** `Error response from daemon: port is already allocated`

```bash
# Find what's using the port
lsof -i :3306

# Kill the process or stop the conflicting service
kill -9 <PID>

# Or change the port in .env
```

### MySQL Fails Health Check

**Symptom:** MySQL container keeps restarting

```bash
# Check MySQL logs
docker logs acadevia-mysql

# Common fix: remove the volume and restart
docker volume rm acadevia-infrastructure_mysql-data
make dev-infra
```

### Kafka Topics Not Created

**Symptom:** Services error with "Topic not found"

```bash
# Check if init container ran
docker logs acadevia-kafka-init

# Manually create topics
docker exec acadevia-kafka kafka-topics --bootstrap-server localhost:9092 \
  --create --topic user.registered --partitions 3 --replication-factor 1
```

### Out of Memory

**Symptom:** Containers killed with OOMKilled

```bash
# Increase Docker Desktop memory (Preferences → Resources)
# Recommended: 6-8 GB

# Or start only the services you need
make dev-infra
# Then run your target service from IDE
```

### Maven Build Fails

**Symptom:** Compilation errors or dependency resolution failures

```bash
# Clear Maven cache
rm -rf ~/.m2/repository/com/acadevia

# Full rebuild
mvn clean install -DskipTests -U
```

### Frontend Can't Connect to API

**Symptom:** CORS errors or connection refused

```bash
# Ensure API Gateway is running
curl http://localhost:8080/actuator/health

# Check VITE_API_BASE_URL in .env.local
echo "VITE_API_BASE_URL=http://localhost:8080" > acadevia-frontend/.env.local
```

### Services Can't Connect to Each Other

**Symptom:** `Connection refused` between services

```bash
# All services must be on the same Docker network
docker network ls | grep acadevia

# Verify network connectivity
docker exec acadevia-auth-service ping -c 1 acadevia-mysql
```

### Port Conflicts

**Symptom:** Port already in use

```bash
# Stop all local services that might conflict
make dev-stop

# Check for lingering containers
docker ps -a | grep acadevia

# Nuclear option: stop everything
docker stop $(docker ps -q)
```

---

## Service URLs Reference

### Application Services

| Service | URL | Health Check |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | — |
| Frontend (Vite dev) | http://localhost:5173 | — |
| API Gateway | http://localhost:8080 | http://localhost:8080/actuator/health |
| Auth Service | http://localhost:8081 | http://localhost:8081/actuator/health |
| User Service | http://localhost:8082 | http://localhost:8082/actuator/health |
| Course Service | http://localhost:8083 | http://localhost:8083/actuator/health |
| Content Service | http://localhost:8084 | http://localhost:8084/actuator/health |
| Quiz Service | http://localhost:8085 | http://localhost:8085/actuator/health |
| Game Service | http://localhost:8086 | http://localhost:8086/actuator/health |
| Sync Service | http://localhost:8087 | http://localhost:8087/actuator/health |
| Gamification Service | http://localhost:8088 | http://localhost:8088/actuator/health |
| Leaderboard Service | http://localhost:8089 | http://localhost:8089/actuator/health |
| Notification Service | http://localhost:8090 | http://localhost:8090/actuator/health |
| Analytics Service | http://localhost:8091 | http://localhost:8091/actuator/health |
| Admin Service | http://localhost:8092 | http://localhost:8092/actuator/health |
| i18n Service | http://localhost:8093 | http://localhost:8093/actuator/health |

### Infrastructure

| Service | URL | Credentials |
|---------|-----|-------------|
| MySQL | localhost:3306 | root / (from .env) |
| Redis | localhost:6379 | — |
| Kafka | localhost:9092 | — |
| Kafka UI | http://localhost:8180 | — |
| MinIO Console | http://localhost:9001 | (from .env) |
| MinIO API | http://localhost:9000 | (from .env) |

### Monitoring

| Service | URL | Credentials |
|---------|-----|-------------|
| Grafana | http://localhost:3001 | admin / admin |
| Prometheus | http://localhost:9090 | — |
| Jaeger UI | http://localhost:16686 | — |

### Useful Make Commands

```bash
make help              # Show all available targets
make dev               # Start full dev stack
make dev-infra         # Start infrastructure only
make dev-stop          # Stop everything
make dev-reset         # Stop + delete all data
make dev-logs SERVICE= # Tail logs for a service
make build             # Build all Docker images
make test              # Run all tests
make test-service SERVICE=  # Test one service
make health            # Health check all services
make monitoring-up     # Start monitoring stack
make monitoring-down   # Stop monitoring stack
make db-backup         # Backup databases
make clean             # Remove everything
```
