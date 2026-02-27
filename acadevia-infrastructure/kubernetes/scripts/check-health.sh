#!/bin/bash
# ============================================================
#  Health Check - All Acadevia pods and services
#  Usage: ./check-health.sh
# ============================================================

set -euo pipefail

NAMESPACE="acadevia"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
  echo ""
  echo "============================================================"
  echo -e " ${CYAN}$1${NC}"
  echo "============================================================"
}

# ============================================================
# Cluster Info
# ============================================================
print_header "Cluster Information"
echo -e "  Cluster: $(kubectl config current-context)"
echo -e "  Namespace: $NAMESPACE"
echo -e "  Date: $(date '+%Y-%m-%d %H:%M:%S %Z')"

# ============================================================
# Node Status
# ============================================================
print_header "Node Status"
kubectl get nodes -o wide 2>/dev/null || echo "  Unable to list nodes."

# ============================================================
# Pod Status
# ============================================================
print_header "Pod Status"

TOTAL_PODS=$(kubectl get pods -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l | tr -d ' ')
RUNNING_PODS=$(kubectl get pods -n "$NAMESPACE" --no-headers --field-selector=status.phase=Running 2>/dev/null | wc -l | tr -d ' ')
PENDING_PODS=$(kubectl get pods -n "$NAMESPACE" --no-headers --field-selector=status.phase=Pending 2>/dev/null | wc -l | tr -d ' ')
FAILED_PODS=$(kubectl get pods -n "$NAMESPACE" --no-headers --field-selector=status.phase=Failed 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo -e "  Total: $TOTAL_PODS  |  ${GREEN}Running: $RUNNING_PODS${NC}  |  ${YELLOW}Pending: $PENDING_PODS${NC}  |  ${RED}Failed: $FAILED_PODS${NC}"
echo ""

kubectl get pods -n "$NAMESPACE" --sort-by='.metadata.name' \
  -o custom-columns="\
NAME:.metadata.name,\
STATUS:.status.phase,\
READY:.status.containerStatuses[0].ready,\
RESTARTS:.status.containerStatuses[0].restartCount,\
AGE:.metadata.creationTimestamp,\
NODE:.spec.nodeName" 2>/dev/null || echo "  No pods found."

# ============================================================
# Deployments
# ============================================================
print_header "Deployment Status"
kubectl get deployments -n "$NAMESPACE" \
  -o custom-columns="\
NAME:.metadata.name,\
DESIRED:.spec.replicas,\
CURRENT:.status.replicas,\
READY:.status.readyReplicas,\
AVAILABLE:.status.availableReplicas,\
AGE:.metadata.creationTimestamp" 2>/dev/null || echo "  No deployments found."

# ============================================================
# StatefulSets
# ============================================================
print_header "StatefulSet Status"
kubectl get statefulsets -n "$NAMESPACE" 2>/dev/null || echo "  No statefulsets found."

# ============================================================
# DaemonSets
# ============================================================
print_header "DaemonSet Status"
kubectl get daemonsets -n "$NAMESPACE" 2>/dev/null || echo "  No daemonsets found."

# ============================================================
# Services
# ============================================================
print_header "Services"
kubectl get svc -n "$NAMESPACE" 2>/dev/null || echo "  No services found."

# ============================================================
# Ingress
# ============================================================
print_header "Ingress"
kubectl get ingress -n "$NAMESPACE" 2>/dev/null || echo "  No ingress found."

# ============================================================
# PVCs
# ============================================================
print_header "Persistent Volume Claims"
kubectl get pvc -n "$NAMESPACE" 2>/dev/null || echo "  No PVCs found."

# ============================================================
# Recent Events (Warnings)
# ============================================================
print_header "Recent Warning Events (last 10)"
kubectl get events -n "$NAMESPACE" \
  --field-selector type=Warning \
  --sort-by='.lastTimestamp' \
  2>/dev/null | tail -12 || echo "  No warning events."

# ============================================================
# Pods with restart issues
# ============================================================
print_header "Pods with High Restarts (> 3)"
kubectl get pods -n "$NAMESPACE" -o json 2>/dev/null | \
  jq -r '.items[] | select(.status.containerStatuses != null) | .status.containerStatuses[] | select(.restartCount > 3) | "\(.name) — restarts: \(.restartCount)"' 2>/dev/null || echo "  None found."

# ============================================================
# Resource Usage (if metrics-server is available)
# ============================================================
print_header "Resource Usage (requires metrics-server)"
kubectl top pods -n "$NAMESPACE" 2>/dev/null || echo "  Metrics server not available."

# ============================================================
# Jobs
# ============================================================
print_header "Jobs"
kubectl get jobs -n "$NAMESPACE" 2>/dev/null || echo "  No jobs found."

# ============================================================
# CronJobs
# ============================================================
print_header "CronJobs"
kubectl get cronjobs -n "$NAMESPACE" 2>/dev/null || echo "  No cronjobs found."

# ============================================================
# Summary
# ============================================================
echo ""
echo "============================================================"
if [ "$FAILED_PODS" -gt 0 ] || [ "$PENDING_PODS" -gt 0 ]; then
  echo -e " ${YELLOW}Health Check: Issues detected. Review details above.${NC}"
else
  echo -e " ${GREEN}Health Check: All systems operational!${NC}"
fi
echo "============================================================"
echo ""
