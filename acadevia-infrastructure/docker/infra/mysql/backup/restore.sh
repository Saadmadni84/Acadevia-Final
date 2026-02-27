#!/usr/bin/env bash
# ============================================================
# Acadevia Platform - MySQL Restore Script
# Restores a single database from a gzipped backup file
#
# Usage:
#   ./restore.sh <backup_file.sql.gz> <target_database>
#
# Example:
#   ./restore.sh /backups/mysql/20260101_120000/acadevia_course.sql.gz acadevia_course
# ============================================================
set -euo pipefail

# ---- Configuration (override via environment) ----
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASS:-}"

# ---- Argument validation ----
if [ $# -lt 2 ]; then
    echo "Usage: $0 <backup_file.sql.gz> <target_database>"
    echo ""
    echo "Arguments:"
    echo "  backup_file    Path to the gzipped SQL backup file"
    echo "  target_database Name of the MySQL database to restore into"
    echo ""
    echo "Environment variables:"
    echo "  DB_HOST  MySQL host (default: localhost)"
    echo "  DB_PORT  MySQL port (default: 3306)"
    echo "  DB_USER  MySQL user (default: root)"
    echo "  DB_PASS  MySQL password"
    exit 1
fi

BACKUP_FILE="$1"
TARGET_DB="$2"

# ---- Validate backup file ----
if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

# ---- Confirm restore ----
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "============================================"
echo "Acadevia MySQL Restore"
echo "============================================"
echo "  Backup file:     ${BACKUP_FILE} (${FILE_SIZE})"
echo "  Target database: ${TARGET_DB}"
echo "  Host:            ${DB_HOST}:${DB_PORT}"
echo "  User:            ${DB_USER}"
echo "============================================"
echo ""

read -rp "WARNING: This will overwrite data in '${TARGET_DB}'. Continue? [y/N] " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    exit 0
fi

echo ""
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Creating database if not exists ..."
mysql \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --user="$DB_USER" \
    --password="$DB_PASS" \
    -e "CREATE DATABASE IF NOT EXISTS \`${TARGET_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Restoring ${BACKUP_FILE} into ${TARGET_DB} ..."
gunzip -c "$BACKUP_FILE" | mysql \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --user="$DB_USER" \
    --password="$DB_PASS" \
    "$TARGET_DB"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Restore completed successfully."
echo ""
echo "  Database '${TARGET_DB}' has been restored from:"
echo "  ${BACKUP_FILE}"
