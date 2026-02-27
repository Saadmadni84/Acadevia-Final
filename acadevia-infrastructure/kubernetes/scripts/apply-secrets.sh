#!/bin/bash
# ============================================================
#  Apply all secrets from files
#  Usage: ./apply-secrets.sh [secrets-dir]
#  Default secrets directory: ../config/
# ============================================================

set -euo pipefail

NAMESPACE="acadevia"
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS_DIR="${1:-$BASE_DIR/config}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo "============================================================"
echo -e " ${BLUE}Acadevia - Apply Secrets & ConfigMaps${NC}"
echo "============================================================"
echo " Source: $SECRETS_DIR"
echo " Namespace: $NAMESPACE"
echo ""

if [ ! -d "$SECRETS_DIR" ]; then
  log_error "Secrets directory not found: $SECRETS_DIR"
  exit 1
fi

# Check namespace exists
if ! kubectl get namespace "$NAMESPACE" &>/dev/null; then
  log_warn "Namespace '$NAMESPACE' does not exist. Creating..."
  kubectl create namespace "$NAMESPACE"
  log_ok "Namespace created."
fi

SUCCESS=0
FAILED=0

# Apply all YAML files in the secrets directory
for f in "$SECRETS_DIR"/*.yml "$SECRETS_DIR"/*.yaml; do
  [ -f "$f" ] || continue
  
  FILENAME=$(basename "$f")
  log_info "Applying: $FILENAME"
  
  if kubectl apply -f "$f" -n "$NAMESPACE" 2>/dev/null; then
    log_ok "Applied: $FILENAME"
    SUCCESS=$((SUCCESS + 1))
  else
    log_error "Failed: $FILENAME"
    FAILED=$((FAILED + 1))
  fi
done

# Check for .env files and create generic secrets from them
for f in "$SECRETS_DIR"/*.env; do
  [ -f "$f" ] || continue
  
  FILENAME=$(basename "$f" .env)
  SECRET_NAME="${FILENAME}-secret"
  log_info "Creating secret from env file: $FILENAME.env → $SECRET_NAME"
  
  if kubectl create secret generic "$SECRET_NAME" \
    --from-env-file="$f" \
    -n "$NAMESPACE" \
    --dry-run=client -o yaml | kubectl apply -f - 2>/dev/null; then
    log_ok "Secret created: $SECRET_NAME"
    SUCCESS=$((SUCCESS + 1))
  else
    log_error "Failed to create secret: $SECRET_NAME"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "============================================================"
echo -e " Applied: ${GREEN}$SUCCESS${NC}  |  Failed: ${RED}$FAILED${NC}"
echo "============================================================"
echo ""

log_info "Current secrets in namespace '$NAMESPACE':"
kubectl get secrets -n "$NAMESPACE" --no-headers 2>/dev/null | awk '{print "  " $1 " (" $2 ")"}'
echo ""

log_info "Current configmaps in namespace '$NAMESPACE':"
kubectl get configmaps -n "$NAMESPACE" --no-headers 2>/dev/null | awk '{print "  " $1}'
echo ""

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi
