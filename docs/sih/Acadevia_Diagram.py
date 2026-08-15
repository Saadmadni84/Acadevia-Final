#!/usr/bin/env python3
"""Generate a structured system connection diagram for Acadevia."""
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import matplotlib.lines as mlines

fig, ax = plt.subplots(figsize=(18, 12), dpi=160)
ax.set_xlim(0, 18)
ax.set_ylim(0, 12)
ax.axis('off')
ax.set_facecolor('#FAFAFF')

PRIMARY   = '#6C63FF'
SECONDARY = '#1E1E2E'
ACCENT    = '#00BFA6'
WARN      = '#FF6B6B'
GREY      = '#6B7280'
LIGHT     = '#F4F4FF'

# ---------- Helpers ----------
def box(x, y, w, h, label, color=PRIMARY, fc=None, tc='white', fs=8.5, bold=True):
    fc = fc or color
    p = FancyBboxPatch((x, y), w, h,
                       boxstyle="round,pad=0.05,rounding_size=0.15",
                       linewidth=1.2, edgecolor=color, facecolor=fc)
    ax.add_patch(p)
    ax.text(x + w/2, y + h/2, label, ha='center', va='center',
            fontsize=fs, color=tc,
            fontweight='bold' if bold else 'normal', wrap=True)

def arrow(x1, y1, x2, y2, color=GREY, lw=1.0, style='-', label=None, label_offset=(0,0.15), alpha=1.0):
    a = FancyArrowPatch((x1, y1), (x2, y2),
                        arrowstyle='->,head_length=6,head_width=4',
                        color=color, linewidth=lw, linestyle=style,
                        alpha=alpha,
                        mutation_scale=10, zorder=1)
    ax.add_patch(a)
    if label:
        ax.text((x1+x2)/2 + label_offset[0], (y1+y2)/2 + label_offset[1],
                label, ha='center', fontsize=7, color=color,
                bbox=dict(boxstyle='round,pad=0.18', fc='white', ec=color, lw=0.5))

# ---------- Title ----------
ax.text(9, 11.6, "Acadevia — Structured System Connection Map",
        ha='center', fontsize=20, fontweight='bold', color=SECONDARY)
ax.text(9, 11.15,
        "Client → Gateway → Microservices → Data / Event Bus / Observability",
        ha='center', fontsize=11, color=GREY, style='italic')

# ---------- LAYER 1: CLIENTS ----------
box(0.5, 9.7, 4.5, 0.9, "📱  React 19 PWA Client\n(Vite + Workbox + Dexie)",
    color=PRIMARY)
box(5.5, 9.7, 4.5, 0.9, "💻  Student Dashboard\n(Mobile / Tablet / Laptop)",
    color=PRIMARY)
box(10.5, 9.7, 3.5, 0.9, "🧑‍🏫  Teacher Portal",
    color=PRIMARY)
box(14.5, 9.7, 3.0, 0.9, "🛠️  Admin Console",
    color=PRIMARY)

# ---------- LAYER 2: GATEWAY ----------
box(6.0, 8.1, 6.0, 1.0,
    "🌐  SPRING CLOUD API GATEWAY  :8080\nRouting • JWT Auth • Rate-Limit (Redis) • CORS • Tracing",
    color=SECONDARY, fs=10)

# arrows clients -> gateway
for x in [2.75, 7.75, 12.25, 16.0]:
    arrow(x, 9.7, 9.0, 9.1, color=PRIMARY, lw=1.4)

# ---------- LAYER 3: REGISTRY + CONFIG ----------
box(0.5, 8.1, 5.0, 1.0,
    "🧭  EUREKA SERVICE REGISTRY  :8761\nService discovery + health-checks",
    color=ACCENT)
box(12.5, 8.1, 5.0, 1.0,
    "⚙️  CONFIG SERVER  :8888\nCentralized externalized config",
    color=ACCENT)
arrow(9, 8.1, 3.0, 8.6, color=ACCENT, style='--', lw=1.0, label='register / heartbeat')
arrow(9, 8.1, 15.0, 8.6, color=ACCENT, style='--', lw=1.0, label='fetch config')

# ---------- LAYER 4: MICROSERVICES (16) ----------
micros = [
    ("auth\n:8081", 0.5, 6.2),
    ("user\n:8082", 2.3, 6.2),
    ("course\n:8083", 4.1, 6.2),
    ("content\n:8084", 5.9, 6.2),
    ("quiz\n:8085", 7.7, 6.2),
    ("game\n:8086", 9.5, 6.2),
    ("gamif.\n:8087", 11.3, 6.2),
    ("leader-\nboard:8088", 13.1, 6.2),
    ("notif.\n:8089", 15.0, 6.2),
    ("admin\n:8090", 0.5, 4.7),
    ("locale\n:8091", 2.3, 4.7),
    ("sync\n:8092", 4.1, 4.7),
    ("analytics\n:8093", 5.9, 4.7),
]
for label, x, y in micros:
    box(x, y, 1.6, 1.0, label, color=PRIMARY, fs=8)

