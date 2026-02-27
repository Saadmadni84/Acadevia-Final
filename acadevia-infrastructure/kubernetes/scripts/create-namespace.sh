#!/bin/bash
# ============================================================
#  Create Acadevia namespace with RBAC
#  Usage: ./create-namespace.sh
# ============================================================

set -euo pipefail

NAMESPACE="acadevia"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }

echo ""
echo "============================================================"
echo -e " ${BLUE}Acadevia - Namespace & RBAC Setup${NC}"
echo "============================================================"

# Create namespace
if kubectl get namespace "$NAMESPACE" &>/dev/null; then
  log_warn "Namespace '$NAMESPACE' already exists."
else
  cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Namespace
metadata:
  name: ${NAMESPACE}
  labels:
    name: ${NAMESPACE}
    project: acadevia
    environment: production
EOF
  log_ok "Namespace '$NAMESPACE' created."
fi

# Create ServiceAccount for deployments
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: acadevia-deployer
  namespace: ${NAMESPACE}
  labels:
    app: acadevia
    role: deployer
EOF
log_ok "ServiceAccount 'acadevia-deployer' created."

# Create Role for namespace-scoped operations
cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: acadevia-admin
  namespace: ${NAMESPACE}
  labels:
    app: acadevia
rules:
  - apiGroups: [""]
    resources: ["pods", "pods/log", "pods/exec", "services", "endpoints", "persistentvolumeclaims", "configmaps", "secrets", "serviceaccounts"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  - apiGroups: ["apps"]
    resources: ["deployments", "daemonsets", "replicasets", "statefulsets"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  - apiGroups: ["batch"]
    resources: ["jobs", "cronjobs"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  - apiGroups: ["networking.k8s.io"]
    resources: ["ingresses", "networkpolicies"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  - apiGroups: ["autoscaling"]
    resources: ["horizontalpodautoscalers"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  - apiGroups: ["policy"]
    resources: ["poddisruptionbudgets"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
EOF
log_ok "Role 'acadevia-admin' created."

# Create RoleBinding
cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: acadevia-admin-binding
  namespace: ${NAMESPACE}
  labels:
    app: acadevia
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: acadevia-admin
subjects:
  - kind: ServiceAccount
    name: acadevia-deployer
    namespace: ${NAMESPACE}
EOF
log_ok "RoleBinding 'acadevia-admin-binding' created."

# Create ResourceQuota
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: acadevia-quota
  namespace: ${NAMESPACE}
  labels:
    app: acadevia
spec:
  hard:
    requests.cpu: "20"
    requests.memory: "40Gi"
    limits.cpu: "40"
    limits.memory: "80Gi"
    pods: "100"
    services: "30"
    persistentvolumeclaims: "20"
    configmaps: "50"
    secrets: "50"
EOF
log_ok "ResourceQuota 'acadevia-quota' created."

# Create LimitRange (defaults)
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: LimitRange
metadata:
  name: acadevia-limits
  namespace: ${NAMESPACE}
  labels:
    app: acadevia
spec:
  limits:
    - type: Container
      default:
        cpu: 500m
        memory: 512Mi
      defaultRequest:
        cpu: 100m
        memory: 128Mi
      max:
        cpu: "4"
        memory: 8Gi
      min:
        cpu: 50m
        memory: 64Mi
EOF
log_ok "LimitRange 'acadevia-limits' created."

echo ""
echo "============================================================"
echo -e " ${GREEN}Namespace setup complete!${NC}"
echo "============================================================"
echo ""
log_info "Namespace details:"
kubectl get namespace "$NAMESPACE" -o yaml | head -20
echo ""
log_info "Resource quotas:"
kubectl get resourcequota -n "$NAMESPACE"
echo ""
