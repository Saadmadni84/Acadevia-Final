# Acadevia Platform — Operations Runbook

> **Version:** 1.0 | **Last Updated:** February 2026  
> **Audience:** DevOps Engineers, SREs, On-Call Engineers  
> **Severity Definitions:** See [Incident Response](#incident-response-procedure)

---

## Table of Contents

- [Deployment Procedures](#deployment-procedures)
- [Rollback Procedures](#rollback-procedures)
- [Scaling Procedures](#scaling-procedures)
- [Common Issues & Fixes](#common-issues--fixes)
- [Incident Response Procedure](#incident-response-procedure)
- [Database Maintenance](#database-maintenance)
- [Kafka Topic Management](#kafka-topic-management)
- [Redis Cache Management](#redis-cache-management)
- [SSL Certificate Management](#ssl-certificate-management)
- [Log Investigation](#log-investigation)
- [Emergency Procedures](#emergency-procedures)

---

## Deployment Procedures

### Deploy to Staging

```bash
# 1. Build all services with staging tag
make build IMAGE_TAG=staging

# 2. Push images to registry
make push IMAGE_TAG=staging

# 3. Switch to staging context
kubectl config use-context staging

# 4. Deploy
IMAGE_TAG=staging make k8s-deploy-all

# 5. Validate
make k8s-status
make health
```

**One-command shortcut:**

```bash
make deploy-staging
```

### Deploy to Production

> **Pre-flight checklist:**
> - [ ] All tests pass on staging
> - [ ] QA sign-off received
> - [ ] Database migrations tested on staging
> - [ ] Rollback plan documented
> - [ ] On-call engineer notified

```bash
# 1. Build with production tag
make build IMAGE_TAG=production

# 2. Push to registry
make push IMAGE_TAG=production

# 3. Switch to production context
kubectl config use-context production

# 4. Deploy (requires confirmation)
make deploy-production
# → Prompted: "Type 'yes' to confirm"

# 5. Monitor rollout
kubectl get pods -n acadevia -w

# 6. Validate each service
kubectl rollout status deployment/api-gateway -n acadevia
kubectl rollout status deployment/auth-service -n acadevia
kubectl rollout status deployment/user-service -n acadevia
# ... (repeat for each service)

# 7. Run health checks
make health
```

### Deploy a Single Service

```bash
# Build and push
make build-service SERVICE=auth-service IMAGE_TAG=v1.2.3
make push-service SERVICE=auth-service IMAGE_TAG=v1.2.3

# Deploy to K8s
make k8s-deploy SERVICE=auth-service

# Or update image directly
kubectl set image deployment/auth-service \
  auth-service=acadevia/auth-service:v1.2.3 \
  -n acadevia

# Monitor
kubectl rollout status deployment/auth-service -n acadevia
```

### Deploy with Zero Downtime

Services are configured with rolling update strategy:

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 0
    maxSurge: 1
```

Kubernetes will:
1. Start a new pod with the updated image
2. Wait for health check to pass
3. Route traffic to the new pod
4. Terminate the old pod

---

## Rollback Procedures

### Rollback a Single Service

```bash
# Immediate rollback to previous version
make k8s-rollback SERVICE=auth-service

# Verify
kubectl rollout status deployment/auth-service -n acadevia
kubectl get pods -l app=auth-service -n acadevia
```

### Rollback to a Specific Version

```bash
# View deployment history
kubectl rollout history deployment/auth-service -n acadevia

# Example output:
# REVISION  CHANGE-CAUSE
# 1         Initial deployment
# 2         kubectl set image deployment/auth-service auth-service=acadevia/auth-service:v1.1.0
# 3         kubectl set image deployment/auth-service auth-service=acadevia/auth-service:v1.2.0

# Rollback to revision 2
kubectl rollout undo deployment/auth-service --to-revision=2 -n acadevia
```

### Rollback All Services

```bash
SERVICES="api-gateway auth-service user-service course-service content-service \
  quiz-service game-service sync-service gamification-service leaderboard-service \
  notification-service analytics-service admin-service i18n-service frontend"

for svc in $SERVICES; do
  echo "Rolling back $svc..."
  kubectl rollout undo deployment/$svc -n acadevia
done

# Verify all services
make k8s-status
```

### Rollback Infrastructure Changes

```bash
# Revert ConfigMap/Secret changes
kubectl rollout undo deployment/<service> -n acadevia

# If database schema was changed, restore from backup
make db-restore FILE=backups/acadevia_backup_<pre-deploy-timestamp>.sql
```

### Emergency Image Rollback

If the registry is unavailable, use a known-good image:

```bash
kubectl set image deployment/auth-service \
  auth-service=acadevia/auth-service:last-known-good \
  -n acadevia
```

---

## Scaling Procedures

### Manual Scaling

```bash
# Scale a specific service
make k8s-scale SERVICE=auth-service REPLICAS=4

# Or directly with kubectl
kubectl scale deployment/auth-service --replicas=4 -n acadevia

# Verify
kubectl get deployment auth-service -n acadevia
```

### Current Production Replica Defaults

| Service | Default Replicas | Min (HPA) | Max (HPA) |
|---------|-----------------|-----------|-----------|
| API Gateway | 2 | 2 | 6 |
| Auth Service | 2 | 2 | 5 |
| User Service | 2 | 2 | 5 |
| Course Service | 2 | 2 | 5 |
| Content Service | 2 | 2 | 4 |
| Quiz Service | 2 | 2 | 5 |
| Game Service | 2 | 2 | 5 |
| Sync Service | 2 | 2 | 4 |
| Gamification Service | 2 | 2 | 4 |
| Leaderboard Service | 2 | 2 | 4 |
| Notification Service | 2 | 2 | 4 |
| Analytics Service | 2 | 2 | 4 |
| Admin Service | 1 | 1 | 2 |
| i18n Service | 1 | 1 | 2 |
| Frontend | 2 | 2 | 4 |

### HPA Configuration

HPA triggers are based on CPU and memory utilization:

```bash
# View HPA status
kubectl get hpa -n acadevia

# Describe specific HPA
kubectl describe hpa auth-service -n acadevia

# Edit HPA thresholds
kubectl edit hpa auth-service -n acadevia
```

Typical HPA configuration:

```yaml
spec:
  minReplicas: 2
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### Scaling Infrastructure

#### Scale MySQL (Read Replicas)

```bash
# This requires setting up MySQL replication — not handled by simple scaling
# Contact DBA for MySQL scaling decisions
```

#### Scale Kafka

```bash
# Add partitions to a topic
kubectl exec -it kafka-0 -n acadevia -- \
  kafka-topics --bootstrap-server localhost:9092 \
  --alter --topic user.registered --partitions 6
```

#### Scale Redis

```bash
# Increase Redis memory limit
kubectl edit deployment redis -n acadevia
# Change resources.limits.memory
```

---

## Common Issues & Fixes

### Service Won't Start

**Symptoms:** Pod in `CrashLoopBackOff` or `Error` state

**Diagnosis:**

```bash
# Check pod events
kubectl describe pod <pod-name> -n acadevia

# Check application logs
kubectl logs <pod-name> -n acadevia --tail=100

# Check previous container logs (if crashed)
kubectl logs <pod-name> -n acadevia --previous
```

**Common causes and fixes:**

| Cause | Log Pattern | Fix |
|-------|------------|-----|
| DB connection failed | `Connection refused` to port 3306 | Check MySQL pod status, verify DB credentials in Secret |
| Kafka not ready | `Connection to node -1 could not be established` | Wait for Kafka to be healthy, check Zookeeper |
| Config error | `Failed to bind properties` | Check ConfigMap values, environment variables |
| Port conflict | `Address already in use` | Another pod is using the same port; check for duplicate deployments |
| OOMKilled | Pod restarts with exit code 137 | Increase memory limits in deployment spec |
| Missing secret | `Could not resolve placeholder` | Verify Secret exists: `kubectl get secret -n acadevia` |

```bash
# Quick fix: Restart the pod
kubectl delete pod <pod-name> -n acadevia

# If deployment is broken, rollback
make k8s-rollback SERVICE=<service-name>
```

---

### High Memory Usage

**Symptoms:** Pods approaching memory limits, OOMKilled events

**Diagnosis:**

```bash
# Check memory usage across all pods
kubectl top pods -n acadevia --sort-by=memory

# Check JVM heap usage for a specific service
kubectl exec -it <pod-name> -n acadevia -- \
  jcmd 1 GC.heap_info

# Check for memory leaks
kubectl exec -it <pod-name> -n acadevia -- \
  jcmd 1 VM.native_memory summary
```

**Fixes:**

```bash
# 1. Increase memory limits
kubectl edit deployment <service> -n acadevia
# Change: resources.limits.memory: 768Mi → 1Gi

# 2. Tune JVM heap
# Add to environment:
#   JAVA_OPTS: "-Xms256m -Xmx512m -XX:+UseG1GC"

# 3. Force garbage collection (temporary)
kubectl exec -it <pod-name> -n acadevia -- \
  jcmd 1 GC.run

# 4. Generate heap dump for analysis
kubectl exec -it <pod-name> -n acadevia -- \
  jcmd 1 GC.heap_dump /tmp/heapdump.hprof
kubectl cp acadevia/<pod-name>:/tmp/heapdump.hprof ./heapdump.hprof
```

**Resource limits reference (production):**

| Service | CPU Limit | Memory Limit | CPU Request | Memory Request |
|---------|-----------|-------------|-------------|----------------|
| API Gateway | 1.0 | 768MB | 0.5 | 512MB |
| Auth/User/Course/Quiz/Game | 0.75 | 640MB | 0.25 | 384MB |
| Content Service | 1.0 | 1GB | 0.5 | 768MB |
| Sync/Gamification/Leaderboard | 0.75 | 640MB | 0.25 | 384MB |
| Notification/Analytics | 0.75 | 640MB | 0.25 | 384MB |
| Admin | 0.75 | 640MB | 0.25 | 384MB |
| i18n | 0.5 | 512MB | 0.25 | 256MB |
| Frontend | 0.5 | 256MB | 0.25 | 128MB |

---

### Kafka Consumer Lag

**Symptoms:** Events processed slowly, data appearing stale, growing lag in consumer groups

**Diagnosis:**

```bash
# Check consumer group lag
kubectl exec -it kafka-0 -n acadevia -- \
  kafka-consumer-groups --bootstrap-server localhost:9092 \
  --describe --group <consumer-group>

# Check all consumer groups
kubectl exec -it kafka-0 -n acadevia -- \
  kafka-consumer-groups --bootstrap-server localhost:9092 --list
```

**Fixes:**

```bash
# 1. Scale consumers (more replicas = more parallel consumers)
make k8s-scale SERVICE=notification-service REPLICAS=4

# 2. Check processing time in logs
kubectl logs -l app=notification-service -n acadevia --tail=100 | grep "processing time"

# 3. Add partitions to the topic (allows more parallel consumers)
kubectl exec -it kafka-0 -n acadevia -- \
  kafka-topics --bootstrap-server localhost:9092 \
  --alter --topic notification.send --partitions 6

# 4. Reset consumer offset (CAUTION: may reprocess messages)
kubectl exec -it kafka-0 -n acadevia -- \
  kafka-consumer-groups --bootstrap-server localhost:9092 \
  --group <group> --topic <topic> --reset-offsets --to-latest --execute
```

---

### MySQL Connection Pool Exhausted

**Symptoms:** `HikariPool - Connection is not available` errors, timeouts

**Diagnosis:**

```bash
# Check MySQL connection count
kubectl exec -it mysql-0 -n acadevia -- \
  mysql -u root -p -e "SHOW STATUS LIKE 'Threads_connected';"

# Check max connections setting
kubectl exec -it mysql-0 -n acadevia -- \
  mysql -u root -p -e "SHOW VARIABLES LIKE 'max_connections';"

# Show active connections per service
kubectl exec -it mysql-0 -n acadevia -- \
  mysql -u root -p -e "SELECT user, count(*) FROM information_schema.processlist GROUP BY user;"

# Show running queries
kubectl exec -it mysql-0 -n acadevia -- \
  mysql -u root -p -e "SHOW FULL PROCESSLIST;"
```

**Fixes:**

```bash
# 1. Kill idle connections
kubectl exec -it mysql-0 -n acadevia -- \
  mysql -u root -p -e "SELECT CONCAT('KILL ',id,';') FROM information_schema.processlist WHERE command='Sleep' AND time > 300;" | tail -n +2 | kubectl exec -i mysql-0 -n acadevia -- mysql -u root -p

# 2. Increase max_connections
kubectl exec -it mysql-0 -n acadevia -- \
  mysql -u root -p -e "SET GLOBAL max_connections = 500;"

# 3. Tune application HikariCP pool (in ConfigMap)
# spring.datasource.hikari.maximum-pool-size=20
# spring.datasource.hikari.minimum-idle=5
# spring.datasource.hikari.idle-timeout=300000
# spring.datasource.hikari.connection-timeout=20000
```

---

### Redis Out of Memory (OOM)

**Symptoms:** `OOM command not allowed` errors, Redis refusing writes

**Diagnosis:**

```bash
# Check memory usage
kubectl exec -it redis-0 -n acadevia -- redis-cli INFO memory

# Output to look for:
# used_memory_human: 900M
# maxmemory_human: 1.00G
# maxmemory_policy: noeviction

# Check key count and memory per key pattern
kubectl exec -it redis-0 -n acadevia -- redis-cli --scan --pattern '*' | head -20
kubectl exec -it redis-0 -n acadevia -- redis-cli DBSIZE
```

**Fixes:**

```bash
# 1. Check eviction policy (should be allkeys-lru for cache)
kubectl exec -it redis-0 -n acadevia -- redis-cli CONFIG GET maxmemory-policy

# Set to LRU eviction
kubectl exec -it redis-0 -n acadevia -- redis-cli CONFIG SET maxmemory-policy allkeys-lru

# 2. Increase maxmemory
kubectl exec -it redis-0 -n acadevia -- redis-cli CONFIG SET maxmemory 2gb

# 3. Flush non-critical caches
kubectl exec -it redis-0 -n acadevia -- redis-cli KEYS "cache:*" | xargs redis-cli DEL

# 4. Check for large keys
kubectl exec -it redis-0 -n acadevia -- redis-cli --bigkeys

# 5. Increase Redis pod memory limit
kubectl edit deployment redis -n acadevia
# Change resources.limits.memory
```

---

### 502 Bad Gateway Errors

**Symptoms:** Users see 502 errors, Nginx returns bad gateway

**Diagnosis:**

```bash
# Check if upstream service is healthy
kubectl get pods -n acadevia -l app=api-gateway
kubectl logs -l app=api-gateway -n acadevia --tail=50

# Check Ingress Controller logs
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx --tail=50

# Check endpoint routing
kubectl get endpoints api-gateway -n acadevia
```

**Fixes:**

```bash
# 1. Restart the failing upstream service
kubectl rollout restart deployment/api-gateway -n acadevia

# 2. Check if the service has enough replicas
kubectl get deployment api-gateway -n acadevia

# 3. Scale up if under pressure
make k8s-scale SERVICE=api-gateway REPLICAS=3

# 4. Check health endpoint directly
kubectl exec -it <pod> -n acadevia -- wget -qO- http://localhost:8080/actuator/health

# 5. Check readiness probe configuration
kubectl describe deployment api-gateway -n acadevia | grep -A5 "Readiness"
```

---

### SSL Certificate Expired

**Symptoms:** Browser shows certificate warning, HTTPS connections fail

**Diagnosis:**

```bash
# Check certificate status
kubectl get certificates -n acadevia
kubectl describe certificate acadevia-tls -n acadevia

# Check cert-manager logs
kubectl logs -l app.kubernetes.io/name=cert-manager -n cert-manager --tail=50

# Check certificate expiry from outside
echo | openssl s_client -connect acadevia.in:443 2>/dev/null | openssl x509 -noout -dates
```

**Fixes:**

```bash
# 1. Trigger cert renewal (delete the secret, cert-manager re-issues)
kubectl delete secret acadevia-tls -n acadevia
# cert-manager will automatically request a new certificate

# 2. If cert-manager is broken, manual renewal
kubectl delete certificate acadevia-tls -n acadevia
kubectl apply -f kubernetes/networking/cert-manager.yml
kubectl apply -f kubernetes/networking/ingress.yml

# 3. Verify cert-manager is running
kubectl get pods -n cert-manager
kubectl rollout restart deployment cert-manager -n cert-manager

# 4. Check ClusterIssuer
kubectl describe clusterissuer letsencrypt-prod
```

---

## Incident Response Procedure

### Severity Levels

| Level | Definition | Response Time | Examples |
|-------|-----------|--------------|---------|
| **SEV-1** (Critical) | Platform completely down, all users affected | 15 min | Full outage, data loss, security breach |
| **SEV-2** (High) | Major feature broken, many users affected | 30 min | Auth service down, payments failing |
| **SEV-3** (Medium) | Feature degraded, some users affected | 2 hours | Slow responses, partial feature failure |
| **SEV-4** (Low) | Minor issue, workaround available | 24 hours | UI glitch, non-critical error in logs |

### Escalation Path

```
1. On-call Engineer → Acknowledge + Investigate (15 min)
2. Team Lead → Escalate if not resolved in 30 min
3. Engineering Manager → Escalate if SEV-1 not resolved in 1 hour
4. CTO → Notified for all SEV-1 incidents
```

### Incident Response Steps

1. **Acknowledge** — Confirm the incident in the alerting system
2. **Assess** — Determine severity level and blast radius
3. **Communicate** — Post in #incidents Slack channel
4. **Investigate** — Use runbook, check dashboards, review logs
5. **Mitigate** — Apply fix, rollback, or scale
6. **Resolve** — Confirm fix with monitoring
7. **Postmortem** — Write incident report within 48 hours

### Communication Template

**Slack #incidents Channel:**

```
🚨 INCIDENT — SEV-[1/2/3/4]
📝 Title: [Brief description]
🕐 Started: [Time UTC]
👤 Owner: [Name]
📊 Impact: [Who/what is affected]
🔧 Status: [Investigating / Mitigating / Resolved]
📎 Dashboard: [Grafana link]

Updates:
- HH:MM — [Update text]
```

### Postmortem Template

```markdown
## Incident Postmortem: [Title]

**Date:** YYYY-MM-DD
**Duration:** X hours Y minutes
**Severity:** SEV-X
**Owner:** [Name]

### Summary
[1-2 sentence summary]

### Timeline (UTC)
- HH:MM — Alert triggered
- HH:MM — Engineer acknowledged
- HH:MM — Root cause identified
- HH:MM — Fix deployed
- HH:MM — All clear

### Root Cause
[Detailed explanation]

### Impact
- Users affected: X
- Duration: X minutes
- Data loss: Yes/No

### Action Items
- [ ] [Action] — Owner — Due date
- [ ] [Action] — Owner — Due date

### Lessons Learned
- What went well
- What could be improved
```

---

## Database Maintenance

### Backup Verification

```bash
# List available backups
ls -la acadevia-infrastructure/backups/

# In Kubernetes (CronJob backups)
kubectl get cronjobs -n acadevia
kubectl get jobs -n acadevia | grep backup

# Check last backup job status
kubectl describe job <backup-job-name> -n acadevia
```

### Manual Backup

```bash
# Docker (development)
make db-backup

# Kubernetes (production)
kubectl create job --from=cronjob/db-backup manual-backup-$(date +%s) -n acadevia
kubectl logs job/manual-backup-<timestamp> -n acadevia
```

### Index Optimization

```sql
-- Connect to MySQL
-- Check tables needing optimization
SELECT table_schema, table_name, data_free, data_length
FROM information_schema.tables
WHERE data_free > 1048576
ORDER BY data_free DESC;

-- Optimize specific table
OPTIMIZE TABLE acadevia_courses.courses;

-- Analyze tables for query optimizer
ANALYZE TABLE acadevia_users.users;
```

### Slow Query Investigation

```sql
-- Enable slow query log (if not already)
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- queries over 1 second

-- View slow queries
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 20;

-- Check running queries
SHOW FULL PROCESSLIST;

-- Kill a long-running query
KILL <process_id>;

-- Check table indexes
SHOW INDEX FROM acadevia_courses.courses;

-- Explain a slow query
EXPLAIN ANALYZE SELECT * FROM courses WHERE instructor_id = 123;
```

### Table Size Monitoring

```sql
SELECT 
  table_schema AS 'Database',
  table_name AS 'Table',
  ROUND(data_length / 1024 / 1024, 2) AS 'Data (MB)',
  ROUND(index_length / 1024 / 1024, 2) AS 'Index (MB)',
  ROUND((data_length + index_length) / 1024 / 1024, 2) AS 'Total (MB)',
  table_rows AS 'Rows'
FROM information_schema.tables
WHERE table_schema LIKE 'acadevia_%'
ORDER BY (data_length + index_length) DESC;
```

---

## Kafka Topic Management

### List All Topics

```bash
kubectl exec -it kafka-0 -n acadevia -- \
  kafka-topics --bootstrap-server localhost:9092 --list
```

### Create a Topic

```bash
kubectl exec -it kafka-0 -n acadevia -- \
  kafka-topics --bootstrap-server localhost:9092 \
  --create \
  --topic <topic-name> \
  --partitions 3 \
  --replication-factor 1 \
  --config retention.ms=604800000  # 7 days
```

### Delete a Topic

```bash
kubectl exec -it kafka-0 -n acadevia -- \
  kafka-topics --bootstrap-server localhost:9092 \
  --delete --topic <topic-name>
```

### Describe a Topic

```bash
kubectl exec -it kafka-0 -n acadevia -- \
  kafka-topics --bootstrap-server localhost:9092 \
  --describe --topic user.registered
```

### Change Retention

```bash
# Set retention to 14 days
kubectl exec -it kafka-0 -n acadevia -- \
  kafka-configs --bootstrap-server localhost:9092 \
  --alter --entity-type topics \
  --entity-name user.registered \
  --add-config retention.ms=1209600000
```

### Consumer Group Management

```bash
# List all consumer groups
kubectl exec -it kafka-0 -n acadevia -- \
  kafka-consumer-groups --bootstrap-server localhost:9092 --list

# Describe consumer group (shows lag)
kubectl exec -it kafka-0 -n acadevia -- \
  kafka-consumer-groups --bootstrap-server localhost:9092 \
  --describe --group notification-service-group

# Reset offset to latest (skip backlog)
kubectl exec -it kafka-0 -n acadevia -- \
  kafka-consumer-groups --bootstrap-server localhost:9092 \
  --group notification-service-group \
  --topic notification.send \
  --reset-offsets --to-latest --execute

# Reset offset to specific timestamp
kubectl exec -it kafka-0 -n acadevia -- \
  kafka-consumer-groups --bootstrap-server localhost:9092 \
  --group notification-service-group \
  --reset-offsets --to-datetime 2026-02-15T00:00:00.000 --execute --all-topics
```

### Partition Rebalancing

```bash
# Add partitions (cannot decrease)
kubectl exec -it kafka-0 -n acadevia -- \
  kafka-topics --bootstrap-server localhost:9092 \
  --alter --topic user.registered --partitions 6
```

---

## Redis Cache Management

### Check Memory Usage

```bash
kubectl exec -it redis-0 -n acadevia -- redis-cli INFO memory
```

Key metrics:
- `used_memory_human` — Current memory usage
- `maxmemory_human` — Configured maximum
- `mem_fragmentation_ratio` — Fragmentation (ideal: 1.0-1.5)

### View Key Patterns

```bash
# Count keys by pattern
kubectl exec -it redis-0 -n acadevia -- redis-cli KEYS "auth:session:*" | wc -l
kubectl exec -it redis-0 -n acadevia -- redis-cli KEYS "cache:course:*" | wc -l
kubectl exec -it redis-0 -n acadevia -- redis-cli KEYS "rate:*" | wc -l
kubectl exec -it redis-0 -n acadevia -- redis-cli KEYS "leaderboard:*" | wc -l

# Total key count
kubectl exec -it redis-0 -n acadevia -- redis-cli DBSIZE
```

### Flush Cache

```bash
# Flush specific key patterns (CAUTION)
kubectl exec -it redis-0 -n acadevia -- \
  redis-cli KEYS "cache:*" | xargs -I{} redis-cli DEL {}

# Flush a single key
kubectl exec -it redis-0 -n acadevia -- redis-cli DEL "cache:course:123"

# Flush entire database (DANGER — clears sessions too!)
kubectl exec -it redis-0 -n acadevia -- redis-cli FLUSHDB

# Flush all databases (EXTREME DANGER)
kubectl exec -it redis-0 -n acadevia -- redis-cli FLUSHALL
```

### Check for Large Keys

```bash
kubectl exec -it redis-0 -n acadevia -- redis-cli --bigkeys
```

### TTL Investigation

```bash
# Check TTL of a key
kubectl exec -it redis-0 -n acadevia -- redis-cli TTL "auth:session:abc123"

# Find keys without TTL (potential memory leak)
kubectl exec -it redis-0 -n acadevia -- redis-cli --scan --pattern '*' | while read key; do
  ttl=$(redis-cli TTL "$key")
  if [ "$ttl" = "-1" ]; then
    echo "No TTL: $key"
  fi
done
```

---

## SSL Certificate Management

### Check Certificate Status

```bash
# Kubernetes cert-manager
kubectl get certificates -n acadevia
kubectl describe certificate acadevia-tls -n acadevia

# From outside the cluster
echo | openssl s_client -connect acadevia.in:443 2>/dev/null | openssl x509 -noout -dates -subject
```

### cert-manager Automatic Renewal

cert-manager renews certificates automatically 30 days before expiry. If renewal fails:

```bash
# Check cert-manager logs
kubectl logs -l app=cert-manager -n cert-manager --tail=100

# Check certificate request status
kubectl get certificaterequests -n acadevia
kubectl describe certificaterequest <name> -n acadevia

# Check ACME challenges
kubectl get challenges -n acadevia
```

### Manual Certificate Renewal

```bash
# Delete the secret to trigger re-issuance
kubectl delete secret acadevia-tls -n acadevia

# Wait for cert-manager to re-issue
kubectl get certificates -n acadevia -w

# Verify new certificate
kubectl get secret acadevia-tls -n acadevia -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -noout -dates
```

---

## Log Investigation

### View Service Logs

```bash
# Kubernetes
kubectl logs -l app=auth-service -n acadevia --tail=100 -f

# Docker (development)
make dev-logs SERVICE=auth-service
```

### Search Logs with Loki (via Grafana)

1. Open Grafana: https://grafana.acadevia.in
2. Navigate to **Explore**
3. Select Loki data source
4. Use LogQL:

```logql
# Errors from auth-service
{app="auth-service"} |= "ERROR"

# 500 errors in the last hour
{app="api-gateway"} |= "500" | json | status_code >= 500

# Slow queries
{app="course-service"} |~ "took [0-9]{4,}ms"
```

### Export Logs

```bash
# Export last 1000 lines of a service
kubectl logs -l app=auth-service -n acadevia --tail=1000 > auth-service-logs.txt

# Export all pod logs
for svc in api-gateway auth-service user-service; do
  kubectl logs -l app=$svc -n acadevia --tail=500 > ${svc}-logs.txt
done
```

---

## Emergency Procedures

### Full Platform Restart

```bash
# Scale all deployments to 0
kubectl get deployments -n acadevia -o name | xargs -I{} kubectl scale {} --replicas=0 -n acadevia

# Wait 30 seconds
sleep 30

# Scale back up
kubectl get deployments -n acadevia -o name | xargs -I{} kubectl scale {} --replicas=2 -n acadevia

# Scale admin and i18n to 1
kubectl scale deployment/admin-service --replicas=1 -n acadevia
kubectl scale deployment/i18n-service --replicas=1 -n acadevia
```

### Drain a Node

```bash
# Cordon node (prevent new scheduling)
kubectl cordon <node-name>

# Drain pods (graceful eviction)
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# Uncordon when ready
kubectl uncordon <node-name>
```

### Emergency Maintenance Mode

```bash
# Route all traffic to a maintenance page
kubectl annotate ingress acadevia-ingress \
  nginx.ingress.kubernetes.io/server-snippet='return 503 "Maintenance in progress";' \
  -n acadevia --overwrite

# Remove maintenance mode
kubectl annotate ingress acadevia-ingress \
  nginx.ingress.kubernetes.io/server-snippet- \
  -n acadevia
```
