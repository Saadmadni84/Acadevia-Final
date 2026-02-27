#!/bin/bash
set -e

# ============================================================
# Acadevia Platform — Reset Local Development (Full Clean)
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

# Check for docker compose
if docker compose version &>/dev/null 2>&1; then
  DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &>/dev/null; then
  DOCKER_COMPOSE="docker-compose"
else
  echo "❌ docker compose not found"
  exit 1
fi

echo -e "${RED}⚠️  WARNING: This will destroy ALL data (databases, volumes, etc.)${NC}"
echo ""
read -p "Are you sure you want to reset everything? (y/N): " confirm

if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo -e "${YELLOW}Aborted.${NC}"
  exit 0
fi

echo ""
echo -e "${BLUE}🔄 Resetting Acadevia Development Environment...${NC}"
echo ""

cd "$DOCKER_DIR"

# Stop and remove everything including volumes
echo -e "${YELLOW}Stopping and removing application services + volumes...${NC}"
$DOCKER_COMPOSE down -v --remove-orphans 2>/dev/null || true

echo -e "${YELLOW}Stopping and removing monitoring services + volumes...${NC}"
$DOCKER_COMPOSE -f docker-compose.monitoring.yml down -v --remove-orphans 2>/dev/null || true

echo -e "${YELLOW}Stopping and removing infrastructure services + volumes...${NC}"
$DOCKER_COMPOSE -f docker-compose.infra.yml down -v --remove-orphans 2>/dev/null || true

# Remove dangling images related to acadevia
echo -e "${YELLOW}Cleaning up dangling images...${NC}"
docker images --filter "dangling=true" -q 2>/dev/null | xargs -r docker rmi 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Environment fully reset.${NC}"
echo -e "${BLUE}Run '${SCRIPT_DIR}/local-setup.sh' or 'make dev' to start fresh.${NC}"
