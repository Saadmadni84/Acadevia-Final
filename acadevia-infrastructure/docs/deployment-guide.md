# Acadevia Platform — Deployment Guide

> **Version:** 1.0 | **Last Updated:** February 2026

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Infrastructure Deployment Order](#infrastructure-deployment-order)
- [Environment Configuration](#environment-configuration)
- [Deploying to Staging](#deploying-to-staging)
- [Deploying to Production](#deploying-to-production)
- [Deploying a Single Service](#deploying-a-single-service)
- [Post-Deployment Validation](#post-deployment-validation)
- [SSL Certificate Setup](#ssl-certificate-setup)
- [DNS Configuration](#dns-configuration)
- [Rollback Procedure](#rollback-procedure)
- [Appendix: Port Reference](#appendix-port-reference)

---

## Prerequisites

### Required Tools

| Tool | Minimum Version | Installation |
|------|----------------|-------------|
| Docker | 24+ | [docs.docker.com](https://docs.docker.com/get-docker/) |
| Docker Compose | v2 (plugin) | Included with Docker Desktop |
| kubectl | 1.28+ | `brew install kubectl` |
| Java JDK | 17 | `brew install openjdk@17` |
| Maven | 3.9+ | `brew install maven` |
| Node.js | 20 LTS | `brew install node@20` |

### Required Access

- Docker registry credentials (for pushing/pulling images)
- Kubernetes cluster access with `cluster-admin` or namespace-admin privileges
- DNS management access (for `acadevia.in` and subdomains)
- `.env` file with all required secrets (see [Environment Configuration](#environment-configuration))

### Verify Prerequisites

```bash
# Verify all tools
docker --version          # Docker version 24+
docker compose version    # Docker Compose version v2+
kubectl version --client  # Client Version: v1.28+
java -version             # openjdk 17
mvn -version              # Apache Maven 3.9+
node --version            # v20+
```

---

## Infrastructure Deployment Order

Deployment must follow a strict phase order to respect service dependencies.

### Phase 1: Namespace & Configuration

```bash
# Create the Kubernetes namespace
make k8s-create-ns

# Apply ConfigMaps and Secrets
make k8s-apply-config
```

**What this does:**
- Creates the `acadevia` namespace with appropriate labels
- Applies `configmap-common.yml` (shared env vars)
- Applies `configmap-frontend.yml` (frontend-specific config)
- Applies `secret-common.yml` (database passwords, JWT secrets, API keys)

### Phase 2: Infrastructure Services

```bash
make k8s-deploy-infra
```

**Services started:**
- MySQL 8.0 (database)
- Redis 7 (cache)
- Kafka + Zookeeper (event streaming)
- MinIO (object storage)

**Wait for readiness** (~2-3 minutes):

```bash
kubectl get pods -n acadevia -l tier=infrastructure -w
```

### Phase 3: Support Services

```bash
kubectl apply -f kubernetes/services/config-server/ -n acadevia
kubectl apply -f kubernetes/services/i18n-service/ -n acadevia
```

Wait for Config Server to be ready before proceeding:

```bash
kubectl wait --for=condition=ready pod -l app=config-server -n acadevia --timeout=120s
```

### Phase 4: Core Application Services

```bash
# Deploy all services at once
kubectl apply -f kubernetes/services/ -n acadevia
```

Services deployed:
- Auth Service, User Service, Course Service, Content Service
- Quiz Service, Game Service, Sync Service
- Gamification Service, Leaderboard Service
- Notification Service, Analytics Service, Admin Service

### Phase 5: Networking & Ingress

```bash
kubectl apply -f kubernetes/networking/ -n acadevia
```

**Resources created:**
- Ingress rules (routing for `acadevia.in`, `api.acadevia.in`, `cdn.acadevia.in`, `grafana.acadevia.in`)
- Network policies (restrict inter-service traffic)
- TLS certificates (via cert-manager)

### Phase 6: Scaling & Monitoring

```bash
kubectl apply -f kubernetes/scaling/ -n acadevia
kubectl apply -f kubernetes/monitoring/ -n acadevia
```

**Resources created:**
- HorizontalPodAutoscaler for each service
- VerticalPodAutoscaler configuration
- Prometheus, Grafana, Loki, Jaeger deployments
- Prometheus ServiceMonitors

### One-Command Full Deploy

```bash
# Deploys all 6 phases in order
make k8s-deploy-all
```

---

## Environment Configuration

### Environment Files

| File | Purpose |
|------|---------|
| `docker/.env` | Local development defaults |
| `docker/.env.staging` | Staging environment overrides |
| `docker/.env.prod` | Production secrets (never commit) |

### Required Environment Variables

```bash
# ── Database ──
MYSQL_ROOT_PASSWORD=<strong-password>
MYSQL_HOST=mysql
MYSQL_PORT=3306

# Per-service DB credentials
AUTH_DB_NAME=acadevia_auth
AUTH_DB_USER=auth_user
AUTH_DB_PASS=<password>
# ... (repeat for user, course, content, quiz, game, sync,
#       gamification, leaderboard, notification, analytics, admin, i18n)

# ── Kafka ──
KAFKA_BOOTSTRAP_SERVERS=kafka:29092

# ── Redis ──
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=<password>

# ── JWT ──
JWT_SECRET=<64-char-base64-secret>
JWT_ACCESS_EXPIRY=3600000
JWT_REFRESH_EXPIRY=604800000

# ── MinIO ──
MINIO_ACCESS_KEY=<access-key>
MINIO_SECRET_KEY=<secret-key>
MINIO_ENDPOINT=http://minio:9000
MINIO_BUCKET_CONTENT=content
MINIO_BUCKET_AVATARS=avatars
MINIO_BUCKET_EXPORTS=exports
CDN_BASE_URL=https://cdn.acadevia.in

# ── Notification ──
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=<email>
SMTP_PASSWORD=<password>
SMTP_FROM=noreply@acadevia.in
SMS_PROVIDER=twilio
SMS_API_KEY=<key>
FCM_PROJECT_ID=<firebase-project-id>
FCM_CREDENTIALS_PATH=/etc/fcm/credentials.json

# ── Frontend ──
VITE_API_BASE_URL=https://api.acadevia.in
VITE_SOCKET_URL=wss://api.acadevia.in/ws

# ── Docker Registry ──
REGISTRY=acadevia
IMAGE_TAG=latest

# ── Monitoring ──
GRAFANA_ADMIN_PASSWORD=<password>
```

### Generate Secrets Automatically

```bash
make generate-secrets
# or
./scripts/generate-secrets.sh
```

---

## Deploying to Staging

### Step 1: Build All Images

```bash
make build IMAGE_TAG=staging
```

### Step 2: Push to Registry

```bash
make push IMAGE_TAG=staging
```

### Step 3: Switch Kubernetes Context

```bash
kubectl config use-context staging
```

### Step 4: Deploy

```bash
IMAGE_TAG=staging make k8s-deploy-all
```

### Or Use the One-Command Target

```bash
make deploy-staging
```

This runs all 4 steps in sequence (build → push → switch context → deploy).

### Step 5: Validate

```bash
make k8s-status
make health
```

---

## Deploying to Production

> **WARNING:** Production deployment requires explicit confirmation.

### Step 1: Build Production Images

```bash
make build IMAGE_TAG=production
```

### Step 2: Push to Registry

```bash
make push IMAGE_TAG=production
```

### Step 3: Switch to Production Context

```bash
kubectl config use-context production
```

### Step 4: Deploy with Confirmation

```bash
make deploy-production
# You will be prompted: "Type 'yes' to confirm"
```

### Step 5: Monitor Rollout

```bash
# Watch all pods
kubectl get pods -n acadevia -w

# Check deployment status
kubectl rollout status deployment/auth-service -n acadevia
kubectl rollout status deployment/api-gateway -n acadevia
# ... repeat for each service
```

### Step 6: Post-Deployment Validation

See [Post-Deployment Validation](#post-deployment-validation).

### Using Docker Compose for Production

If deploying without Kubernetes:

```bash
cd docker/
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d
```

---

## Deploying a Single Service

### Build & Push

```bash
# Build one service
make build-service SERVICE=auth-service IMAGE_TAG=v1.2.3

# Push one service
make push-service SERVICE=auth-service IMAGE_TAG=v1.2.3
```

### Deploy to Kubernetes

```bash
# Update the image in the deployment
make k8s-deploy SERVICE=auth-service

# Or manually set a specific image tag
kubectl set image deployment/auth-service \
  auth-service=acadevia/auth-service:v1.2.3 \
  -n acadevia
```

### Verify

```bash
kubectl rollout status deployment/auth-service -n acadevia
kubectl logs -l app=auth-service -n acadevia --tail=50
```

---

## Post-Deployment Validation

### 1. Check All Pods Are Running

```bash
make k8s-status
```

Expected output: all pods in `Running` state, `READY 1/1`.

### 2. Health Check All Services

```bash
make health
# or
./scripts/health-check.sh
```

This pings each service's `/actuator/health` endpoint and reports status.

### 3. Verify Ingress Is Working

```bash
# Check TLS certificate
curl -vI https://acadevia.in 2>&1 | grep "SSL certificate"

# Check API Gateway
curl -s https://api.acadevia.in/actuator/health | jq .

# Check frontend loads
curl -s -o /dev/null -w "%{http_code}" https://acadevia.in
```

### 4. Verify Database Connectivity

```bash
kubectl exec -it deploy/auth-service -n acadevia -- \
  wget -qO- http://localhost:8081/actuator/health | jq '.components.db'
```

### 5. Verify Kafka Connectivity

```bash
kubectl exec -it deploy/auth-service -n acadevia -- \
  wget -qO- http://localhost:8081/actuator/health | jq '.components.kafka'
```

### 6. Run Smoke Tests

```bash
# Register a test user
curl -s -X POST https://api.acadevia.in/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"Test"}' | jq .

# Login
curl -s -X POST https://api.acadevia.in/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}' | jq .
```

### 7. Check Monitoring

```bash
# Grafana should be accessible
curl -s -o /dev/null -w "%{http_code}" https://grafana.acadevia.in

# Prometheus targets should be UP
curl -s http://prometheus:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'
```

---

## SSL Certificate Setup

### Prerequisites

Install cert-manager in the cluster:

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.yaml

# Wait for cert-manager to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=120s
```

### Apply ClusterIssuers

```bash
kubectl apply -f kubernetes/networking/cert-manager.yml
```

This creates two ClusterIssuers:
- `letsencrypt-prod` — Production certificates
- `letsencrypt-staging` — Test certificates (for initial setup)

### How It Works

1. The Ingress resource has annotation `cert-manager.io/cluster-issuer: letsencrypt-prod`
2. cert-manager automatically provisions certificates for the TLS hosts
3. Certificates are stored in Kubernetes Secret `acadevia-tls`
4. cert-manager renews certificates 30 days before expiry

### Verify Certificate Status

```bash
kubectl get certificates -n acadevia
kubectl describe certificate acadevia-tls -n acadevia
```

### Manual Certificate Renewal

```bash
# Force renewal
kubectl delete secret acadevia-tls -n acadevia
# cert-manager will automatically re-issue
```

---

## DNS Configuration

### Required DNS Records

| Record Type | Name | Value | TTL |
|-------------|------|-------|-----|
| A | `acadevia.in` | `<INGRESS_EXTERNAL_IP>` | 300 |
| A | `api.acadevia.in` | `<INGRESS_EXTERNAL_IP>` | 300 |
| A | `cdn.acadevia.in` | `<INGRESS_EXTERNAL_IP>` | 300 |
| A | `grafana.acadevia.in` | `<INGRESS_EXTERNAL_IP>` | 300 |

### Finding the Ingress External IP

```bash
kubectl get svc -n ingress-nginx
# Note the EXTERNAL-IP column

# Or using jsonpath
kubectl get svc ingress-nginx-controller -n ingress-nginx \
  -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

### DNS Propagation Check

```bash
dig acadevia.in +short
dig api.acadevia.in +short
dig cdn.acadevia.in +short
```

---

## Rollback Procedure

### Rollback a Single Service

```bash
make k8s-rollback SERVICE=auth-service
```

### Rollback to a Specific Revision

```bash
# View rollout history
kubectl rollout history deployment/auth-service -n acadevia

# Rollback to specific revision
kubectl rollout undo deployment/auth-service --to-revision=3 -n acadevia
```

### Rollback All Services

```bash
SERVICES="api-gateway auth-service user-service course-service content-service \
  quiz-service game-service sync-service gamification-service leaderboard-service \
  notification-service analytics-service admin-service i18n-service"

for svc in $SERVICES; do
  kubectl rollout undo deployment/$svc -n acadevia
done
```

---

## Appendix: Port Reference

### Application Services

| Service | Internal Port | Dev External Port |
|---------|--------------|-------------------|
| API Gateway | 8080 | 8080 |
| Auth Service | 8081 | 8081 |
| User Service | 8082 | 8082 |
| Course Service | 8083 | 8083 |
| Content Service | 8084 | 8084 |
| Quiz Service | 8085 | 8085 |
| Game Service | 8086 | 8086 |
| Sync Service | 8087 | 8087 |
| Gamification Service | 8088 | 8088 |
| Leaderboard Service | 8089 | 8089 |
| Notification Service | 8090 | 8090 |
| Analytics Service | 8091 | 8091 |
| Admin Service | 8092 | 8092 |
| i18n Service | 8093 | 8093 |
| Frontend | 80 | 3000 |

### Infrastructure

| Service | Port |
|---------|------|
| MySQL | 3306 |
| Redis | 6379 |
| Kafka (external) | 9092 |
| Kafka (internal) | 29092 |
| Zookeeper | 2181 |
| MinIO API | 9000 |
| MinIO Console | 9001 |

### Monitoring

| Service | Port |
|---------|------|
| Prometheus | 9090 |
| Grafana | 3001 |
| Loki | 3100 |
| Jaeger UI | 16686 |
| Jaeger Collector | 14268 |
| Kafka UI | 8180 |
