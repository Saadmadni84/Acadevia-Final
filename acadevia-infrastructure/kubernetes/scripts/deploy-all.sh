#!/bin/bash
# ============================================================
#  Acadevia Platform - Full Deployment Script
#  Deploys entire platform in correct dependency order
#  with health checks between phases
# ============================================================

set -euo pipefail

NAMESPACE="acadevia"
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TIMEOUT=300  # 5 minutes default timeout per phase

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

phase_header() {
  echo ""
  echo "============================================================"
  echo -e " ${BLUE}Phase: $1${NC}"
  echo "============================================================"
}

wait_for_pods() {
  local label=$1
  local timeout=${2:-$TIMEOUT}
  log_info "Waiting for pods with label '$label' to be ready (timeout: ${timeout}s)..."

  if ! kubectl wait --for=condition=ready pods -l "$label" -n "$NAMESPACE" --timeout="${timeout}s" 2>/dev/null; then
    log_warn "Some pods with label '$label' are not ready yet. Continuing..."
    return 1
  fi
  log_ok "Pods with label '$label' are ready."
  return 0
}

wait_for_deployment() {
  local name=$1
  local timeout=${2:-$TIMEOUT}
  log_info "Waiting for deployment '$name' to be available..."

  if ! kubectl rollout status deployment/"$name" -n "$NAMESPACE" --timeout="${timeout}s" 2>/dev/null; then
    log_warn "Deployment '$name' rollout not completed within timeout."
    return 1
  fi
  log_ok "Deployment '$name' is available."
  return 0
}

check_prerequisites() {
  phase_header "Prerequisites Check"

  for cmd in kubectl; do
    if ! command -v "$cmd" &>/dev/null; then
      log_error "$cmd is not installed. Please install it first."
      exit 1
    fi
  done
  log_ok "kubectl is available."

  if ! kubectl cluster-info &>/dev/null; then
    log_error "Cannot connect to Kubernetes cluster. Check your kubeconfig."
    exit 1
  fi
  log_ok "Connected to Kubernetes cluster."
}

# ============================================================
# PHASE 1: Namespace & RBAC
# ============================================================
deploy_namespace() {
  phase_header "1. Namespace & RBAC"

  if kubectl get namespace "$NAMESPACE" &>/dev/null; then
    log_info "Namespace '$NAMESPACE' already exists."
  else
    kubectl apply -f "$BASE_DIR/namespace.yml"
    log_ok "Namespace '$NAMESPACE' created."
  fi
}

# ============================================================
# PHASE 2: Secrets & ConfigMaps
# ============================================================
deploy_secrets() {
  phase_header "2. Secrets & ConfigMaps"

  if [ -d "$BASE_DIR/config" ]; then
    for f in "$BASE_DIR/config/"*.yml; do
      [ -f "$f" ] && kubectl apply -f "$f" && log_ok "Applied $(basename "$f")"
    done
  fi
  log_ok "Secrets and ConfigMaps applied."
}

# ============================================================
# PHASE 3: Infrastructure (MySQL, Redis, Kafka, Zookeeper, MinIO)
# ============================================================
deploy_infrastructure() {
  phase_header "3. Infrastructure Services"

  local infra_services=("mysql" "redis" "zookeeper" "kafka" "minio")
  for svc in "${infra_services[@]}"; do
    local svc_dir="$BASE_DIR/services/$svc"
    if [ -d "$svc_dir" ]; then
      log_info "Deploying $svc..."
      kubectl apply -f "$svc_dir/" -n "$NAMESPACE"
      log_ok "$svc manifests applied."
    else
      log_warn "No manifests found for $svc at $svc_dir"
    fi
  done

  sleep 10

  for svc in "${infra_services[@]}"; do
    wait_for_pods "app=$svc" 120 || true
  done

  log_ok "Infrastructure services deployed."
}

# ============================================================
# PHASE 4: Core Services (config-server, service-registry)
# ============================================================
deploy_core_services() {
  phase_header "4. Core Services (Config Server, Service Registry)"

  local core_services=("config-server" "service-registry")
  for svc in "${core_services[@]}"; do
    local svc_dir="$BASE_DIR/services/$svc"
    if [ -d "$svc_dir" ]; then
      log_info "Deploying $svc..."
      kubectl apply -f "$svc_dir/" -n "$NAMESPACE"
      wait_for_deployment "$svc" 180 || true
    else
      log_warn "No manifests found for $svc"
    fi
  done

  log_ok "Core services deployed."
}

