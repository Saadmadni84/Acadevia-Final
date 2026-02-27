#!/bin/bash
# ============================================================
#  Destroy All - Tear down the entire Acadevia platform
#  Usage: ./destroy-all.sh [--force]
#  WARNING: This will delete ALL resources in the namespace!
# ============================================================

set -euo pipefail

NAMESPACE="acadevia"

RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

FORCE=false
if [ "${1:-}" = "--force" ]; then
  FORCE=true
fi

echo ""
echo -e "${RED}============================================================${NC}"
echo -e "${RED} WARNING: DESTRUCTIVE OPERATION${NC}"
echo -e "${RED}============================================================${NC}"
echo ""
echo " This will delete ALL resources in the '$NAMESPACE' namespace:"
echo ""
echo "   - All Deployments, StatefulSets, DaemonSets"
echo "   - All Services, Ingresses, NetworkPolicies"
echo "   - All Jobs, CronJobs"
echo "   - All ConfigMaps, Secrets"
echo "   - All PersistentVolumeClaims (DATA LOSS!)"
echo "   - The namespace itself"
echo ""

# Show what will be deleted
log_info "Resources in namespace '$NAMESPACE':"
echo ""
kubectl get all -n "$NAMESPACE" 2>/dev/null || echo "  Namespace not found."
echo ""

if [ "$FORCE" = false ]; then
  echo -n -e "${YELLOW}Are you sure you want to destroy everything? Type 'yes-destroy-acadevia' to confirm: ${NC}"
  read -r CONFIRM

  if [ "$CONFIRM" != "yes-destroy-acadevia" ]; then
    echo ""
    log_info "Aborted. No resources were deleted."
    exit 0
  fi
fi

echo ""
log_warn "Starting teardown..."
echo ""

# 1. Delete Ingress
log_info "Deleting Ingress resources..."
kubectl delete ingress --all -n "$NAMESPACE" --ignore-not-found=true 2>/dev/null || true
log_ok "Ingress deleted."

# 2. Delete NetworkPolicies
log_info "Deleting NetworkPolicies..."
kubectl delete networkpolicy --all -n "$NAMESPACE" --ignore-not-found=true 2>/dev/null || true
log_ok "NetworkPolicies deleted."

# 3. Delete Jobs & CronJobs
log_info "Deleting Jobs and CronJobs..."
kubectl delete cronjob --all -n "$NAMESPACE" --ignore-not-found=true 2>/dev/null || true
kubectl delete job --all -n "$NAMESPACE" --ignore-not-found=true 2>/dev/null || true
log_ok "Jobs deleted."

# 4. Delete Deployments
log_info "Deleting Deployments..."
kubectl delete deployment --all -n "$NAMESPACE" --ignore-not-found=true 2>/dev/null || true
log_ok "Deployments deleted."

# 5. Delete StatefulSets
log_info "Deleting StatefulSets..."
kubectl delete statefulset --all -n "$NAMESPACE" --ignore-not-found=true 2>/dev/null || true
log_ok "StatefulSets deleted."

# 6. Delete DaemonSets
log_info "Deleting DaemonSets..."
kubectl delete daemonset --all -n "$NAMESPACE" --ignore-not-found=true 2>/dev/null || true
log_ok "DaemonSets deleted."

# 7. Delete Services
log_info "Deleting Services..."
kubectl delete service --all -n "$NAMESPACE" --ignore-not-found=true 2>/dev/null || true
log_ok "Services deleted."

# 8. Delete HPA/VPA
log_info "Deleting autoscaling resources..."
kubectl delete hpa --all -n "$NAMESPACE" --ignore-not-found=true 2>/dev/null || true
kubectl delete vpa --all -n "$NAMESPACE" --ignore-not-found=true 2>/dev/null || true
log_ok "Autoscaling resources deleted."

# 9. Delete PDBs
log_info "Deleting PodDisruptionBudgets..."
kubectl delete pdb --all -n "$NAMESPACE" --ignore-not-found=true 2>/dev/null || true
log_ok "PDBs deleted."

# 10. Delete ConfigMaps and Secrets
log_info "Deleting ConfigMaps and Secrets..."
kubectl delete configmap --all -n "$NAMESPACE" --ignore-not-found=true 2>/dev/null || true
kubectl delete secret --all -n "$NAMESPACE" --ignore-not-found=true 2>/dev/null || true
log_ok "ConfigMaps and Secrets deleted."

# 11. Delete PVCs (data loss!)
log_info "Deleting PersistentVolumeClaims..."
kubectl delete pvc --all -n "$NAMESPACE" --ignore-not-found=true 2>/dev/null || true
log_ok "PVCs deleted."

# 12. Delete ServiceAccounts (except default)
log_info "Deleting ServiceAccounts..."
kubectl get serviceaccount -n "$NAMESPACE" --no-headers -o name 2>/dev/null | grep -v "default" | xargs -r kubectl delete -n "$NAMESPACE" 2>/dev/null || true
log_ok "ServiceAccounts deleted."

# 13. Wait for all pods to terminate
log_info "Waiting for all pods to terminate..."
TIMEOUT=120
ELAPSED=0
while kubectl get pods -n "$NAMESPACE" --no-headers 2>/dev/null | grep -q .; do
  sleep 5
  ELAPSED=$((ELAPSED + 5))
  if [ $ELAPSED -ge $TIMEOUT ]; then
    log_warn "Timeout waiting for pods to terminate. Force deleting..."
    kubectl delete pods --all -n "$NAMESPACE" --force --grace-period=0 2>/dev/null || true
    break
  fi
done
log_ok "All pods terminated."

# 14. Delete ClusterRole/Bindings for this project
log_info "Cleaning up cluster-scoped RBAC..."
kubectl delete clusterrolebinding prometheus --ignore-not-found=true 2>/dev/null || true
kubectl delete clusterrole prometheus --ignore-not-found=true 2>/dev/null || true
kubectl delete clusterrolebinding promtail --ignore-not-found=true 2>/dev/null || true
kubectl delete clusterrole promtail --ignore-not-found=true 2>/dev/null || true
log_ok "Cluster RBAC cleaned."

# 15. Delete the namespace
log_info "Deleting namespace '$NAMESPACE'..."
kubectl delete namespace "$NAMESPACE" --ignore-not-found=true 2>/dev/null || true
log_ok "Namespace deleted."

echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN} Acadevia platform teardown complete.${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
