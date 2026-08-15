# 📘 Acadevia — SIH Technical Documentation

This folder contains the **complete technical documentation** of the Acadevia
platform prepared for **Smart India Hackathon 2026**.

## 📄 Deliverables

| File | Description |
|---|---|
| **`Acadevia_SIH_Technical_Documentation.pdf`** | The main 10-section submission PDF (≈ 550 KB). |
| `system_connection_diagram.png` | High-resolution architecture / connection diagram (also embedded as Figure 1 in the PDF). |
| `Acadevia_SIH_Technical_Documentation.py` | ReportLab script that generates the PDF. Re-runnable. |
| `Acadevia_Diagram.py` | Matplotlib script that generates the connection diagram. Re-runnable. |

## 🧩 What the PDF covers

1. Executive Summary
2. Complete Technology Stack (frontend, backend, data, infra, security, observability)
3. System Architecture (with the structured connection diagram)
4. Microservice Catalog (all 16 services)
5. Structured System Connection Map (REST routes, Kafka topics, WebSockets, 16×16 dependency matrix)
6. End-to-End Request Lifecycle
7. Deployment Topology (Docker Compose, Kubernetes, Jenkins CI/CD)
8. Non-Functional Requirements
9. Justification of Technology Choices
10. Roadmap & Future Enhancements

## 🛠️ How to regenerate

```bash
# 1. Generate the connection diagram
python3 Acadevia_Diagram.py

# 2. Generate the PDF (embeds the diagram)
python3 Acadevia_SIH_Technical_Documentation.py
```

Requirements: `pip install reportlab matplotlib`

---

*Prepared by Team Acadevia for SIH 2026.*