# ============================================================
# PHASE 5: Business Microservices
# ============================================================
deploy_business_services() {
  phase_header "5. Business Microservices"

  local business_services=(
    "auth-service"
    "user-service"
    "course-service"
    "content-service"
    "quiz-service"
    "game-service"
    "gamification-service"
    "leaderboard-service"
    "notification-service"
    "locale-service"
    "sync-service"
    "admin-service"
  )

  for svc in "${business_services[@]}"; do
    local svc_dir="$BASE_DIR/services/$svc"
    if [ -d "$svc_dir" ]; then
      log_info "Deploying $svc..."
      kubectl apply -f "$svc_dir/" -n "$NAMESPACE"
    else
      log_warn "No manifests found for $svc"
    fi
  done

  sleep 15

  for svc in "${business_services[@]}"; do
    wait_for_deployment "$svc" 180 || true
  done

  log_ok "Business microservices deployed."
}

# ============================================================
# PHASE 6: API Gateway
# ============================================================
deploy_gateway() {
  phase_header "6. API Gateway"

  local gw_dir="$BASE_DIR/services/api-gateway"
  if [ -d "$gw_dir" ]; then
    kubectl apply -f "$gw_dir/" -n "$NAMESPACE"
    wait_for_deployment "api-gateway" 180 || true
    log_ok "API Gateway deployed."
  else
    log_warn "No API Gateway manifests found."
  fi
}

# ============================================================
# PHASE 7: Frontend
# ============================================================
deploy_frontend() {
  phase_header "7. Frontend"

  local fe_dir="$BASE_DIR/services/frontend"
  if [ -d "$fe_dir" ]; then
    kubectl apply -f "$fe_dir/" -n "$NAMESPACE"
    wait_for_deployment "frontend" 120 || true
    log_ok "Frontend deployed."
  else
    log_warn "No Frontend manifests found."
  fi
}

# ============================================================
# PHASE 8: Monitoring
# ============================================================
deploy_monitoring() {
  phase_header "8. Monitoring Stack"

  local mon_dir="$BASE_DIR/monitoring"
  if [ -d "$mon_dir" ]; then
    for component in prometheus loki promtail grafana jaeger; do
      if [ -d "$mon_dir/$component" ]; then
        log_info "Deploying $component..."
        kubectl apply -f "$mon_dir/$component/" -n "$NAMESPACE"
      fi
    done

    sleep 10
    for component in prometheus grafana jaeger; do
      wait_for_deployment "$component" 120 || true
    done
    log_ok "Monitoring stack deployed."
  else
    log_warn "No monitoring directory found."
  fi
}

# ============================================================
# PHASE 9: Networking (Ingress, NetworkPolicies, Certs)
# ============================================================
deploy_networking() {
  phase_header "9. Networking"

  local net_dir="$BASE_DIR/networking"
  if [ -d "$net_dir" ]; then
    for f in "$net_dir/"*.yml; do
      [ -f "$f" ] && kubectl apply -f "$f" && log_ok "Applied $(basename "$f")"
    done
    log_ok "Networking configured."
  else
    log_warn "No networking directory found."
  fi
}

# ============================================================
# PHASE 10: Jobs
# ============================================================
deploy_jobs() {
  phase_header "10. Setup Jobs"

  local jobs_dir="$BASE_DIR/jobs"
  if [ -d "$jobs_dir" ]; then
    # Kafka topics
    if [ -f "$jobs_dir/kafka-topic-creation-job.yml" ]; then
      log_info "Running Kafka topic creation job..."
      kubectl apply -f "$jobs_dir/kafka-topic-creation-job.yml" -n "$NAMESPACE"
    fi

    # Cache warmup
    if [ -f "$jobs_dir/cache-warmup-job.yml" ]; then
      log_info "Running cache warmup job..."
      kubectl apply -f "$jobs_dir/cache-warmup-job.yml" -n "$NAMESPACE"
    fi

    log_ok "Setup jobs applied."
  fi
}

# ============================================================
# Final Summary
# ============================================================
print_summary() {
  echo ""
  echo "============================================================"
  echo -e " ${GREEN}Acadevia Platform Deployment Complete!${NC}"
  echo "============================================================"
  echo ""
  echo "Namespace: $NAMESPACE"
  echo ""
  log_info "Pod Status:"
  kubectl get pods -n "$NAMESPACE" --sort-by='.metadata.name'
  echo ""
  log_info "Services:"
  kubectl get svc -n "$NAMESPACE"
  echo ""
  log_info "Ingress:"
  kubectl get ingress -n "$NAMESPACE" 2>/dev/null || echo "  No ingress found."
  echo ""
}

# ============================================================
# Main
# ============================================================
main() {
  echo ""
  echo "============================================================"
  echo -e " ${BLUE}Acadevia Platform - Full Deployment${NC}"
  echo "============================================================"
  echo " Base directory: $BASE_DIR"
  echo " Namespace: $NAMESPACE"
  echo ""

  check_prerequisites
  deploy_namespace
  deploy_secrets
  deploy_infrastructure
  deploy_core_services
  deploy_business_services
  deploy_gateway
  deploy_frontend
  deploy_monitoring
  deploy_networking
  deploy_jobs
  print_summary
}

main "$@"
