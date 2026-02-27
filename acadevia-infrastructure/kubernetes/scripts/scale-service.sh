#!/bin/bash
# ============================================================
#  Scale Acadevia service
#  Usage: ./scale-service.sh <service-name> <replicas>
#  Example: ./scale-service.sh auth-service 3
# ============================================================

set -euo pipefail

NAMESPACE="acadevia"

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

if [ $# -ne 2 ]; then
  echo "Usage: $0 <service-name> <replicas>"
  echo ""
  echo "Examples:"
  echo "  $0 auth-service 3"
  echo "  $0 api-gateway 5"
  echo "  $0 course-service 0    # Scale down to zero"
  exit 1
fi

SERVICE_NAME="$1"
REPLICAS="$2"

# Validate replicas is a number
if ! [[ "$REPLICAS" =~ ^[0-9]+$ ]]; then
  log_error "Replicas must be a non-negative integer. Got: $REPLICAS"
  exit 1
fi

# Check if deployment exists
if ! kubectl get deployment "$SERVICE_NAME" -n "$NAMESPACE" &>/dev/null; then
  log_error "Deployment '$SERVICE_NAME' not found in namespace '$NAMESPACE'."
  exit 1
fi

# Show current state
CURRENT=$(kubectl get deployment "$SERVICE_NAME" -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')
log_info "Current replicas for '$SERVICE_NAME': $CURRENT"
log_info "Scaling to: $REPLICAS"

if [ "$CURRENT" -eq "$REPLICAS" ]; then
  log_ok "Already at $REPLICAS replicas. No action needed."
  exit 0
fi

# Scale
kubectl scale deployment/"$SERVICE_NAME" --replicas="$REPLICAS" -n "$NAMESPACE"

# Wait for scaling
if [ "$REPLICAS" -gt 0 ]; then
  log_info "Waiting for scaling to complete..."
  kubectl rollout status deployment/"$SERVICE_NAME" -n "$NAMESPACE" --timeout=300s
fi

echo ""
log_ok "Service '$SERVICE_NAME' scaled from $CURRENT to $REPLICAS replicas."
echo ""
log_info "Current pods:"
kubectl get pods -n "$NAMESPACE" -l "app=$SERVICE_NAME" -o wide
