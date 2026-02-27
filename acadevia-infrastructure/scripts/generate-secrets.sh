#!/bin/bash
set -e

# ============================================================
# Acadevia Platform — Generate Secrets
# ============================================================

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔐 Generating Acadevia Secrets...${NC}"
echo ""
echo -e "${YELLOW}Copy these values to your .env file:${NC}"
echo ""

echo "# ============================================"
echo "# Acadevia — Generated Secrets"
echo "# Generated on: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "# ============================================"
echo ""

# Database passwords
echo "# ── Database ──"
echo "MYSQL_ROOT_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)"
echo "MYSQL_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)"
echo ""

# Redis
echo "# ── Redis ──"
echo "REDIS_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)"
echo ""

# JWT
echo "# ── JWT ──"
echo "JWT_SECRET=$(openssl rand -base64 48 | tr -d '/+=' | head -c 64)"
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 48 | tr -d '/+=' | head -c 64)"
echo ""

# Kafka
echo "# ── Kafka ──"
echo "KAFKA_CLUSTER_ID=$(openssl rand -base64 16 | tr -d '/+=' | head -c 22)"
echo ""

# MinIO
echo "# ── MinIO ──"
echo "MINIO_ROOT_USER=admin"
echo "MINIO_ROOT_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)"
echo ""

# Encryption keys
echo "# ── Encryption ──"
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)"
echo "APP_SECRET=$(openssl rand -hex 32)"
echo ""

# OAuth
echo "# ── OAuth (replace with real values) ──"
echo "GOOGLE_CLIENT_ID=your-google-client-id"
echo "GOOGLE_CLIENT_SECRET=$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)"
echo ""

# Monitoring
echo "# ── Grafana ──"
echo "GRAFANA_ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d '/+=' | head -c 16)"
echo ""

# Config server encryption
echo "# ── Config Server ──"
echo "CONFIG_ENCRYPT_KEY=$(openssl rand -hex 32)"
echo ""

echo -e "${GREEN}✅ Secrets generated successfully${NC}"
echo -e "${YELLOW}⚠️  Store these securely! Never commit to version control.${NC}"
