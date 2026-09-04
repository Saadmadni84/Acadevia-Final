#!/usr/bin/env bash
# ============================================================
# Acadevia Platform - Kafka Topic Creation Script
# Creates all event topics for the platform microservices
#
# Usage: ./create-topics.sh
# Environment:
#   KAFKA_BOOTSTRAP  - Kafka broker address (default: kafka:9092)
#   REPLICATION      - Replication factor (default: 1 for dev, 3 for prod)
#   RETENTION_MS     - Default retention in ms (default: 7 days)
#   ANALYTICS_RETENTION_MS - Analytics retention (default: 30 days)
# ============================================================
set -euo pipefail

KAFKA_BOOTSTRAP="${KAFKA_BOOTSTRAP:-kafka:9092}"
REPLICATION="${REPLICATION:-1}"            # Dev=1, Production=3
RETENTION_MS="${RETENTION_MS:-604800000}"  # 7 days
ANALYTICS_RETENTION_MS="${ANALYTICS_RETENTION_MS:-2592000000}"  # 30 days

echo "============================================"
echo "Acadevia - Creating Kafka Topics"
echo "  Bootstrap: ${KAFKA_BOOTSTRAP}"
echo "  Replication Factor: ${REPLICATION}"
echo "  Default Retention: 7 days"
echo "  Analytics Retention: 30 days"
echo "============================================"

create_topic() {
    local topic="$1"
    local partitions="$2"
    local retention="${3:-$RETENTION_MS}"

    echo "Creating topic: ${topic} (partitions=${partitions}, replication=${REPLICATION}, retention=${retention}ms)"
    kafka-topics --create \
        --bootstrap-server "$KAFKA_BOOTSTRAP" \
        --topic "$topic" \
        --partitions "$partitions" \
        --replication-factor "$REPLICATION" \
        --config retention.ms="$retention" \
        --if-not-exists
}

# ============================================================
# Auth Events
# ============================================================
echo ""
echo "--- Auth Events ---"
create_topic "user.registered"        6
create_topic "user.logged-in"         3
create_topic "user.password-changed"  3

# ============================================================
# User Events
# ============================================================
echo ""
echo "--- User Events ---"
create_topic "user.profile-updated"    6
create_topic "user.preference-changed" 3
create_topic "user.updated"            6

# ============================================================
# Course Events
# ============================================================
echo ""
echo "--- Course Events ---"
create_topic "course.created"    6
create_topic "course.updated"    6
create_topic "course.enrolled"  12
create_topic "course.completed"  6
create_topic "lesson.completed" 12

# ============================================================
# Content Events
# ============================================================
echo ""
echo "--- Content Events ---"
create_topic "content.uploaded"   6
create_topic "content.processed"  6
create_topic "content.updated"    6
create_topic "content.deleted"    3

# ============================================================
# Quiz Events
# ============================================================
echo ""
echo "--- Quiz Events ---"
create_topic "quiz.created"    6
create_topic "quiz.attempted" 12
create_topic "quiz.completed" 12
create_topic "quiz.updated"    6

# ============================================================
# Game Events
# ============================================================
echo ""
echo "--- Game Events ---"
create_topic "game.started"         6
create_topic "game.completed"      12
create_topic "game.score-submitted" 12

# ============================================================
# Gamification Events
# ============================================================
echo ""
echo "--- Gamification Events ---"
create_topic "xp.earned"       12
create_topic "xp.updated"      12
create_topic "badge.unlocked"   6
create_topic "level.changed"    6
create_topic "streak.updated"   6
create_topic "streak.broken"    3

# ============================================================
# Leaderboard Events
# ============================================================
echo ""
echo "--- Leaderboard Events ---"
create_topic "leaderboard.updated"      6
create_topic "leaderboard.rank-changed" 6

# ============================================================
# Notification Events
# ============================================================
echo ""
echo "--- Notification Events ---"
create_topic "notification.send"  12
create_topic "notification.email"  6
create_topic "notification.sms"    6
create_topic "notification.push"   6

# ============================================================
# Analytics Events (30-day retention)
# ============================================================
echo ""
echo "--- Analytics Events (30-day retention) ---"
create_topic "analytics.event"       12 "$ANALYTICS_RETENTION_MS"
create_topic "analytics.page-view"   12 "$ANALYTICS_RETENTION_MS"
create_topic "analytics.video-watch" 12 "$ANALYTICS_RETENTION_MS"

# ============================================================
# Sync / Offline Events
# ============================================================
echo ""
echo "--- Sync & Offline Events ---"
create_topic "sync.item.received"       12
create_topic "sync.completed"            6
create_topic "sync.conflict.detected"    6
create_topic "offline.xp.earned"        12
create_topic "offline.quiz.completed"   12
create_topic "offline.game.played"       6
create_topic "offline.video.watched"    12
create_topic "offline.activity"         12

# ============================================================
# i18n Events
# ============================================================
echo ""
echo "--- i18n Events ---"
create_topic "i18n.translation-updated" 3

# ============================================================
# Summary
# ============================================================
echo ""
echo "============================================"
echo "All Kafka topics created successfully!"
echo "============================================"
echo "Total topics: $(kafka-topics --list --bootstrap-server "$KAFKA_BOOTSTRAP" | wc -l)"
