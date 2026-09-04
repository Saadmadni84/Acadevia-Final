#!/usr/bin/env bash
# ============================================================
# Acadevia Platform - MinIO Bucket Initialization
# Creates required storage buckets using the MinIO Client (mc)
# ============================================================
set -euo pipefail

MINIO_HOST="${MINIO_HOST:-http://minio:9000}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-minioadmin}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-minioadmin}"
ALIAS="acadevia"

echo "============================================"
echo "Acadevia - MinIO Bucket Initialization"
echo "  Host: ${MINIO_HOST}"
echo "============================================"

# Wait for MinIO to be ready
echo "Waiting for MinIO to be available ..."
until mc alias set "$ALIAS" "$MINIO_HOST" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" > /dev/null 2>&1; do
    echo "  MinIO not ready yet, retrying in 3s ..."
    sleep 3
done
echo "MinIO is ready."

# Create buckets
BUCKETS=(
    acadevia-videos
    acadevia-images
    acadevia-documents
    acadevia-backups
)

for BUCKET in "${BUCKETS[@]}"; do
    if mc ls "$ALIAS/$BUCKET" > /dev/null 2>&1; then
        echo "  Bucket '${BUCKET}' already exists — skipping."
    else
        mc mb "$ALIAS/$BUCKET"
        echo "  ✓ Created bucket '${BUCKET}'"
    fi
done

# Access policy: keep ALL buckets private.
# Content must be accessed through:
#   - Backend-generated presigned URLs (preferred)
#   - Backend proxy/streaming endpoints
#   - Nginx CDN with explicit AWS v4 signed requests
#
# NOTE: If you want nginx to serve images, configure the nginx CDN location to
# sign requests using mc or an S3 proxy that adds auth headers.
# DO NOT use `mc anonymous set download` on educational content buckets.

echo ""
echo "============================================"
echo "All MinIO buckets are ready (all PRIVATE)."
echo "============================================"
mc ls "$ALIAS"
