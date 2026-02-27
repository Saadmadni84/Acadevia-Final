#!/bin/bash

# ============================================================
# Acadevia Platform — Health Check All Services
# ============================================================

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

# Service definitions: "name:port"
SERVICES=(
  "API Gateway:8080"
  "Auth Service:8081"
  "User Service:8082"
  "Course Service:8083"
  "Content Service:8084"
  "Quiz Service:8085"
  "Game Service:8086"
  "Sync Service:8087"
  "Gamification Service:8088"
  "Leaderboard Service:8089"
  "Notification Service:8090"
  "Admin Service:8091"
  "i18n Service:8092"
  "Analytics Service:8093"
)

INFRA_SERVICES=(
  "Frontend:3000"
  "Kafka UI:8180"
  "MinIO Console:9001"
  "Grafana:3001"
  "Prometheus:9090"
  "Jaeger UI:16686"
)

HOST="${HOST:-localhost}"
TIMEOUT="${TIMEOUT:-5}"

echo ""
echo -e "${BLUE}${BOLD}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}${BOLD}                  Acadevia Platform Health Check                   ${NC}"
echo -e "${BLUE}${BOLD}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Host: ${HOST}   Timeout: ${TIMEOUT}s   Time: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${BLUE}${BOLD}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

UP_COUNT=0
DOWN_COUNT=0
TOTAL=0

print_header() {
  printf "  ${BOLD}%-25s %-8s %-12s %-12s${NC}\n" "SERVICE" "PORT" "STATUS" "RESPONSE"
  printf "  %-25s %-8s %-12s %-12s\n" "─────────────────────────" "────────" "────────────" "────────────"
}

check_health() {
  local name="$1"
  local port="$2"
  local endpoint="${3:-/actuator/health}"
  local url="http://${HOST}:${port}${endpoint}"

  TOTAL=$((TOTAL + 1))

  # Time the request
  START=$(date +%s%N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1000000000))' 2>/dev/null || echo 0)

  HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" --connect-timeout "$TIMEOUT" --max-time "$TIMEOUT" "$url" 2>/dev/null) || HTTP_CODE="000"

  END=$(date +%s%N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1000000000))' 2>/dev/null || echo 0)

  if [ "$START" != "0" ] && [ "$END" != "0" ]; then
    ELAPSED_MS=$(( (END - START) / 1000000 ))
    RESPONSE_TIME="${ELAPSED_MS}ms"
  else
    RESPONSE_TIME="n/a"
  fi

  if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 400 ] 2>/dev/null; then
    STATUS="${GREEN}● UP${NC}"
    UP_COUNT=$((UP_COUNT + 1))
  else
    STATUS="${RED}● DOWN${NC}"
    DOWN_COUNT=$((DOWN_COUNT + 1))
    RESPONSE_TIME="${RED}timeout${NC}"
  fi

  printf "  %-25s %-8s ${STATUS}%-4s  %-12s\n" "$name" "$port" "" "$RESPONSE_TIME"
}

# ── Application Services ──
echo -e "${YELLOW}${BOLD}  Application Services${NC}"
echo ""
print_header

for entry in "${SERVICES[@]}"; do
  name="${entry%%:*}"
  port="${entry##*:}"
  check_health "$name" "$port" "/actuator/health"
done

echo ""

# ── Infrastructure / UI Services ──
echo -e "${YELLOW}${BOLD}  Infrastructure & UI Services${NC}"
echo ""
print_header

for entry in "${INFRA_SERVICES[@]}"; do
  name="${entry%%:*}"
  port="${entry##*:}"
  check_health "$name" "$port" "/"
done

# ── Summary ──
echo ""
echo -e "${BLUE}${BOLD}═══════════════════════════════════════════════════════════════════${NC}"

if [ "$DOWN_COUNT" -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}All ${TOTAL} services are healthy ✅${NC}"
else
  echo -e "  ${GREEN}Up: ${UP_COUNT}${NC}  |  ${RED}Down: ${DOWN_COUNT}${NC}  |  Total: ${TOTAL}"
fi

echo -e "${BLUE}${BOLD}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# Exit with error code if any services are down
[ "$DOWN_COUNT" -eq 0 ] && exit 0 || exit 1