# gateway -> services (fan-out)
for label, x, y in micros:
    arrow(9.0, 8.1, x + 0.8, y + 1.0, color=PRIMARY, lw=0.6, alpha=0.5)

# ---------- LAYER 5: DATABASES ----------
box(0.5, 3.0, 6.0, 1.0, "🗄️  MySQL 8  (logical DB per service)\nauth_db • user_db • course_db • content_db • quiz_db …",
    color=WARN)
box(7.0, 3.0, 5.0, 1.0, "💾  Redis 7\nRate-limit • Sessions • Leaderboard ZSET",
    color='#DC2626')
box(12.5, 3.0, 5.0, 1.0, "🪣  MinIO  (S3)\nVideos • PDFs • Thumbnails",
    color='#7C3AED')

# Service -> DB
arrow(1.3, 6.2, 2.0, 4.05, color=WARN, lw=0.5)
arrow(3.1, 6.2, 2.5, 4.05, color=WARN, lw=0.5)
arrow(4.9, 6.2, 3.0, 4.05, color=WARN, lw=0.5)
arrow(6.7, 6.2, 4.0, 4.05, color=WARN, lw=0.5)
arrow(8.5, 6.2, 5.0, 4.05, color=WARN, lw=0.5)
arrow(10.3, 6.2, 5.5, 4.05, color=WARN, lw=0.5)
arrow(12.1, 6.2, 6.0, 4.05, color=WARN, lw=0.5)
arrow(15.8, 6.2, 6.5, 4.05, color=WARN, lw=0.5)

# Leaderboard -> Redis
arrow(13.9, 6.2, 9.5, 4.05, color='#DC2626', lw=0.8, label='ZADD')
# Content -> MinIO
arrow(6.7, 6.2, 15.0, 4.05, color='#7C3AED', lw=0.7, label='S3 put/get')

# ---------- LAYER 6: KAFKA EVENT BUS ----------
box(2.0, 1.4, 14.0, 1.0,
    "📨  KAFKA 7.5  (Event Backbone)\n"
    "Topics: user.registered • course.enrolled • quiz.attempted • game.played • badge.unlocked • leaderboard.changed • notification.* • sync.delta",
    color=ACCENT, fs=8.5)

# services -> kafka
for label, x, y in micros:
    arrow(x + 0.8, y, x + 0.8, 2.45, color=ACCENT, lw=0.4, style=':')

# ---------- LAYER 7: OBSERVABILITY ----------
box(0.5, 0.1, 4.0, 0.9, "📊  Prometheus  +  Grafana", color=SECONDARY)
box(5.0, 0.1, 3.0, 0.9, "🔍  Zipkin Tracing", color=SECONDARY)
box(8.5, 0.1, 3.5, 0.9, "📜  Loki  +  Promtail", color=SECONDARY)
box(12.5, 0.1, 5.0, 0.9, "🚨  Alertmanager  →  Slack / PagerDuty", color=SECONDARY)

# Each service scrapes (vertical line down)
for label, x, y in micros:
    ax.plot([x + 0.8, x + 0.8], [y, 1.05], color=GREY, lw=0.3, linestyle='--', zorder=0)

# ---------- LEGEND ----------
legend_x = 16.5
legend_y = 8.6
ax.add_patch(FancyBboxPatch((legend_x - 0.1, legend_y - 1.6), 1.5, 1.7,
                            boxstyle="round,pad=0.05",
                            fc='white', ec=GREY, lw=0.5))
ax.text(legend_x + 0.65, legend_y + 0.95, "LEGEND", ha='center', fontsize=8, fontweight='bold', color=SECONDARY)
ax.plot([legend_x, legend_x + 0.5], [legend_y + 0.6, legend_y + 0.6], color=PRIMARY, lw=1.5)
ax.text(legend_x + 0.6, legend_y + 0.6, "REST", fontsize=7, va='center', color=SECONDARY)
ax.plot([legend_x, legend_x + 0.5], [legend_y + 0.3, legend_y + 0.3], color=ACCENT, lw=1.5, linestyle=':')
ax.text(legend_x + 0.6, legend_y + 0.3, "Kafka", fontsize=7, va='center', color=SECONDARY)
ax.plot([legend_x, legend_x + 0.5], [legend_y, legend_y], color=ACCENT, lw=1.5, linestyle='--')
ax.text(legend_x + 0.6, legend_y, "Config/Health", fontsize=7, va='center', color=SECONDARY)
ax.plot([legend_x, legend_x + 0.5], [legend_y - 0.3, legend_y - 0.3], color=WARN, lw=1.5)
ax.text(legend_x + 0.6, legend_y - 0.3, "DB", fontsize=7, va='center', color=SECONDARY)

plt.tight_layout()
plt.savefig("system_connection_diagram.png", dpi=160, bbox_inches='tight',
            facecolor='#FAFAFF')
print("✅ Diagram saved: system_connection_diagram.png")
