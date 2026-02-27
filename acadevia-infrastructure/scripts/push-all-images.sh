#!/bin/bash
set -e

# ============================================================
# Acadevia Platform — Push All Docker Images to Registry
# ============================================================

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

REGISTRY="${1:-acadevia}"
TAG="${2:-latest}"

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
  frontend
)

TOTAL=${#SERVICES[@]}
SUCCEEDED=0
FAILED=0

echo -e "${BLUE}📤 Pushing all Docker images to ${REGISTRY} (tag: ${TAG})...${NC}"
echo ""

# Verify docker login
echo -e "${YELLOW}Verifying registry access...${NC}"
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker is not running${NC}"
  exit 1
fi

for service in "${SERVICES[@]}"; do
  IMAGE="${REGISTRY}/${service}:${TAG}"
  printf "  %-40s " "$IMAGE"

  # Check if image exists locally
  if ! docker image inspect "$IMAGE" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ not found locally, skipping${NC}"
    FAILED=$((FAILED + 1))
    continue
  fi

  if docker push "$IMAGE" > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
    SUCCEEDED=$((SUCCEEDED + 1))
  else
    echo -e "${RED}❌ push failed${NC}"
    FAILED=$((FAILED + 1))
  fi
done

# Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  Pushed:  ${SUCCEEDED}/${TOTAL}${NC}"
echo -e "${RED}  Failed:  ${FAILED}/${TOTAL}${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
