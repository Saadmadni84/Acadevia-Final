#!/usr/bin/env bash
# ============================================================
# Acadevia Platform - MySQL Backup Script
# Backs up all service databases with compression,
# then uploads to MinIO acadevia-backups bucket.
# ============================================================
set -euo pipefail

# ---- Configuration (override via environment) ----
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASS:-}"
BACKUP_DIR="${BACKUP_DIR:-/backups/mysql}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# MinIO upload config
MINIO_CONTAINER="${MINIO_CONTAINER:-acadevia-minio}"
MINIO_ALIAS="${MINIO_ALIAS:-local}"
MINIO_ENDPOINT="${MINIO_ENDPOINT:-http://localhost:9000}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-minioadmin}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-minioadmin}"
MINIO_BUCKET="${MINIO_BUCKET:-acadevia-backups}"

# All Acadevia databases
DATABASES=(
    acadevia_auth
    acadevia_user
    acadevia_course
    acadevia_content
    acadevia_quiz
    acadevia_game
    acadevia_gamification
    acadevia_leaderboard
    acadevia_notification
    acadevia_admin
    acadevia_locale
    acadevia_sync
    acadevia_analytics
)

# ---- Helpers ----
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="${BACKUP_DIR}/${TIMESTAMP}"
LOG_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.log"

log() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo "$msg"
    echo "$msg" >> "$LOG_FILE"
}

# ---- Main ----
mkdir -p "$BACKUP_PATH"
touch "$LOG_FILE"

log "=========================================="
log "Acadevia MySQL Backup - Started"
log "Host:      ${DB_HOST}:${DB_PORT}"
log "Backup to: ${BACKUP_PATH}"
log "=========================================="

SUCCESS_COUNT=0
FAIL_COUNT=0

for DB in "${DATABASES[@]}"; do
    DUMP_FILE="${BACKUP_PATH}/${DB}.sql.gz"
    log "Backing up [${DB}] ..."
    if mysqldump \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --user="$DB_USER" \
        --password="$DB_PASS" \
        --single-transaction \
        --routines \
        --triggers \
        --set-gtid-purged=OFF \
        "$DB" 2>>"$LOG_FILE" | gzip > "$DUMP_FILE"; then
        SIZE=$(du -h "$DUMP_FILE" | cut -f1)
        log "  ✓ ${DB} backed up successfully (${SIZE})"
        ((SUCCESS_COUNT++))
    else
        log "  ✗ FAILED to back up ${DB}"
        ((FAIL_COUNT++))
    fi
done

# ---- Upload to MinIO (acadevia-backups) ----
log "------------------------------------------"
log "Uploading backups to MinIO (${MINIO_BUCKET}) ..."

UPLOAD_OK=0

# Check if minio container is reachable via docker
if docker inspect "$MINIO_CONTAINER" >/dev/null 2>&1; then
    # Configure mc alias inside the minio container
    docker exec "$MINIO_CONTAINER" mc alias set "$MINIO_ALIAS" \
        "$MINIO_ENDPOINT" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" \
        --api S3v4 >/dev/null 2>&1

    for DUMP_FILE in "${BACKUP_PATH}"/*.sql.gz; do
        [ -f "$DUMP_FILE" ] || continue
        FILENAME=$(basename "$DUMP_FILE")
        log "  Uploading: ${FILENAME}"
        # Copy from host into the running minio container and upload via mc pipe
        if cat "$DUMP_FILE" | docker exec -i "$MINIO_CONTAINER" \
            mc pipe "${MINIO_ALIAS}/${MINIO_BUCKET}/db-backups/${TIMESTAMP}/${FILENAME}"; then
            log "  ✓ Uploaded ${FILENAME}"
            ((UPLOAD_OK++))
        else
            log "  ✗ FAILED to upload ${FILENAME}"
        fi
    done

    # Clean old remote backups
    log "  Cleaning remote backups older than ${RETENTION_DAYS} days ..."
    docker exec "$MINIO_CONTAINER" mc rm --recursive --force \
        --older-than "${RETENTION_DAYS}d" \
        "${MINIO_ALIAS}/${MINIO_BUCKET}/db-backups/" 2>/dev/null || true
else
    log "  ⚠ MinIO container '${MINIO_CONTAINER}' not found — skipping upload"
    log "    Backups remain at: ${BACKUP_PATH}"
fi

# ---- Cleanup old local backups ----
log "------------------------------------------"
log "Cleaning local backups older than ${RETENTION_DAYS} days ..."
DELETED=$(find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +${RETENTION_DAYS} -not -path "$BACKUP_DIR" -print -exec rm -rf {} \; | wc -l | tr -d ' ')
log "Removed ${DELETED} old local backup(s)."

# ---- Summary ----
log "=========================================="
log "Backup Complete"
log "  DB Dumps:    Succeeded=${SUCCESS_COUNT}  Failed=${FAIL_COUNT}"
log "  MinIO:       Uploaded=${UPLOAD_OK}"
log "  Local Path:  ${BACKUP_PATH}"
log "=========================================="

if [ "$FAIL_COUNT" -gt 0 ]; then
    exit 1
fi
