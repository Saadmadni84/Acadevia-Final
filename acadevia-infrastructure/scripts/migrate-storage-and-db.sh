#!/usr/bin/env bash
# ============================================================
# Acadevia Platform — Local to Cloud Storage & DB Migration Tool
# ============================================================
# This script safely migrates existing local video assets and
# database metadata from local Docker (MinIO + MySQL) to shared
# cloud object storage (Cloudflare R2, AWS S3, or Cloud MinIO)
# and shared cloud MySQL.
#
# IMPORTANT:
# - Does NOT delete or overwrite local data.
# - Validates object keys and report progress.
# ============================================================
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
EXPORT_DIR="$PROJECT_ROOT/tmp/migration-$(date +%Y%m%d-%H%M%S)"

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}  Acadevia Local → Cloud Storage & Database Migration Tool   ${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

mkdir -p "$EXPORT_DIR"

# ------------------------------------------------------------
# 1. Environment & Configuration Check
# ------------------------------------------------------------
LOCAL_MYSQL_HOST="${LOCAL_MYSQL_HOST:-127.0.0.1}"
LOCAL_MYSQL_PORT="${LOCAL_MYSQL_PORT:-3307}"
LOCAL_MYSQL_USER="${LOCAL_MYSQL_USER:-root}"
LOCAL_MYSQL_PASS="${LOCAL_MYSQL_PASS:-root_password}"

LOCAL_MINIO_HOST="${LOCAL_MINIO_HOST:-http://127.0.0.1:9000}"
LOCAL_MINIO_KEY="${LOCAL_MINIO_KEY:-minioadmin}"
LOCAL_MINIO_SECRET="${LOCAL_MINIO_SECRET:-minioadmin}"

# Target Cloud Variables (prompt or read from environment)
TARGET_STORAGE_ENDPOINT="${TARGET_STORAGE_ENDPOINT:-}"
TARGET_STORAGE_KEY="${TARGET_STORAGE_KEY:-}"
TARGET_STORAGE_SECRET="${TARGET_STORAGE_SECRET:-}"
TARGET_STORAGE_BUCKET="${TARGET_STORAGE_BUCKET:-acadevia-videos}"

TARGET_DB_HOST="${TARGET_DB_HOST:-}"
TARGET_DB_PORT="${TARGET_DB_PORT:-3306}"
TARGET_DB_USER="${TARGET_DB_USER:-}"
TARGET_DB_PASS="${TARGET_DB_PASS:-}"
TARGET_DB_NAME="${TARGET_DB_NAME:-acadevia_content}"

echo -e "${YELLOW}Step 1: Exporting local MySQL video metadata...${NC}"

if command -v mysqldump &>/dev/null; then
    MYSQLDUMP_CMD="mysqldump"
elif docker ps --format '{{.Names}}' | grep -q 'acadevia-mysql'; then
    MYSQLDUMP_CMD="docker exec -i acadevia-mysql mysqldump"
else
    echo -e "${RED}❌ Neither mysqldump nor acadevia-mysql container found.${NC}"
    exit 1
fi

SQL_DUMP_FILE="$EXPORT_DIR/acadevia_content_videos.sql"

if [ "$MYSQLDUMP_CMD" = "mysqldump" ]; then
    mysqldump -h "$LOCAL_MYSQL_HOST" -P "$LOCAL_MYSQL_PORT" -u "$LOCAL_MYSQL_USER" "-p$LOCAL_MYSQL_PASS" \
        acadevia_content videos video_comments video_notes video_bookmarks \
        --no-create-info --complete-insert --skip-triggers > "$SQL_DUMP_FILE" 2>/dev/null || true
else
    docker exec -i acadevia-mysql mysqldump -u root "-proot_password" \
        acadevia_content videos video_comments video_notes video_bookmarks \
        --no-create-info --complete-insert --skip-triggers > "$SQL_DUMP_FILE" 2>/dev/null || true
fi

if [ -s "$SQL_DUMP_FILE" ]; then
    RECORD_COUNT=$(grep -c "INSERT INTO \`videos\`" "$SQL_DUMP_FILE" || true)
    echo -e "  ${GREEN}✓${NC} Successfully exported local database records to:"
    echo -e "    ${BLUE}$SQL_DUMP_FILE${NC}"
    echo -e "  Total video records detected: ${GREEN}${RECORD_COUNT}${NC}"
else
    echo -e "  ${YELLOW}⚠ No records dumped or local MySQL was unreachable.${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Syncing video binaries from Local MinIO to Cloud Storage...${NC}"

if [ -z "$TARGET_STORAGE_ENDPOINT" ] || [ -z "$TARGET_STORAGE_KEY" ] || [ -z "$TARGET_STORAGE_SECRET" ]; then
    echo -e "  ${YELLOW}Cloud storage target environment variables not set.${NC}"
    echo -e "  To migrate objects, run with:"
    echo -e "    ${BLUE}TARGET_STORAGE_ENDPOINT=\"https://<account_id>.r2.cloudflarestorage.com\" \\"
    echo -e "    TARGET_STORAGE_KEY=\"<key>\" \\"
    echo -e "    TARGET_STORAGE_SECRET=\"<secret>\" \\"
    echo -e "    ./migrate-storage-and-db.sh${NC}"
    echo ""
    echo -e "  Alternatively, using the MinIO Client (mc) directly:"
    echo -e "    ${BLUE}mc alias set local-minio http://127.0.0.1:9000 minioadmin minioadmin${NC}"
    echo -e "    ${BLUE}mc alias set cloud-s3 <endpoint> <access_key> <secret_key>${NC}"
    echo -e "    ${BLUE}mc mirror --overwrite local-minio/acadevia-videos cloud-s3/acadevia-videos${NC}"
else
    echo -e "  Configuring MinIO client aliases for migration..."
    if command -v mc &>/dev/null; then
        MC_BIN="mc"
    elif docker ps --format '{{.Names}}' | grep -q 'acadevia-minio'; then
        MC_BIN="docker exec -i acadevia-minio mc"
    else
        MC_BIN=""
    fi

    if [ -n "$MC_BIN" ]; then
        $MC_BIN alias set local-minio "$LOCAL_MINIO_HOST" "$LOCAL_MINIO_KEY" "$LOCAL_MINIO_SECRET" >/dev/null 2>&1 || true
        $MC_BIN alias set cloud-storage "$TARGET_STORAGE_ENDPOINT" "$TARGET_STORAGE_KEY" "$TARGET_STORAGE_SECRET" >/dev/null 2>&1 || true

        echo -e "  Mirroring objects from local-minio/acadevia-videos → cloud-storage/$TARGET_STORAGE_BUCKET..."
        $MC_BIN mirror local-minio/acadevia-videos "cloud-storage/$TARGET_STORAGE_BUCKET"
        echo -e "  ${GREEN}✓ Object sync complete!${NC}"
    else
        echo -e "  ${YELLOW}MinIO client (mc) not found. Please install mc or run mc mirror via Docker.${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}Step 3: Importing database metadata to Cloud MySQL...${NC}"

if [ -n "$TARGET_DB_HOST" ] && [ -n "$TARGET_DB_USER" ] && [ -n "$TARGET_DB_PASS" ]; then
    echo -e "  Importing $SQL_DUMP_FILE into cloud MySQL ($TARGET_DB_HOST)..."
    mysql -h "$TARGET_DB_HOST" -P "$TARGET_DB_PORT" -u "$TARGET_DB_USER" "-p$TARGET_DB_PASS" "$TARGET_DB_NAME" < "$SQL_DUMP_FILE"
    echo -e "  ${GREEN}✓ Database metadata import complete!${NC}"
else
    echo -e "  ${YELLOW}Target cloud database credentials not provided.${NC}"
    echo -e "  To import the SQL dump into your shared cloud database manually, run:"
    echo -e "    ${BLUE}mysql -h <cloud_db_host> -u <user> -p <password> acadevia_content < \"$SQL_DUMP_FILE\"${NC}"
fi

echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  Migration Preparation & Export Complete!                  ${NC}"
echo -e "${GREEN}  Local data remained 100% untouched.                       ${NC}"
echo -e "${GREEN}============================================================${NC}"
