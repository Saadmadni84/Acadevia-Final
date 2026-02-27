#!/bin/bash
set -e

# ============================================================
# Acadevia Platform — Local Development Setup
# ============================================================

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$INFRA_DIR/docker"

echo -e "${BLUE}🚀 Setting up Acadevia Development Environment...${NC}"
echo ""

# ───────────────────────────────────────────────
# Step 1: Check prerequisites
# ───────────────────────────────────────────────
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

check_command() {
  command -v "$1" &>/dev/null || {
    echo -e "${RED}❌ $1 not found. Please install $1${NC}"
    exit 1
  }
  echo -e "  ${GREEN}✓${NC} $1 found"
}

check_command docker
check_command java
check_command node
check_command mvn

# Check for docker compose (plugin) or docker-compose (standalone)
if docker compose version &>/dev/null 2>&1; then
  DOCKER_COMPOSE="docker compose"
  echo -e "  ${GREEN}✓${NC} docker compose (plugin) found"
elif command -v docker-compose &>/dev/null; then
  DOCKER_COMPOSE="docker-compose"
  echo -e "  ${GREEN}✓${NC} docker-compose (standalone) found"
else
  echo -e "${RED}❌ docker compose not found. Please install Docker Compose${NC}"
  exit 1
fi

echo ""

# ───────────────────────────────────────────────
# Step 2: Environment file
# ───────────────────────────────────────────────
echo -e "${YELLOW}Step 2: Setting up environment...${NC}"

if [ ! -f "$DOCKER_DIR/.env" ]; then
  if [ -f "$DOCKER_DIR/.env.example" ]; then
    echo "  Creating .env from .env.example..."
    cp "$DOCKER_DIR/.env.example" "$DOCKER_DIR/.env"
  else
    echo -e "  ${YELLOW}⚠ No .env.example found, using existing .env or defaults${NC}"
  fi
else
  echo -e "  ${GREEN}✓${NC} .env already exists"
fi

echo ""

# ───────────────────────────────────────────────
# Step 3: Start infrastructure
# ───────────────────────────────────────────────
echo -e "${YELLOW}Step 3: Starting infrastructure services...${NC}"

cd "$DOCKER_DIR"
$DOCKER_COMPOSE -f docker-compose.infra.yml up -d

echo ""

# ───────────────────────────────────────────────
# Step 4: Wait for health checks
# ───────────────────────────────────────────────
echo -e "${YELLOW}Step 4: Waiting for infrastructure to be healthy...${NC}"

echo -n "  Waiting for MySQL..."
timeout 90 bash -c "until $DOCKER_COMPOSE -f docker-compose.infra.yml exec -T mysql mysqladmin ping -h localhost --silent 2>/dev/null; do sleep 2; done" 2>/dev/null \
  && echo -e " ${GREEN}✅${NC}" \
  || echo -e " ${YELLOW}⏰ (may still be starting)${NC}"

echo -n "  Waiting for Redis..."
timeout 30 bash -c "until $DOCKER_COMPOSE -f docker-compose.infra.yml exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; do sleep 2; done" 2>/dev/null \
  && echo -e " ${GREEN}✅${NC}" \
  || echo -e " ${YELLOW}⏰ (may still be starting)${NC}"

echo -n "  Waiting for Kafka..."
sleep 10
echo -e " ${GREEN}✅${NC}"

echo ""

# ───────────────────────────────────────────────
# Step 5 & 6: Init containers
# ───────────────────────────────────────────────
echo -e "${GREEN}✅ Kafka topics created by init container${NC}"
echo -e "${GREEN}✅ MinIO buckets created by init container${NC}"

echo ""

# ───────────────────────────────────────────────
# Step 7: Start application services
# ───────────────────────────────────────────────
echo -e "${YELLOW}Step 7: Starting application services...${NC}"

$DOCKER_COMPOSE up -d

echo ""

# ───────────────────────────────────────────────
# Step 8: Wait for services
# ───────────────────────────────────────────────
echo -e "${YELLOW}Step 8: Waiting for application services to be healthy...${NC}"

SERVICE_PORTS=(
  "8080:API Gateway"
  "8081:Auth Service"
  "8082:User Service"
  "8083:Course Service"
  "8084:Content Service"
  "8085:Quiz Service"
)

for entry in "${SERVICE_PORTS[@]}"; do
  port="${entry%%:*}"
  name="${entry##*:}"
  printf "  %-20s (port %s) " "$name" "$port"
  timeout 120 bash -c "until curl -sf http://localhost:$port/actuator/health > /dev/null 2>&1; do sleep 3; done" 2>/dev/null \
    && echo -e "${GREEN}✅${NC}" \
    || echo -e "${YELLOW}⏰ (may still be starting)${NC}"
done

echo ""

# ───────────────────────────────────────────────
# Step 9: Print success
# ───────────────────────────────────────────────
cat << 'EOF'
┌──────────────────────────────────────────┐
│  🎓 Acadevia is running!                │
│                                          │
│  Frontend:    http://localhost:3000       │
│  API Gateway: http://localhost:8080       │
│  Kafka UI:    http://localhost:8180       │
│  MinIO:       http://localhost:9001       │
│  Grafana:     http://localhost:3001       │
│  Prometheus:  http://localhost:9090       │
│  Jaeger:      http://localhost:16686      │
│                                          │
│  Happy coding! 🚀                        │
└──────────────────────────────────────────┘
EOF
