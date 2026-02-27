#!/bin/bash
# ============================================================
#  Deploy / Update a single Acadevia service
#  Usage: ./deploy-service.sh <service-name> <image-tag>
#  Example: ./deploy-service.sh auth-service v1.2.3
# ============================================================

set -euo pipefail

NAMESPACE="acadevia"
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

if [ $# -lt 1 ]; then
  echo "Usage: $0 <service-name> [image-tag]"
  echo ""
  echo "Examples:"
  echo "  $0 auth-service"
  echo "  $0 auth-service v1.2.3"
  echo "  $0 api-gateway latest"
  exit 1
fi

SERVICE_NAME="$1"
IMAGE_TAG="${2:-}"

log_info "Deploying service: $SERVICE_NAME"

# Check if deployment exists
if ! kubectl get deployment "$SERVICE_NAME" -n "$NAMESPACE" &>/dev/null; then
  log_error "Deployment '$SERVICE_NAME' not found in namespace '$NAMESPACE'."

  # Try applying manifests if they exist
  SVC_DIR="$BASE_DIR/services/$SERVICE_NAME"
  if [ -d "$SVC_DIR" ]; then
    log_info "Found manifests at $SVC_DIR. Applying..."
    kubectl apply -f "$SVC_DIR/" -n "$NAMESPACE"
    log_ok "Manifests applied for $SERVICE_NAME."
  else
    log_error "No manifests found at $SVC_DIR."
    exit 1
  fi
fi

# Update image tag if provided
if [ -n "$IMAGE_TAG" ]; then
  REGISTRY="${DOCKER_REGISTRY:-acadevia}"
  NEW_IMAGE="$REGISTRY/$SERVICE_NAME:$IMAGE_TAG"

  log_info "Updating image to: $NEW_IMAGE"
  kubectl set image deployment/"$SERVICE_NAME" \
    "$SERVICE_NAME=$NEW_IMAGE" \
    -n "$NAMESPACE"
fi

# Watch the rollout
log_info "Performing rolling update..."
kubectl rollout status deployment/"$SERVICE_NAME" -n "$NAMESPACE" --timeout=300s

echo ""
log_ok "Service '$SERVICE_NAME' deployed successfully!"
echo ""
log_info "Current pods:"
kubectl get pods -n "$NAMESPACE" -l "app=$SERVICE_NAME" -o wide
echo ""
log_info "Deployment details:"
kubectl get deployment "$SERVICE_NAME" -n "$NAMESPACE" -o wide
