# Acadevia Platform — Monitoring & Alerting Guide

> **Version:** 1.0 | **Last Updated:** February 2026  
> **Stack:** Prometheus v2.48 · Grafana v10.2 · Loki v2.9 · Promtail v2.9 · Jaeger v1.52

---

## Table of Contents

- [Monitoring Stack Overview](#monitoring-stack-overview)
- [Accessing Monitoring Tools](#accessing-monitoring-tools)
- [Grafana Dashboards](#grafana-dashboards)
- [Alerting Rules & Response](#alerting-rules--response)
- [Creating Custom Dashboards](#creating-custom-dashboards)
- [Log Analysis with Loki](#log-analysis-with-loki)
- [Distributed Tracing with Jaeger](#distributed-tracing-with-jaeger)
- [Key Metrics to Watch](#key-metrics-to-watch)
- [Setting Up Integrations](#setting-up-integrations)
- [Monitoring Maintenance](#monitoring-maintenance)

---

## Monitoring Stack Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     MONITORING ARCHITECTURE                       │
│                                                                    │
│   ┌──────────────┐       ┌──────────────┐      ┌──────────────┐  │
│   │  Spring Boot │──────▶│  Prometheus  │─────▶│   Grafana    │  │
│   │  Actuator    │metrics│  (scrape     │query │  (dashboards │  │
│   │  /metrics    │       │   15s cycle) │      │   + alerts)  │  │
│   └──────────────┘       └──────────────┘      └──────┬───────┘  │
│                                                        │          │
│   ┌──────────────┐       ┌──────────────┐              │          │
│   │  Docker logs │──────▶│   Promtail   │─────▶┌───────▼───────┐ │
│   │  (stdout)    │ship   │  (log agent) │push  │     Loki      │ │
│   └──────────────┘       └──────────────┘      │  (log store)  │ │
│                                                 └───────────────┘ │
│   ┌──────────────┐       ┌──────────────┐                        │
│   │  OpenTelemetry│─────▶│    Jaeger    │                        │
│   │  SDK (traces)│send   │  (tracing)   │                        │
│   └──────────────┘       └──────────────┘                        │
└──────────────────────────────────────────────────────────────────┘
```

### Component Versions

| Component | Version | Image | Purpose |
|-----------|---------|-------|---------|
| Prometheus | v2.48.0 | `prom/prometheus:v2.48.0` | Metrics collection, alerting rules |
| Grafana | v10.2.0 | `grafana/grafana:10.2.0` | Visualization, dashboards, alerts |
| Loki | v2.9.0 | `grafana/loki:2.9.0` | Log aggregation and querying |
| Promtail | v2.9.0 | `grafana/promtail:2.9.0` | Log shipping from containers |
| Jaeger | v1.52 | `jaegertracing/all-in-one:1.52` | Distributed tracing |

---

## Accessing Monitoring Tools

### Development (Docker Compose)

| Tool | URL | Default Credentials |
|------|-----|-------------------|
| Grafana | http://localhost:3001 | admin / admin |
| Prometheus | http://localhost:9090 | — |
| Jaeger UI | http://localhost:16686 | — |
| Loki API | http://localhost:3100 | — |

Start the monitoring stack:

```bash
make monitoring-up
```

Stop:

```bash
make monitoring-down
```

### Production (Kubernetes)

| Tool | URL |
|------|-----|
| Grafana | https://grafana.acadevia.in |
| Prometheus | Internal only (port-forward: `kubectl port-forward svc/prometheus 9090 -n acadevia`) |
| Jaeger | Internal only (port-forward: `kubectl port-forward svc/jaeger 16686 -n acadevia`) |

---

## Grafana Dashboards

### Dashboard 1: Platform Overview

**Purpose:** Bird's-eye view of the entire Acadevia platform.

| Panel | Description | What to Look For |
|-------|-------------|-----------------|
| Service Health Matrix | Green/red grid of all services | Any red cells indicate a service is down |
| Total Active Users | Real-time active session count | Sudden drops indicate auth issues |
| Total HTTP Requests/sec | RPS across all services | Compare to baseline for anomalies |
| Error Rate | Percentage of 4xx/5xx responses | Should be < 1% |
| P95 Latency | 95th percentile response time | Should be < 500ms |

### Dashboard 2: API Gateway

**Purpose:** Monitor the entry point for all API traffic.

| Panel | Description | Alert Threshold |
|-------|-------------|----------------|
| Request Rate by Endpoint | RPS per API route | N/A |
| Response Time Distribution | Histogram of response times | P99 > 2s |
| Error Rate by Status Code | Breakdown of 4xx, 5xx, 2xx | 5xx > 1% |
| Active Connections | Current open connections | > 1000 |
| Rate Limit Hits | Blocked requests per second | Sudden spikes |
| Upstream Health | Health of backend services | Any failing |

### Dashboard 3: Database (MySQL)

**Purpose:** Monitor MySQL performance and resource usage.

| Panel | Description | Alert Threshold |
|-------|-------------|----------------|
| Queries per Second | SELECT, INSERT, UPDATE, DELETE | N/A |
| Active Connections | Current vs max_connections | > 80% of max |
| Slow Queries | Queries exceeding threshold | > 10/min |
| Buffer Pool Hit Rate | InnoDB cache effectiveness | < 95% |
| Replication Lag | Seconds behind master | > 5s |
| Disk Usage | Data + index size per DB | > 80% disk |
| Table Lock Waits | Contention on table locks | > 0 sustained |

### Dashboard 4: Kafka

**Purpose:** Monitor event streaming health.

| Panel | Description | Alert Threshold |
|-------|-------------|----------------|
| Messages In/Out per Second | Producer/consumer throughput | N/A |
| Consumer Group Lag | Messages behind per group | > 10,000 |
| Partition Distribution | Messages per partition | Severe imbalance |
| Broker Disk Usage | Log segment storage | > 80% |
| Under-Replicated Partitions | Partitions missing replicas | > 0 |
| Topic Message Count | Total messages per topic | N/A |

### Dashboard 5: Redis

**Purpose:** Monitor cache performance.

| Panel | Description | Alert Threshold |
|-------|-------------|----------------|
| Memory Usage | Used vs maxmemory | > 85% |
| Hit Rate | Cache hits / (hits + misses) | < 80% |
| Connected Clients | Active client connections | > 500 |
| Commands per Second | Total operations | N/A |
| Key Count | Total keys in DB | Unexpected growth |
| Eviction Rate | Keys evicted per second | > 100/s sustained |
| Latency | Command execution latency | P99 > 5ms |

### Dashboard 6: JVM Metrics

**Purpose:** Monitor Java service internals (per-service).

| Panel | Description | Alert Threshold |
|-------|-------------|----------------|
| Heap Memory Usage | Used/committed/max heap | Used > 85% max |
| GC Pause Time | Duration of GC events | > 500ms |
| GC Frequency | GC events per minute | > 20/min |
| Thread Count | Active threads | > 200 |
| Class Loading | Loaded/unloaded classes | Continuous growth |
| CPU Usage | Process CPU utilization | > 80% sustained |

### Dashboard 7: Business Metrics

**Purpose:** Track key business KPIs and platform usage.

| Panel | Description |
|-------|-------------|
| New Registrations | Daily/weekly user sign-ups |
| Course Enrollments | Enrollment rate over time |
| Quiz Completions | Quizzes submitted per hour |
| Active Courses | Courses with recent activity |
| Gamification Events | Points earned, badges awarded |
| Notification Delivery | Emails/push/SMS sent |
| Content Uploads | Files uploaded to MinIO |

---

## Alerting Rules & Response

### Critical Alerts (SEV-1)

| Alert | Condition | Response |
|-------|-----------|----------|
| **ServiceDown** | Service health check fails for > 2 min | Check pod logs, restart pod, check DB/Kafka connectivity |
| **HighErrorRate** | 5xx error rate > 5% for 5 min | Check logs for root cause, rollback if recent deployment |
| **DatabaseDown** | MySQL unreachable for > 1 min | Check MySQL pod, storage, connections |
| **KafkaDown** | Kafka broker unreachable for > 2 min | Check Zookeeper, restart Kafka pods |
| **DiskSpaceCritical** | Disk usage > 95% | Delete old backups, clean logs, expand volume |

### Warning Alerts (SEV-2/3)

| Alert | Condition | Response |
|-------|-----------|----------|
| **HighLatency** | P95 latency > 2s for 5 min | Check DB slow queries, Redis connectivity, scale service |
| **HighMemoryUsage** | Pod memory > 85% limit for 10 min | Check for memory leaks, increase limits, tune JVM heap |
| **HighCPU** | Pod CPU > 80% for 10 min | Scale horizontally, check for hot loops in code |
| **KafkaConsumerLag** | Consumer lag > 10,000 for 5 min | Scale consumer service, check processing time |
| **RedisHighMemory** | Redis memory > 85% for 5 min | Check eviction policy, flush non-critical caches |
| **MySQLSlowQueries** | > 10 slow queries/min for 5 min | Analyze queries, add indexes, optimize |
| **MySQLConnectionHigh** | Connections > 80% max for 5 min | Kill idle connections, increase pool size |
| **CertificateExpiring** | TLS cert expires in < 14 days | Check cert-manager, manual renewal if needed |
| **BackupFailed** | Backup CronJob failed | Check job logs, manual backup, fix CronJob |

### Informational Alerts (SEV-4)

| Alert | Condition | Response |
|-------|-----------|----------|
| **PodRestarted** | Pod restarted > 3 times in 1 hour | Check logs for crash reason |
| **DiskSpaceWarning** | Disk usage > 75% | Plan cleanup or expansion |
| **LowCacheHitRate** | Redis hit rate < 70% | Review caching strategy |

---

## Creating Custom Dashboards

### Step 1: Access Grafana

Navigate to Grafana (http://localhost:3001 or https://grafana.acadevia.in) and log in.

### Step 2: Create New Dashboard

1. Click **+** → **New Dashboard**
2. Click **Add visualization**
3. Select data source (Prometheus, Loki, or Jaeger)

### Step 3: Configure Panels

#### Prometheus Metrics (PromQL)

```promql
# Request rate per service
rate(http_server_requests_seconds_count{namespace="acadevia"}[5m])

# P95 latency per service
histogram_quantile(0.95, rate(http_server_requests_seconds_bucket{namespace="acadevia"}[5m]))

# Error rate percentage
100 * (
  sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m]))
  /
  sum(rate(http_server_requests_seconds_count[5m]))
)

# JVM heap usage
jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} * 100

# Active DB connections
hikaricp_connections_active{namespace="acadevia"}

# Kafka consumer lag (custom metric)
kafka_consumer_lag{namespace="acadevia"}
```

#### Loki Logs (LogQL)

```logql
# Error count per service (last 1h)
sum by (app) (count_over_time({namespace="acadevia"} |= "ERROR" [1h]))

# Rate of 500 errors
sum(rate({app="api-gateway"} |= "500" [5m]))
```

### Step 4: Set Up Variables

Add dashboard variables for dynamic filtering:

| Variable | Type | Query |
|----------|------|-------|
| `$service` | Query | `label_values(up{namespace="acadevia"}, app)` |
| `$namespace` | Constant | `acadevia` |
| `$interval` | Interval | `1m,5m,15m,1h` |

### Step 5: Save & Share

1. Click **Save Dashboard** (Ctrl+S)
2. Add to a folder (e.g., "Acadevia")
3. Share via **Share** button → Copy link

---

## Log Analysis with Loki

### Data Flow

```
Container stdout → Docker JSON log driver → Promtail → Loki → Grafana
```

Promtail reads Docker container logs from `/var/run/docker.sock` and ships them to Loki with labels.

### Querying Logs in Grafana

Navigate to **Explore** → Select **Loki** data source.

### Common LogQL Queries

```logql
# All logs from a specific service
{app="auth-service"}

# Filter by log level
{app="auth-service"} |= "ERROR"
{app="auth-service"} |= "WARN"

# Exclude noisy patterns
{app="api-gateway"} != "health" != "actuator"

# Regex search
{app="course-service"} |~ "took [0-9]{3,}ms"

# JSON parsing + filtering
{app="api-gateway"} | json | response_status >= 500

# Multi-line log entries (stack traces)
{app="auth-service"} |= "Exception"

# Count errors per service
sum by (app) (count_over_time({namespace="acadevia"} |= "ERROR" [1h]))

# Log throughput per service
sum by (app) (rate({namespace="acadevia"} [5m]))
```

### Log Labels Available

| Label | Example | Description |
|-------|---------|-------------|
| `app` | `auth-service` | Application name |
| `namespace` | `acadevia` | Kubernetes namespace |
| `container` | `acadevia-auth-service` | Container name |
| `pod` | `auth-service-abc123` | Pod name |
| `node` | `worker-1` | Kubernetes node |

### Log Retention

Loki stores logs on a local volume. Default retention can be configured in `loki-config.yml`:

```yaml
table_manager:
  retention_deletes_enabled: true
  retention_period: 168h  # 7 days
```

---

## Distributed Tracing with Jaeger

### How Tracing Works

```
Request → API Gateway → Auth Service → MySQL
            ↓
     Trace ID generated
     (propagated via headers)
            ↓
   All spans collected by Jaeger
```

Each Spring Boot service includes the OpenTelemetry SDK, which:
1. Creates a trace ID on the first request
2. Propagates the trace ID via HTTP headers
3. Reports spans to Jaeger Collector (OTLP protocol, port 14268)

### Accessing Jaeger

- **Development:** http://localhost:16686
- **Production:** `kubectl port-forward svc/jaeger 16686 -n acadevia`

### Using Jaeger UI

1. **Service dropdown** — Select the originating service
2. **Operation dropdown** — Select the API endpoint
3. **Tags** — Filter by HTTP method, status code, user ID
4. **Time range** — Narrow down the window

### Finding Slow Traces

1. Open Jaeger UI
2. Select service: `api-gateway`
3. Set **Min Duration:** `1s`
4. Click **Find Traces**
5. Sort by duration (descending)
6. Click on a trace to see the span waterfall

### Trace Correlation with Logs

Each trace ID can be correlated with logs in Loki:

```logql
{app="auth-service"} |= "trace_id=abc123def456"
```

In Grafana, use the **Trace to Logs** feature:
- Settings → Data Sources → Jaeger → Trace to logs → Select Loki

---

## Key Metrics to Watch

### Service Health (Top Priority)

| Metric | PromQL | Healthy Range |
|--------|--------|--------------|
| Service uptime | `up{namespace="acadevia"}` | `1` (always) |
| Request rate | `rate(http_server_requests_seconds_count[5m])` | Baseline ± 30% |
| Error rate | `rate(http_server_requests_seconds_count{status=~"5.."}[5m])` | < 1% |
| P50 latency | `histogram_quantile(0.5, rate(http_server_requests_seconds_bucket[5m]))` | < 100ms |
| P95 latency | `histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))` | < 500ms |
| P99 latency | `histogram_quantile(0.99, rate(http_server_requests_seconds_bucket[5m]))` | < 2s |

### JVM Health

| Metric | PromQL | Healthy Range |
|--------|--------|--------------|
| Heap usage % | `jvm_memory_used_bytes{area="heap"}/jvm_memory_max_bytes{area="heap"}*100` | < 85% |
| GC pause time | `rate(jvm_gc_pause_seconds_sum[5m])` | < 200ms avg |
| Thread count | `jvm_threads_live_threads` | < 200 |

### Infrastructure Health

| Metric | PromQL / Command | Healthy Range |
|--------|-----------------|--------------|
| MySQL connections | `mysql_global_status_threads_connected` | < 80% of max |
| MySQL query rate | `rate(mysql_global_status_queries[5m])` | Baseline |
| Redis memory | `redis_memory_used_bytes` | < 85% of max |
| Redis hit rate | `redis_keyspace_hits/(redis_keyspace_hits+redis_keyspace_misses)*100` | > 80% |
| Kafka consumer lag | `kafka_consumergroup_lag` | < 10,000 |
| Disk usage | Node exporter metrics | < 80% |

---

## Setting Up Integrations

### Slack Integration

1. In Grafana, go to **Alerting** → **Contact Points**
2. Click **New Contact Point**
3. Select **Slack**
4. Configure:
   - **Webhook URL:** `https://hooks.slack.com/services/YOUR/WEBHOOK/URL`
   - **Channel:** `#acadevia-alerts`
   - **Username:** `Grafana Alert`
5. Click **Test** → **Save**

### PagerDuty Integration

1. In Grafana, go to **Alerting** → **Contact Points**
2. Click **New Contact Point**
3. Select **PagerDuty**
4. Configure:
   - **Integration Key:** From your PagerDuty service
   - **Severity mapping:**
     - Critical alerts → `critical`
     - Warning alerts → `warning`
     - Info alerts → `info`
5. Click **Test** → **Save**

### Email Integration

1. Configure SMTP in Grafana (already set if using Docker Compose):
   ```ini
   [smtp]
   enabled = true
   host = smtp.example.com:587
   user = alerts@acadevia.in
   password = <password>
   from_address = alerts@acadevia.in
   ```
2. Add email contact point in **Alerting** → **Contact Points**

### Notification Policies

Set up routing rules in **Alerting** → **Notification Policies**:

| Alert Severity | Contact Point | Repeat Interval |
|---------------|--------------|-----------------|
| Critical (SEV-1) | PagerDuty + Slack | 5 min |
| Warning (SEV-2/3) | Slack | 30 min |
| Info (SEV-4) | Email | 4 hours |

---

## Monitoring Maintenance

### Prometheus Storage

- **Retention:** 15 days (configured via `--storage.tsdb.retention.time=15d`)
- **Storage location:** `prometheus-data` Docker volume or PV
- **Estimated size:** ~2 GB per week (depends on metric cardinality)

### Cleaning Up Old Data

```bash
# Check Prometheus storage usage
kubectl exec -it prometheus-0 -n acadevia -- du -sh /prometheus

# Prometheus handles cleanup automatically based on retention settings
# To force cleanup, restart Prometheus
kubectl rollout restart deployment/prometheus -n acadevia
```

### Grafana Backup

```bash
# Export all dashboards
for uid in $(curl -s http://admin:admin@localhost:3001/api/search | jq -r '.[].uid'); do
  curl -s "http://admin:admin@localhost:3001/api/dashboards/uid/$uid" | jq . > "dashboard-$uid.json"
done
```

### Updating Alert Rules

Alert rules are stored in `config/prometheus/alert-rules.yml`:

```bash
# After editing alert rules, reload Prometheus
curl -X POST http://localhost:9090/-/reload

# Or restart Prometheus
kubectl rollout restart deployment/prometheus -n acadevia
```
