#!/usr/bin/env bash
# ============================================================
# Acadevia Platform — Full-stack smoke test
# ============================================================
# Verifies a RUNNING `make dev` stack end to end:
#   infrastructure → control plane → services → gateway → frontend
#
# Usage:  make smoke        (or ./scripts/stack-smoke-test.sh)
# Exit:   0 = all critical checks passed, 1 = failures found
# ============================================================
set -u

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
PASS=0; FAIL=0; WARN=0

ok()   { echo -e "  ${GREEN}✓ PASS${NC}  $1"; PASS=$((PASS+1)); }
bad()  { echo -e "  ${RED}✗ FAIL${NC}  $1"; FAIL=$((FAIL+1)); }
warn() { echo -e "  ${YELLOW}! WARN${NC}  $1"; WARN=$((WARN+1)); }

http_code() { curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 "$1" 2>/dev/null || echo "000"; }

echo ""
echo "════════════════════════════════════════════════════════"
echo " Acadevia stack smoke test"
echo "════════════════════════════════════════════════════════"

echo ""
echo "── Infrastructure ──"
docker exec acadevia-mysql mysqladmin ping -h localhost -u root -p"${MYSQL_ROOT_PASSWORD:-root_password}" >/dev/null 2>&1 \
  && ok "MySQL responds to ping" || bad "MySQL not reachable (docker exec mysqladmin ping)"

docker exec acadevia-redis redis-cli ping 2>/dev/null | grep -q PONG \
  && ok "Redis responds to PING" || bad "Redis not reachable (redis-cli ping)"

TOPICS=$(docker exec acadevia-kafka kafka-topics --bootstrap-server localhost:9092 --list 2>/dev/null)
echo "$TOPICS" | grep -q "user.registered" && echo "$TOPICS" | grep -q "xp.earned" \
  && ok "Kafka broker up and Acadevia topics exist ($(echo "$TOPICS" | grep -c . ) topics)" \
  || bad "Kafka topics missing (user.registered / xp.earned not found)"

[ "$(http_code http://localhost:9000/minio/health/live)" = "200" ] \
  && ok "MinIO S3 API healthy (:9000)" || bad "MinIO health endpoint not 200"

echo ""
echo "── Control plane ──"
[ "$(http_code http://localhost:8761/actuator/health)" = "200" ] \
  && ok "Eureka service-registry healthy (:8761)" || bad "service-registry unhealthy"

[ "$(http_code http://localhost:8888/actuator/health)" = "200" ] \
  && ok "Config server healthy (:8888)" || bad "config-server unhealthy"

CFG=$(curl -s --max-time 10 http://localhost:8888/auth-service/default 2>/dev/null)
echo "$CFG" | grep -q "datasource" \
  && ok "Config server serves auth-service configuration" || bad "Config server returned no auth-service config"

APPS_JSON=$(curl -s -H "Accept: application/json" --max-time 10 http://localhost:8761/eureka/apps 2>/dev/null)
REG_COUNT=$(echo "$APPS_JSON" | grep -o '"name"' | wc -l | tr -d ' ')
[ "$REG_COUNT" -ge 13 ] \
  && ok "Eureka registry holds $REG_COUNT application entries (≥13 expected)" \
  || bad "Only $REG_COUNT applications registered in Eureka (expected ≥13)"

echo ""
echo "── Backend services (actuator health inside each container) ──"
declare -A SVC=(
  [auth-service]=8081 [user-service]=8082 [course-service]=8083 [content-service]=8084
  [quiz-service]=8085 [game-service]=8086 [gamification-service]=8087 [leaderboard-service]=8088
  [notification-service]=8090 [i18n-service]=8092 [sync-service]=8093 [admin-service]=8097
  [api-gateway]=8080 [config-server]=8888 [service-registry]=8761
)
for svc in auth-service user-service course-service content-service quiz-service game-service \
           gamification-service leaderboard-service notification-service i18n-service sync-service \
           admin-service api-gateway; do
  port=${SVC[$svc]}
  if docker exec "acadevia-${svc}" curl -fsS "http://localhost:${port}/actuator/health" 2>/dev/null | grep -q '"status":"UP"'; then
    ok "$svc UP (actuator, in-container)"
  else
    bad "$svc not UP on :${port}/actuator/health"
  fi
done

echo ""
echo "── Gateway routing & security ──"
CODE=$(http_code http://localhost:8080/actuator/health)
[ "$CODE" = "200" ] && ok "API Gateway healthy (:8080)" || bad "API Gateway health=$CODE"

CODE=$(http_code http://localhost:8080/api/v1/courses/__smoke__)
case "$CODE" in
  401|403) ok "Gateway→course-service route live (JWT filter answered $CODE for anonymous call)" ;;
  200)     ok "Gateway→course-service route live (200)" ;;
  503)     bad "Gateway has no course-service instance (discovery broken, 503)" ;;
  *)       warn "Gateway→course-service returned $CODE (expected 401 via JWT filter)" ;;
esac

CODE=$(http_code http://localhost:8080/api/v1/auth/__smoke__)
case "$CODE" in
  401|403|404|405) ok "Gateway→auth-service route live ($CODE)" ;;
  503)             bad "Gateway has no auth-service instance (503)" ;;
  *)               warn "Gateway→auth-service returned $CODE" ;;
esac

echo ""
echo "── WebSocket path (/ws/** through nginx + gateway) ──"
WS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 \
  -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: c21va2V0ZXN0a2V5MQ==" http://localhost:8080/ws/leaderboard 2>/dev/null || echo "000")
case "$WS_CODE" in
  101)        ok "WebSocket upgrade succeeded on /ws/leaderboard ($WS_CODE)" ;;
  400|401|403) ok "WebSocket path reachable through gateway (handshake rejected with $WS_CODE without full client, acceptable)" ;;
  503)        bad "WebSocket route has no backend instance (503)" ;;
  *)          warn "WebSocket probe returned $WS_CODE" ;;
esac

echo ""
echo "── Frontend ──"
[ "$(http_code http://localhost:3000/health)" = "200" ] \
  && ok "Frontend container healthy (:3000/health)" || bad "Frontend /health not 200"

curl -s --max-time 10 http://localhost:3000/ 2>/dev/null | grep -qi "<html" \
  && ok "Frontend serves the React app" || bad "Frontend did not serve HTML"

CODE=$(http_code http://localhost:3000/api/v1/courses/__smoke__)
case "$CODE" in
  502|504|000) bad "Frontend nginx → gateway proxy broken ($CODE)" ;;
  *)           ok "Frontend proxies /api to gateway through nginx ($CODE)" ;;
esac

WS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 \
  -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: c21va2V0ZXN0a2V5MQ==" http://localhost:3000/ws/leaderboard 2>/dev/null || echo "000")
case "$WS_CODE" in
  502|504|000) bad "Frontend nginx WebSocket upgrade path broken ($WS_CODE)" ;;
  *)           ok "Frontend proxies /ws WebSocket upgrades ($WS_CODE)" ;;
esac

echo ""
echo "════════════════════════════════════════════════════════"
echo -e " Result: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}, ${YELLOW}$WARN warnings${NC}"
echo "════════════════════════════════════════════════════════"
echo ""
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
