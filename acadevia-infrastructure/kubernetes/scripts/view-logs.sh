#!/bin/bash
# ============================================================
#  View/Tail logs for an Acadevia service
#  Usage: ./view-logs.sh <service-name> [lines]
#  Example: ./view-logs.sh auth-service 100
# ============================================================

set -euo pipefail

NAMESPACE="acadevia"

BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

if [ $# -lt 1 ]; then
  echo "Usage: $0 <service-name> [lines] [--follow]"
  echo ""
  echo "Examples:"
  echo "  $0 auth-service             # Last 100 lines"
  echo "  $0 auth-service 500         # Last 500 lines"
  echo "  $0 auth-service --follow    # Tail logs in real-time"
  echo "  $0 auth-service 200 -f      # Last 200 then follow"
  echo ""
  echo "Available services:"
  kubectl get pods -n "$NAMESPACE" -o jsonpath='{range .items[*]}{.metadata.labels.app}{"\n"}{end}' 2>/dev/null | sort -u | grep -v '^$' | sed 's/^/  /'
  exit 1
fi

SERVICE_NAME="$1"
LINES=100
FOLLOW=false

shift
while [ $# -gt 0 ]; do
  case "$1" in
    --follow|-f)
      FOLLOW=true
      ;;
    *)
      if [[ "$1" =~ ^[0-9]+$ ]]; then
        LINES="$1"
      fi
      ;;
  esac
  shift
done

# Find pods
PODS=$(kubectl get pods -n "$NAMESPACE" -l "app=$SERVICE_NAME" --no-headers -o custom-columns=":metadata.name" 2>/dev/null)

if [ -z "$PODS" ]; then
  log_error "No pods found for service '$SERVICE_NAME' in namespace '$NAMESPACE'."
  echo ""
  echo "Available services:"
  kubectl get pods -n "$NAMESPACE" -o jsonpath='{range .items[*]}{.metadata.labels.app}{"\n"}{end}' 2>/dev/null | sort -u | grep -v '^$' | sed 's/^/  /'
  exit 1
fi

POD_COUNT=$(echo "$PODS" | wc -l | tr -d ' ')

if [ "$POD_COUNT" -eq 1 ]; then
  POD_NAME=$(echo "$PODS" | head -1)
  log_info "Showing logs for pod: $POD_NAME (last $LINES lines)"
  echo ""

  if [ "$FOLLOW" = true ]; then
    kubectl logs "$POD_NAME" -n "$NAMESPACE" --tail="$LINES" -f
  else
    kubectl logs "$POD_NAME" -n "$NAMESPACE" --tail="$LINES"
  fi
else
  log_info "Multiple pods found for '$SERVICE_NAME'. Streaming all..."
  echo ""

  if [ "$FOLLOW" = true ]; then
    kubectl logs -l "app=$SERVICE_NAME" -n "$NAMESPACE" --tail="$LINES" -f --prefix
  else
    kubectl logs -l "app=$SERVICE_NAME" -n "$NAMESPACE" --tail="$LINES" --prefix
  fi
fi
