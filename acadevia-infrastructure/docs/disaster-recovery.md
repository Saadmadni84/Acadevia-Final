# Acadevia Platform — Disaster Recovery & Backup Procedures

> **Version:** 1.0 | **Last Updated:** February 2026  
> **Audience:** DevOps Engineers, SREs, Engineering Leadership  
> **Review Cycle:** Quarterly

---

## Table of Contents

- [Backup Strategy Overview](#backup-strategy-overview)
- [Recovery Objectives](#recovery-objectives)
- [Automated Backups](#automated-backups)
- [Manual Backup Procedures](#manual-backup-procedures)
- [Restore Procedures](#restore-procedures)
- [Point-in-Time Recovery (MySQL)](#point-in-time-recovery-mysql)
- [Kafka Data Recovery](#kafka-data-recovery)
- [Redis Data Recovery](#redis-data-recovery)
- [MinIO / Object Storage Recovery](#minio--object-storage-recovery)
- [Full Disaster Recovery Plan](#full-disaster-recovery-plan)
- [DR Testing Schedule](#dr-testing-schedule)
- [Appendix: Backup Inventory](#appendix-backup-inventory)

---

## Backup Strategy Overview

### What Is Backed Up

| Data Store | Data Description | Backup Method | Frequency | Retention |
|------------|-----------------|---------------|-----------|-----------|
| **MySQL** | All 11 databases (users, courses, auth, quiz, etc.) | `mysqldump --single-transaction` | Daily 2:00 AM IST | 30 daily, 12 weekly, 6 monthly |
| **Redis** | Sessions, cached data, leaderboards | RDB snapshot | Every 6 hours | 7 days |
| **Kafka** | Event topics (user.*, course.*, etc.) | Topic retention policy | Continuous | 7 days (on-broker) |
| **MinIO** | Course content, avatars, exports | Bucket replication / mc mirror | Daily | 90 days |
| **Kubernetes Config** | ConfigMaps, Secrets, manifests | Git (version-controlled) | Every commit | Indefinite |
| **Monitoring Data** | Prometheus metrics, Grafana dashboards | Volume snapshots | Weekly | 30 days |

### Backup Destinations

| Tier | Destination | Use Case |
|------|------------|----------|
| **Primary** | MinIO/S3 bucket (`acadevia-backups`) | Daily automated backups |
| **Secondary** | Off-site S3 (different region) | Disaster recovery |
| **Tertiary** | Local volume (CronJob PVC) | Immediate access for quick restores |

### Backup Architecture

```
┌─────────────┐    mysqldump     ┌──────────────┐    mc cp      ┌──────────────┐
│   MySQL     │────────────────▶│  K8s CronJob │────────────▶│  MinIO/S3    │
│   (Source)  │  gzip compress   │  (Backup Pod)│  upload      │  (Primary)   │
└─────────────┘                  └──────────────┘              └──────┬───────┘
                                                                      │ replicate
                                                                      ▼
                                                               ┌──────────────┐
                                                               │  Off-site S3 │
                                                               │  (Secondary) │
                                                               └──────────────┘
```

---

## Recovery Objectives

### RTO (Recovery Time Objective)

| Scenario | RTO Target | Description |
|----------|-----------|-------------|
| Single service failure | **5 minutes** | Kubernetes self-healing, pod restart |
| Database corruption (single DB) | **30 minutes** | Restore from latest backup |
| Full database failure | **1 hour** | Restore all databases from backup |
| Complete cluster failure | **4 hours** | Re-provision cluster, restore from backups |
| Region/datacenter failure | **8 hours** | Failover to secondary region, restore data |

### RPO (Recovery Point Objective)

| Data Type | RPO Target | Backup Frequency | Max Data Loss |
|-----------|-----------|-------------------|---------------|
| User data (MySQL) | **< 24 hours** | Daily at 2 AM IST | Up to 24h of transactions |
| User sessions (Redis) | **Acceptable loss** | Every 6 hours | Sessions can be re-created |
| Event data (Kafka) | **7 days retention** | Continuous (on-broker) | None (within retention) |
| Uploaded files (MinIO) | **< 24 hours** | Daily mirror | Up to 24h of uploads |
| System config | **Zero loss** | Git-versioned | None (in Git history) |

> **Note:** For stricter RPO (< 1 hour), enable MySQL binary logging and configure continuous binlog backup to S3.

---

## Automated Backups

### MySQL Database Backup (CronJob)

A Kubernetes CronJob runs daily at 2:00 AM IST (8:30 PM UTC):

**Schedule:** `30 20 * * *`

**What it does:**
1. Connects to MySQL with backup credentials
2. Dumps each database individually with `mysqldump --single-transaction`
3. Compresses with gzip
4. Uploads to MinIO/S3 bucket (`acadevia-backups/db-backups/<timestamp>/`)
5. Cleans up remote backups older than 30 days
6. Removes local temporary files

**Databases backed up:**
- `acadevia_users`
- `acadevia_courses`
- `acadevia_auth`
- `acadevia_quiz`
- `acadevia_gamification`
- `acadevia_notifications`
- `acadevia_content`
- `acadevia_admin`
- `acadevia_leaderboard`
- `acadevia_locale`
- `acadevia_sync`

**Monitor backup status:**

```bash
# Check CronJob schedule
kubectl get cronjobs -n acadevia

# Check recent backup jobs
kubectl get jobs -n acadevia | grep backup | tail -5

# Check last backup job logs
kubectl logs job/$(kubectl get jobs -n acadevia -o name | grep backup | tail -1 | cut -d/ -f2) -n acadevia
```

**Alert on failure:** Configure a Grafana alert for `kube_job_status_failed{job_name=~"db-backup.*"} > 0`.

### Redis Snapshot (RDB)

Redis is configured with periodic RDB snapshots:

```
save 3600 1      # Snapshot every 60 min if at least 1 key changed
save 300 100     # Snapshot every 5 min if at least 100 keys changed
save 60 10000    # Snapshot every 1 min if at least 10000 keys changed
```

RDB files are stored on the `redis-data` persistent volume.

### MinIO Replication

For production, configure MinIO bucket replication to a secondary S3 target:

```bash
# Set up replication (one-time)
mc alias set primary http://minio:9000 $MINIO_ACCESS_KEY $MINIO_SECRET_KEY
mc alias set secondary https://s3-backup.example.com $S3_ACCESS_KEY $S3_SECRET_KEY

# Enable replication
mc replicate add primary/content --remote-bucket secondary/content-backup
mc replicate add primary/avatars --remote-bucket secondary/avatars-backup
mc replicate add primary/exports --remote-bucket secondary/exports-backup
```

---

## Manual Backup Procedures

### Manual MySQL Backup (Docker/Development)

```bash
# Using Makefile
make db-backup
# Output: acadevia-infrastructure/backups/acadevia_backup_<timestamp>.sql

# Manual via Docker
docker exec acadevia-mysql mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" \
  --all-databases --single-transaction --routines --triggers \
  | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Manual MySQL Backup (Kubernetes/Production)

```bash
# Trigger the CronJob manually
kubectl create job --from=cronjob/db-backup \
  manual-backup-$(date +%s) -n acadevia

# Watch job progress
kubectl logs -f job/manual-backup-$(date +%s) -n acadevia
```

### Manual Single-Database Backup

```bash
# Backup a specific database
docker exec acadevia-mysql mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" \
  --single-transaction --routines --triggers \
  acadevia_courses | gzip > courses_backup_$(date +%Y%m%d).sql.gz
```

### Manual Redis Backup

```bash
# Trigger an RDB snapshot
docker exec acadevia-redis redis-cli BGSAVE

# Check save status
docker exec acadevia-redis redis-cli LASTSAVE

# Copy the RDB file
docker cp acadevia-redis:/data/dump.rdb ./redis_backup_$(date +%Y%m%d).rdb
```

### Manual MinIO Backup

```bash
# Mirror a bucket to local directory
mc alias set acadevia http://localhost:9000 $MINIO_ACCESS_KEY $MINIO_SECRET_KEY
mc mirror acadevia/content ./minio-backup/content/
mc mirror acadevia/avatars ./minio-backup/avatars/
mc mirror acadevia/exports ./minio-backup/exports/
```

### Full Manual Backup (All Systems)

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./full-backup-${TIMESTAMP}"
mkdir -p "$BACKUP_DIR"

echo "=== Full Acadevia Backup: $TIMESTAMP ==="

# 1. MySQL
echo "Backing up MySQL..."
docker exec acadevia-mysql mysqldump -u root -p"root" \
  --all-databases --single-transaction \
  | gzip > "$BACKUP_DIR/mysql_all_${TIMESTAMP}.sql.gz"

# 2. Redis
echo "Backing up Redis..."
docker exec acadevia-redis redis-cli BGSAVE
sleep 5
docker cp acadevia-redis:/data/dump.rdb "$BACKUP_DIR/redis_${TIMESTAMP}.rdb"

# 3. MinIO
echo "Backing up MinIO objects..."
mc mirror acadevia/content "$BACKUP_DIR/minio/content/"
mc mirror acadevia/avatars "$BACKUP_DIR/minio/avatars/"

# 4. Kubernetes config
echo "Backing up K8s config..."
kubectl get configmap -n acadevia -o yaml > "$BACKUP_DIR/k8s_configmaps.yaml"
kubectl get secret -n acadevia -o yaml > "$BACKUP_DIR/k8s_secrets.yaml"

echo "=== Backup complete: $BACKUP_DIR ==="
ls -lh "$BACKUP_DIR/"
```

---

## Restore Procedures

### Restore MySQL — All Databases

```bash
# Docker (development)
make db-restore FILE=backups/acadevia_backup_20260215_020000.sql

# Manual
gunzip -c backup_file.sql.gz | docker exec -i acadevia-mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD"
```

### Restore MySQL — Single Database

```bash
# Step 1: Extract single database from full backup (if needed)
gunzip -c full_backup.sql.gz | sed -n '/^-- Current Database: `acadevia_courses`/,/^-- Current Database: /p' > courses_only.sql

# Step 2: Drop and recreate the database
docker exec acadevia-mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "DROP DATABASE IF EXISTS acadevia_courses; CREATE DATABASE acadevia_courses;"

# Step 3: Import
docker exec -i acadevia-mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" acadevia_courses < courses_only.sql
```

### Restore MySQL — From MinIO/S3

```bash
# Download backup from MinIO
mc cp backup/acadevia-backups/db-backups/20260215_020000/acadevia_courses_20260215_020000.sql.gz ./

# Decompress and restore
gunzip acadevia_courses_20260215_020000.sql.gz
docker exec -i acadevia-mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" acadevia_courses < acadevia_courses_20260215_020000.sql
```

### Restore MySQL — Kubernetes

```bash
# Create a restore job
cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: db-restore-$(date +%s)
  namespace: acadevia
spec:
  template:
    spec:
      containers:
        - name: restore
          image: mysql:8.0
          command: ["bash", "-c"]
          args:
            - |
              mc alias set backup "$S3_ENDPOINT" "$S3_ACCESS_KEY" "$S3_SECRET_KEY"
              mc cp backup/acadevia-backups/db-backups/<timestamp>/<database>.sql.gz /tmp/
              gunzip /tmp/<database>.sql.gz
              mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p"$MYSQL_PASSWORD" < /tmp/<database>.sql
          envFrom:
            - secretRef:
                name: db-backup-secrets
      restartPolicy: Never
  backoffLimit: 1
EOF
```

### Restore Verification

After any restore, verify data integrity:

```bash
# Check table counts
docker exec acadevia-mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "
SELECT table_schema, table_name, table_rows 
FROM information_schema.tables 
WHERE table_schema LIKE 'acadevia_%'
ORDER BY table_schema, table_name;"

# Run service health checks
make health

# Test a sample query
docker exec acadevia-mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" acadevia_users -e "SELECT COUNT(*) FROM users;"
```

---

## Point-in-Time Recovery (MySQL)

### Prerequisites

Point-in-time recovery requires MySQL binary logging to be enabled.

```ini
# my.cnf
[mysqld]
log-bin=mysql-bin
binlog-format=ROW
server-id=1
expire_logs_days=7
```

### Recovery Steps

```bash
# Step 1: Identify the target timestamp
# Example: Restore to state at 2026-02-15 10:30:00 UTC

# Step 2: Restore the last full backup BEFORE the target time
gunzip -c acadevia_backup_20260215_020000.sql.gz | mysql -u root -p acadevia_courses

# Step 3: Apply binary logs up to the target time
mysqlbinlog --stop-datetime="2026-02-15 10:30:00" /var/lib/mysql/mysql-bin.000123 | mysql -u root -p

# Step 4: Verify data
mysql -u root -p acadevia_courses -e "SELECT * FROM courses ORDER BY updated_at DESC LIMIT 5;"
```

### Continuous Binlog Backup (Recommended for Production)

```bash
# Ship binlogs to S3 every 5 minutes
*/5 * * * * mysqlbinlog --read-from-remote-server --host=mysql --raw --result-file=/backups/binlog/ mysql-bin && mc mirror /backups/binlog/ backup/acadevia-backups/binlogs/
```

---

## Kafka Data Recovery

### Understanding Kafka Data Persistence

Kafka retains messages based on topic configuration:
- **Default retention:** 7 days (`retention.ms=604800000`)
- Messages within retention window are always available
- Messages beyond retention are permanently deleted

### Replay Events from Kafka

If a consumer missed events (e.g., service was down):

```bash
# Reset consumer group offset to a specific time
kubectl exec -it kafka-0 -n acadevia -- \
  kafka-consumer-groups --bootstrap-server localhost:9092 \
  --group notification-service-group \
  --topic notification.send \
  --reset-offsets --to-datetime 2026-02-14T00:00:00.000 --execute

# Reset to beginning (reprocess all retained messages)
kubectl exec -it kafka-0 -n acadevia -- \
  kafka-consumer-groups --bootstrap-server localhost:9092 \
  --group analytics-service-group \
  --all-topics \
  --reset-offsets --to-earliest --execute
```

### Kafka Topic Recovery After Deletion

If a topic was accidentally deleted and auto-create is disabled:

```bash
# Recreate the topic with original configuration
kubectl exec -it kafka-0 -n acadevia -- \
  kafka-topics --bootstrap-server localhost:9092 \
  --create --topic user.registered \
  --partitions 3 --replication-factor 1 \
  --config retention.ms=604800000

# Note: Historical messages are lost — consumers will need to resync from database
```

### Kafka Broker Data Recovery

If a Kafka broker loses its data volume:

```bash
# 1. Delete the broken pod (K8s will recreate with a fresh PVC)
kubectl delete pod kafka-0 -n acadevia

# 2. Wait for the new pod to join the cluster
kubectl logs kafka-0 -n acadevia -f

# 3. Reassign partitions if needed
kubectl exec -it kafka-0 -n acadevia -- \
  kafka-reassign-partitions --bootstrap-server localhost:9092 \
  --reassignment-json-file /tmp/reassignment.json --execute
```

---

## Redis Data Recovery

### Restore from RDB Snapshot

```bash
# Step 1: Stop Redis
docker stop acadevia-redis

# Step 2: Copy backup RDB file
docker cp redis_backup_20260215.rdb acadevia-redis:/data/dump.rdb

# Step 3: Start Redis (it will load the RDB on startup)
docker start acadevia-redis

# Step 4: Verify
docker exec acadevia-redis redis-cli DBSIZE
docker exec acadevia-redis redis-cli INFO keyspace
```

### Redis Data Recovery Strategy

Redis is primarily used as a cache, so full recovery is often not necessary:

| Data Type | Recovery Strategy |
|-----------|------------------|
| Sessions (`auth:session:*`) | Users will need to re-login (acceptable) |
| Cache (`cache:*`) | Will be populated on-demand from MySQL |
| Rate limits (`rate:*`) | Will reset (minor impact) |
| Leaderboards (`leaderboard:*`) | Rebuild from database: trigger leaderboard recalculation |

### Rebuild Cache from Database

After a Redis data loss, caches warm up automatically as requests come in. To pre-warm:

```bash
# Trigger cache warmup job
kubectl create job --from=cronjob/cache-warmup manual-warmup-$(date +%s) -n acadevia
```

---

## MinIO / Object Storage Recovery

### Restore from Mirror/Backup

```bash
# Mirror backup back to MinIO
mc alias set acadevia http://minio:9000 $MINIO_ACCESS_KEY $MINIO_SECRET_KEY
mc alias set backup https://s3-backup.example.com $S3_ACCESS_KEY $S3_SECRET_KEY

# Restore specific bucket
mc mirror backup/content-backup acadevia/content
mc mirror backup/avatars-backup acadevia/avatars
mc mirror backup/exports-backup acadevia/exports
```

### Restore Single Object

```bash
# Copy a single file from backup
mc cp backup/content-backup/courses/lesson-123/video.mp4 acadevia/content/courses/lesson-123/video.mp4
```

### MinIO Complete Rebuild

If the MinIO volume is lost:

```bash
# 1. Recreate the MinIO container/pod
kubectl delete pod minio-0 -n acadevia
# K8s will recreate with a new PVC

# 2. Wait for MinIO to be healthy
kubectl wait --for=condition=ready pod -l app=minio -n acadevia --timeout=120s

# 3. Recreate buckets
mc mb acadevia/content
mc mb acadevia/avatars
mc mb acadevia/exports

# 4. Restore data from backup
mc mirror backup/content-backup acadevia/content
mc mirror backup/avatars-backup acadevia/avatars
mc mirror backup/exports-backup acadevia/exports

# 5. Verify
mc ls acadevia/content --recursive --summarize
```

---

## Full Disaster Recovery Plan

### Scenario: Complete Cluster/Region Failure

**Prerequisites:**
- Secondary Kubernetes cluster available (different region)
- Database backups in off-site S3
- MinIO data replicated to secondary storage
- Kubernetes manifests in Git

### Recovery Procedure

#### Phase 1: Infrastructure (~30 minutes)

```bash
# 1. Point kubectl to secondary cluster
kubectl config use-context disaster-recovery

# 2. Create namespace
kubectl apply -f kubernetes/namespace.yml

# 3. Apply secrets and configs
kubectl apply -f kubernetes/config/ -n acadevia

# 4. Deploy infrastructure
kubectl apply -f kubernetes/infrastructure/ -n acadevia

# 5. Wait for infrastructure
kubectl wait --for=condition=ready pod -l tier=infrastructure -n acadevia --timeout=300s
```

#### Phase 2: Data Restoration (~1-2 hours)

```bash
# 1. Restore MySQL from latest backup
kubectl create job db-restore-emergency -n acadevia \
  --image=mysql:8.0 \
  -- bash -c "
    mc alias set backup $S3_ENDPOINT $S3_KEY $S3_SECRET
    LATEST=\$(mc ls backup/acadevia-backups/db-backups/ | tail -1 | awk '{print \$NF}')
    for f in \$(mc ls backup/acadevia-backups/db-backups/\$LATEST | awk '{print \$NF}'); do
      mc cp backup/acadevia-backups/db-backups/\$LATEST/\$f /tmp/
      DB=\$(basename \$f | cut -d_ -f1-2)
      gunzip /tmp/\$f
      mysql -h mysql -u root -p\$MYSQL_ROOT_PASSWORD \$DB < /tmp/\${f%.gz}
    done
  "

# 2. Restore MinIO data
kubectl create job minio-restore-emergency -n acadevia \
  --image=minio/mc:latest \
  -- bash -c "
    mc alias set backup $S3_SECONDARY_ENDPOINT $S3_KEY $S3_SECRET
    mc alias set primary http://minio:9000 $MINIO_KEY $MINIO_SECRET
    mc mirror backup/content-backup primary/content
    mc mirror backup/avatars-backup primary/avatars
    mc mirror backup/exports-backup primary/exports
  "

# 3. Redis — no restore needed (cache will warm up)
```

#### Phase 3: Application Deployment (~30 minutes)

```bash
# Deploy all services
kubectl apply -f kubernetes/services/ -n acadevia

# Deploy networking (update DNS after)
kubectl apply -f kubernetes/networking/ -n acadevia

# Deploy monitoring
kubectl apply -f kubernetes/monitoring/ -n acadevia
```

#### Phase 4: DNS Failover (~5-30 minutes, depends on TTL)

```bash
# Update DNS records to point to new cluster's Ingress IP
NEW_IP=$(kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Update A records:
# acadevia.in       → $NEW_IP
# api.acadevia.in   → $NEW_IP
# cdn.acadevia.in   → $NEW_IP
# grafana.acadevia.in → $NEW_IP
```

#### Phase 5: Validation

```bash
# Run full health check
make health

# Verify all services
make k8s-status

# Test critical paths
curl -s https://api.acadevia.in/actuator/health | jq .
curl -s https://acadevia.in -o /dev/null -w "%{http_code}"
```

---

## DR Testing Schedule

### Monthly Tests

| Test | Procedure | Duration | Success Criteria |
|------|-----------|----------|-----------------|
| Backup verification | Restore latest backup to staging | 1 hour | All databases restored, data integrity verified |
| Single service recovery | Kill a pod, verify auto-recovery | 10 min | Pod restarts within 2 minutes, no data loss |
| Redis failover | Delete Redis pod, verify cache rebuild | 15 min | Platform continues working, caches warm up |

### Quarterly Tests

| Test | Procedure | Duration | Success Criteria |
|------|-----------|----------|-----------------|
| Full database restore | Restore all 11 databases from backup | 2 hours | All databases restored, all services healthy |
| MinIO data restore | Restore from off-site backup | 2 hours | All objects present, checksums verified |
| Kafka consumer replay | Reset consumer offsets, reprocess events | 1 hour | Events reprocessed without duplicates or errors |

### Annual Tests

| Test | Procedure | Duration | Success Criteria |
|------|-----------|----------|-----------------|
| Full disaster recovery | Simulate complete cluster failure, recover to secondary | 8 hours | Full platform operational within RTO targets |
| Multi-service failure | Simultaneously fail 3+ services | 1 hour | Platform self-heals, no data loss |

### DR Test Reporting Template

```markdown
## DR Test Report

**Date:** YYYY-MM-DD
**Test Type:** [Monthly/Quarterly/Annual]
**Test Name:** [Description]
**Conducted By:** [Name]

### Results
- **Status:** PASS / FAIL
- **RTO Achieved:** X minutes (Target: Y minutes)
- **RPO Achieved:** X hours (Target: Y hours)
- **Data Integrity:** Verified / Issues Found

### Issues Encountered
1. [Issue] — [Resolution]

### Action Items
- [ ] [Improvement] — Owner — Due Date

### Sign-off
- Engineering: ___________
- DevOps: ___________
```

---

## Appendix: Backup Inventory

### Backup File Naming Convention

```
<database>_<YYYYMMDD>_<HHMMSS>.sql.gz
```

Example: `acadevia_courses_20260215_020000.sql.gz`

### Backup Storage Locations

```
MinIO/S3:
  acadevia-backups/
  ├── db-backups/
  │   ├── 20260215_020000/
  │   │   ├── acadevia_auth_20260215_020000.sql.gz
  │   │   ├── acadevia_users_20260215_020000.sql.gz
  │   │   ├── acadevia_courses_20260215_020000.sql.gz
  │   │   └── ... (11 database files)
  │   ├── 20260214_020000/
  │   └── ...
  ├── redis-snapshots/
  │   ├── redis_20260215_080000.rdb
  │   └── ...
  └── binlogs/ (if enabled)
      ├── mysql-bin.000123
      └── ...
```

### Retention Summary

| Backup Type | Daily | Weekly | Monthly | Max Age |
|-------------|-------|--------|---------|---------|
| MySQL full dump | ✅ | ✅ (Sun) | ✅ (1st) | 30 / 12 / 6 |
| Redis RDB snapshot | ✅ (4x) | — | — | 7 days |
| MinIO mirror | ✅ | — | — | 90 days |
| Prometheus metrics | — | — | — | 15 days (online) |
| Grafana dashboards | — | ✅ | — | Indefinite (Git) |
| K8s manifests | — | — | — | Indefinite (Git) |

### Contact Information for DR

| Role | Contact | Responsibility |
|------|---------|---------------|
| Primary On-Call | (See PagerDuty schedule) | Initial response, triage |
| DevOps Lead | — | Infrastructure decisions |
| DBA | — | Database recovery decisions |
| Engineering Manager | — | Escalation, communication |
| CTO | — | Final escalation |
