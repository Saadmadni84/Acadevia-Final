#!/bin/bash
set -e

# ============================================================
# Acadevia Platform — Build All Docker Images
# ============================================================

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$INFRA_DIR")"
DOCKER_SERVICES_DIR="$INFRA_DIR/docker/services"

TAG="${1:-latest}"
REGISTRY="${REGISTRY:-acadevia}"

SERVICES=(
  api-gateway
  auth-service
  user-service
  course-service
  content-service
  quiz-service
  game-service
  sync-service
  gamification-service
  leaderboard-service
  notification-service
  admin-service
  i18n-service
  analytics-service
)

TOTAL=${#SERVICES[@]}
SUCCEEDED=0
FAILED=0
FAILED_LIST=()

echo -e "${BLUE}🔨 Building all Docker images (tag: ${TAG})...${NC}"
echo -e "${BLUE}   Registry: ${REGISTRY}${NC}"
echo ""

# Build backend services
for service in "${SERVICES[@]}"; do
  echo -e "${YELLOW}[$(( SUCCEEDED + FAILED + 1 ))/${TOTAL}] Building ${service}...${NC}"

  DOCKERFILE=""
  CONTEXT="$PROJECT_ROOT"

  # Check for Dockerfile in docker/services/<service>/
  if [ -f "$DOCKER_SERVICES_DIR/$service/Dockerfile" ]; then
    DOCKERFILE="$DOCKER_SERVICES_DIR/$service/Dockerfile"
  # Check for Dockerfile in <service>/ at project root
  elif [ -f "$PROJECT_ROOT/$service/Dockerfile" ]; then
    DOCKERFILE="$PROJECT_ROOT/$service/Dockerfile"
    CONTEXT="$PROJECT_ROOT/$service"
  else
    echo -e "  ${YELLOW}⚠ No Dockerfile found for ${service}, skipping${NC}"
    FAILED=$((FAILED + 1))
    FAILED_LIST+=("$service (no Dockerfile)")
    continue
  fi

  if docker build -t "${REGISTRY}/${service}:${TAG}" -f "$DOCKERFILE" "$CONTEXT" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ ${REGISTRY}/${service}:${TAG}${NC}"
    SUCCEEDED=$((SUCCEEDED + 1))
  else
    echo -e "  ${RED}❌ Failed to build ${service}${NC}"
    FAILED=$((FAILED + 1))
    FAILED_LIST+=("$service")
  fi
done

# Build frontend
echo ""
echo -e "${YELLOW}Building frontend...${NC}"

FRONTEND_DOCKERFILE=""
if [ -f "$DOCKER_SERVICES_DIR/frontend/Dockerfile.prod" ]; then
  FRONTEND_DOCKERFILE="$DOCKER_SERVICES_DIR/frontend/Dockerfile.prod"
elif [ -f "$DOCKER_SERVICES_DIR/frontend/Dockerfile" ]; then
  FRONTEND_DOCKERFILE="$DOCKER_SERVICES_DIR/frontend/Dockerfile"
elif [ -f "$PROJECT_ROOT/acadevia-frontend/Dockerfile" ]; then
  FRONTEND_DOCKERFILE="$PROJECT_ROOT/acadevia-frontend/Dockerfile"
fi

if [ -n "$FRONTEND_DOCKERFILE" ]; then
  if docker build -t "${REGISTRY}/frontend:${TAG}" -f "$FRONTEND_DOCKERFILE" "$PROJECT_ROOT" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ ${REGISTRY}/frontend:${TAG}${NC}"
    SUCCEEDED=$((SUCCEEDED + 1))
  else
    echo -e "  ${RED}❌ Failed to build frontend${NC}"
    FAILED=$((FAILED + 1))
    FAILED_LIST+=("frontend")
  fi
else
  echo -e "  ${YELLOW}⚠ No frontend Dockerfile found, skipping${NC}"
  FAILED=$((FAILED + 1))
  FAILED_LIST+=("frontend (no Dockerfile)")
fi

# Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  Succeeded: ${SUCCEEDED}${NC}"
echo -e "${RED}  Failed:    ${FAILED}${NC}"
if [ ${#FAILED_LIST[@]} -gt 0 ]; then
  echo -e "${RED}  Failed services: ${FAILED_LIST[*]}${NC}"
fi
echo -e "${BLUE}═══════════════════════════════════════${NC}"
