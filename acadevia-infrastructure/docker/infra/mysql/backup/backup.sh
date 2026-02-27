#!/usr/bin/env bash
# ============================================================
# Acadevia Platform - MySQL Backup Script
# Backs up all service databases with compression
# ============================================================
set -euo pipefail

# ---- Configuration (override via environment) ----
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASS:-}"
BACKUP_DIR="${BACKUP_DIR:-/backups/mysql}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

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

# ---- Cleanup old backups ----
log "------------------------------------------"
log "Cleaning backups older than ${RETENTION_DAYS} days ..."
DELETED=$(find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +${RETENTION_DAYS} -not -path "$BACKUP_DIR" -print -exec rm -rf {} \; | wc -l | tr -d ' ')
log "Removed ${DELETED} old backup(s)."

# ---- Summary ----
log "=========================================="
log "Backup Complete"
log "  Succeeded: ${SUCCESS_COUNT}"
log "  Failed:    ${FAIL_COUNT}"
log "  Location:  ${BACKUP_PATH}"
log "=========================================="

if [ "$FAIL_COUNT" -gt 0 ]; then
    exit 1
fi
