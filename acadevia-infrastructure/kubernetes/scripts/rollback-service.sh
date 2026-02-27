#!/bin/bash
# ============================================================
#  Rollback Acadevia service deployment
#  Usage: ./rollback-service.sh <service-name> [revision]
#  Example: ./rollback-service.sh auth-service
#  Example: ./rollback-service.sh auth-service 3
# ============================================================

set -euo pipefail

NAMESPACE="acadevia"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

if [ $# -lt 1 ]; then
  echo "Usage: $0 <service-name> [revision-number]"
  echo ""
  echo "Examples:"
  echo "  $0 auth-service          # Rollback to previous revision"
  echo "  $0 auth-service 3        # Rollback to specific revision"
  exit 1
fi

SERVICE_NAME="$1"
REVISION="${2:-}"

# Check if deployment exists
if ! kubectl get deployment "$SERVICE_NAME" -n "$NAMESPACE" &>/dev/null; then
  log_error "Deployment '$SERVICE_NAME' not found in namespace '$NAMESPACE'."
  exit 1
fi

# Show current state
log_info "Current deployment status:"
kubectl get deployment "$SERVICE_NAME" -n "$NAMESPACE" -o wide
echo ""

# Show rollout history
log_info "Rollout history:"
kubectl rollout history deployment/"$SERVICE_NAME" -n "$NAMESPACE"
echo ""

# Perform rollback
if [ -n "$REVISION" ]; then
  log_info "Rolling back '$SERVICE_NAME' to revision $REVISION..."
  kubectl rollout undo deployment/"$SERVICE_NAME" -n "$NAMESPACE" --to-revision="$REVISION"
else
  log_info "Rolling back '$SERVICE_NAME' to previous revision..."
  kubectl rollout undo deployment/"$SERVICE_NAME" -n "$NAMESPACE"
fi

# Wait for rollback to complete
log_info "Waiting for rollback to complete..."
kubectl rollout status deployment/"$SERVICE_NAME" -n "$NAMESPACE" --timeout=300s

echo ""
log_ok "Rollback of '$SERVICE_NAME' completed successfully!"
echo ""

log_info "Updated deployment:"
kubectl get deployment "$SERVICE_NAME" -n "$NAMESPACE" -o wide
echo ""

log_info "Current pods:"
kubectl get pods -n "$NAMESPACE" -l "app=$SERVICE_NAME" -o wide
