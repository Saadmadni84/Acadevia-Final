#!/bin/bash
set -e

# ============================================================
# Acadevia Platform — Stop Local Development
# ============================================================

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$INFRA_DIR/docker"

# Check for docker compose
if docker compose version &>/dev/null 2>&1; then
  DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &>/dev/null; then
  DOCKER_COMPOSE="docker-compose"
else
  echo "❌ docker compose not found"
  exit 1
fi

echo -e "${BLUE}🛑 Stopping Acadevia Development Environment...${NC}"
echo ""

cd "$DOCKER_DIR"

# Stop application services
echo -e "${YELLOW}Stopping application services...${NC}"
$DOCKER_COMPOSE down 2>/dev/null || true

# Stop monitoring stack
echo -e "${YELLOW}Stopping monitoring services...${NC}"
$DOCKER_COMPOSE -f docker-compose.monitoring.yml down 2>/dev/null || true

# Stop infrastructure
echo -e "${YELLOW}Stopping infrastructure services...${NC}"
$DOCKER_COMPOSE -f docker-compose.infra.yml down 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ All services stopped gracefully${NC}"
