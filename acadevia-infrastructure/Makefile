# ============================================================
# Acadevia Platform — Makefile
# ============================================================

.PHONY: help dev dev-infra dev-stop dev-reset dev-logs \
        build build-service build-frontend \
        test test-service test-frontend test-e2e test-coverage \
        push push-service \
        k8s-create-ns k8s-apply-config k8s-deploy-infra k8s-deploy-all \
        k8s-deploy k8s-rollback k8s-scale k8s-status k8s-logs \
        deploy-staging deploy-production \
        db-migrate db-backup db-restore \
        monitoring-up monitoring-down \
        health clean generate-secrets lint

# ── Colors ──
BLUE   := \033[0;34m
GREEN  := \033[0;32m
YELLOW := \033[1;33m
RED    := \033[0;31m
NC     := \033[0m

# ── Variables ──
DOCKER_COMPOSE   := docker compose
INFRA_DIR        := $(shell cd "$(dir $(abspath $(lastword $(MAKEFILE_LIST))))" && pwd)
PROJECT_ROOT     := $(shell dirname "$(INFRA_DIR)")
COMPOSE_DIR      := $(INFRA_DIR)/docker
K8S_DIR          := $(INFRA_DIR)/kubernetes
SCRIPTS_DIR      := $(INFRA_DIR)/scripts
INFRA_COMPOSE    := $(COMPOSE_DIR)/docker-compose.infra.yml
MAIN_COMPOSE     := $(COMPOSE_DIR)/docker-compose.yml
MONITORING_COMPOSE := $(COMPOSE_DIR)/docker-compose.monitoring.yml
PROD_COMPOSE     := $(COMPOSE_DIR)/docker-compose.prod.yml
REGISTRY         ?= acadevia
IMAGE_TAG        ?= latest
SERVICE          ?=
REPLICAS         ?= 2
NAMESPACE        := acadevia
CONTEXT          ?= $(shell kubectl config current-context 2>/dev/null)

SERVICES := api-gateway auth-service user-service course-service content-service \
            quiz-service game-service sync-service gamification-service \
            leaderboard-service notification-service analytics-service \
            admin-service i18n-service frontend

# ============================================================
# HELP
# ============================================================

help: ## Show this help
	@echo ""
	@echo "  $(BLUE)Acadevia Platform$(NC) — available targets:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-22s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ============================================================
# DEVELOPMENT
# ============================================================

dev: ## Start FULL stack in Docker (infra + control plane + all services + frontend)
	@echo "$(BLUE)Starting Acadevia full development stack in Docker...$(NC)"
	@echo "$(YELLOW)Building images (cached layers make rebuilds fast) and starting containers...$(NC)"
	@cd "$(COMPOSE_DIR)" && $(DOCKER_COMPOSE) up -d --build
	@echo "$(GREEN)✅ Compose is converging: infra → registry → config → services → gateway → frontend$(NC)"
	@echo "$(GREEN)   No 'mvn spring-boot:run' needed — Docker owns every backend process.$(NC)"
	@echo "$(YELLOW)   Verify with: make health   then   make smoke$(NC)"

dev-infra: ## Start only infrastructure (DB, Kafka, Redis, MinIO)
	@echo "$(BLUE)Starting infrastructure services...$(NC)"
	@cd "$(COMPOSE_DIR)" && $(DOCKER_COMPOSE) -f docker-compose.infra.yml up -d
	@echo "$(GREEN)✅ Infrastructure started$(NC)"

dev-stop: ## Stop all containers
	@echo "$(YELLOW)Stopping all services...$(NC)"
	@cd "$(COMPOSE_DIR)" && $(DOCKER_COMPOSE) down 2>/dev/null; true
	@cd "$(COMPOSE_DIR)" && $(DOCKER_COMPOSE) -f docker-compose.monitoring.yml down 2>/dev/null; true
	@cd "$(COMPOSE_DIR)" && $(DOCKER_COMPOSE) -f docker-compose.infra.yml down 2>/dev/null; true
	@echo "$(GREEN)✅ All services stopped$(NC)"

dev-reset: ## Stop + remove volumes + restart fresh
	@echo "$(RED)⚠️  Removing all containers and volumes...$(NC)"
	@cd "$(COMPOSE_DIR)" && $(DOCKER_COMPOSE) down -v --remove-orphans 2>/dev/null; true
	@cd "$(COMPOSE_DIR)" && $(DOCKER_COMPOSE) -f docker-compose.monitoring.yml down -v --remove-orphans 2>/dev/null; true
	@cd "$(COMPOSE_DIR)" && $(DOCKER_COMPOSE) -f docker-compose.infra.yml down -v --remove-orphans 2>/dev/null; true
	@echo "$(YELLOW)All data removed. Run 'make dev' to start fresh.$(NC)"

dev-logs: ## Tail logs (usage: make dev-logs SERVICE=auth-service)
	@cd "$(COMPOSE_DIR)" && $(DOCKER_COMPOSE) logs -f $(SERVICE)

# ============================================================
# BUILD
# ============================================================

build: ## Build all Docker images
	@chmod +x "$(SCRIPTS_DIR)/build-all-images.sh"
	@"$(SCRIPTS_DIR)/build-all-images.sh" $(IMAGE_TAG)

build-service: ## Build single service image (usage: make build-service SERVICE=auth-service)
	@if [ -z "$(SERVICE)" ]; then echo "$(RED)ERROR: SERVICE is required. Usage: make build-service SERVICE=auth-service$(NC)"; exit 1; fi
	@echo "$(BLUE)Building $(SERVICE)...$(NC)"
	@if [ -f "$(COMPOSE_DIR)/services/$(SERVICE)/Dockerfile" ]; then \
		docker build -t $(REGISTRY)/$(SERVICE):$(IMAGE_TAG) -f "$(COMPOSE_DIR)/services/$(SERVICE)/Dockerfile" "$(PROJECT_ROOT)"; \
	elif [ -f "$(PROJECT_ROOT)/$(SERVICE)/Dockerfile" ]; then \
		docker build -t $(REGISTRY)/$(SERVICE):$(IMAGE_TAG) -f "$(PROJECT_ROOT)/$(SERVICE)/Dockerfile" "$(PROJECT_ROOT)/$(SERVICE)"; \
	else \
		echo "$(RED)❌ No Dockerfile found for $(SERVICE)$(NC)"; exit 1; \
	fi
	@echo "$(GREEN)✅ $(REGISTRY)/$(SERVICE):$(IMAGE_TAG) built$(NC)"

build-frontend: ## Build frontend Docker image
	@echo "$(BLUE)Building frontend...$(NC)"
	@if [ -f "$(COMPOSE_DIR)/services/frontend/Dockerfile.prod" ]; then \
		docker build -t $(REGISTRY)/frontend:$(IMAGE_TAG) -f "$(COMPOSE_DIR)/services/frontend/Dockerfile.prod" "$(PROJECT_ROOT)"; \
	elif [ -f "$(COMPOSE_DIR)/services/frontend/Dockerfile" ]; then \
		docker build -t $(REGISTRY)/frontend:$(IMAGE_TAG) -f "$(COMPOSE_DIR)/services/frontend/Dockerfile" "$(PROJECT_ROOT)"; \
	else \
		echo "$(RED)❌ No frontend Dockerfile found$(NC)"; exit 1; \
	fi
	@echo "$(GREEN)✅ $(REGISTRY)/frontend:$(IMAGE_TAG) built$(NC)"

# ============================================================
# TEST
# ============================================================

test: ## Run all backend tests
	@echo "$(BLUE)Running all tests...$(NC)"
	@cd "$(PROJECT_ROOT)" && mvn verify

test-service: ## Run tests for single service (usage: make test-service SERVICE=auth-service)
	@if [ -z "$(SERVICE)" ]; then echo "$(RED)ERROR: SERVICE is required$(NC)"; exit 1; fi
	@echo "$(BLUE)Running tests for $(SERVICE)...$(NC)"
	@cd "$(PROJECT_ROOT)" && mvn verify -pl $(SERVICE) -am

test-frontend: ## Run frontend unit tests
	@echo "$(BLUE)Running frontend tests...$(NC)"
	@cd "$(PROJECT_ROOT)/acadevia-frontend" && npm test

test-e2e: ## Run Playwright E2E tests
	@echo "$(BLUE)Running E2E tests...$(NC)"
	@cd "$(PROJECT_ROOT)/acadevia-frontend" && npx playwright test

test-coverage: ## Generate test coverage report (usage: make test-coverage SERVICE=auth-service)
	@if [ -z "$(SERVICE)" ]; then echo "$(RED)ERROR: SERVICE is required$(NC)"; exit 1; fi
	@echo "$(BLUE)Generating coverage for $(SERVICE)...$(NC)"
	@cd "$(PROJECT_ROOT)" && mvn verify -pl $(SERVICE) -am jacoco:report
	@echo "$(GREEN)✅ Coverage report: $(PROJECT_ROOT)/$(SERVICE)/target/site/jacoco/index.html$(NC)"

# ============================================================
# DOCKER PUSH
# ============================================================

push: ## Push all images to registry
	@chmod +x "$(SCRIPTS_DIR)/push-all-images.sh"
	@"$(SCRIPTS_DIR)/push-all-images.sh" $(REGISTRY) $(IMAGE_TAG)

push-service: ## Push single service image (usage: make push-service SERVICE=auth-service)
	@if [ -z "$(SERVICE)" ]; then echo "$(RED)ERROR: SERVICE is required$(NC)"; exit 1; fi
	@echo "$(BLUE)Pushing $(REGISTRY)/$(SERVICE):$(IMAGE_TAG)...$(NC)"
	@docker push $(REGISTRY)/$(SERVICE):$(IMAGE_TAG)
	@echo "$(GREEN)✅ Pushed$(NC)"

# ============================================================
# KUBERNETES
# ============================================================

k8s-create-ns: ## Create Kubernetes namespace
	@echo "$(BLUE)Creating namespace '$(NAMESPACE)'...$(NC)"
	@kubectl apply -f "$(K8S_DIR)/namespace.yml"
	@echo "$(GREEN)✅ Namespace created$(NC)"

k8s-apply-config: ## Apply ConfigMaps and Secrets
	@echo "$(BLUE)Applying configuration...$(NC)"
	@kubectl apply -f "$(K8S_DIR)/config/" -n $(NAMESPACE)
	@echo "$(GREEN)✅ Configuration applied$(NC)"

k8s-deploy-infra: ## Deploy infrastructure to Kubernetes (databases, Kafka, Redis)
	@echo "$(BLUE)Deploying infrastructure to Kubernetes...$(NC)"
	@kubectl apply -f "$(K8S_DIR)/infrastructure/" -n $(NAMESPACE)
	@echo "$(GREEN)✅ Infrastructure deployed$(NC)"

k8s-deploy-all: ## Deploy all services to Kubernetes
	@echo "$(BLUE)Deploying all services to Kubernetes...$(NC)"
	@$(MAKE) k8s-create-ns
	@$(MAKE) k8s-apply-config
	@$(MAKE) k8s-deploy-infra
	@echo "$(YELLOW)Waiting for infrastructure pods...$(NC)"
	@sleep 15
	@kubectl apply -f "$(K8S_DIR)/services/" -n $(NAMESPACE)
	@kubectl apply -f "$(K8S_DIR)/networking/" -n $(NAMESPACE)
	@kubectl apply -f "$(K8S_DIR)/scaling/" -n $(NAMESPACE) 2>/dev/null; true
	@kubectl apply -f "$(K8S_DIR)/monitoring/" -n $(NAMESPACE) 2>/dev/null; true
	@echo "$(GREEN)✅ All services deployed$(NC)"

k8s-deploy: ## Deploy single service to Kubernetes (usage: make k8s-deploy SERVICE=auth-service)
	@if [ -z "$(SERVICE)" ]; then echo "$(RED)ERROR: SERVICE is required$(NC)"; exit 1; fi
	@echo "$(BLUE)Deploying $(SERVICE) to Kubernetes...$(NC)"
	@kubectl apply -f "$(K8S_DIR)/services/$(SERVICE)/" -n $(NAMESPACE)
	@echo "$(GREEN)✅ $(SERVICE) deployed$(NC)"

k8s-rollback: ## Rollback a service deployment (usage: make k8s-rollback SERVICE=auth-service)
	@if [ -z "$(SERVICE)" ]; then echo "$(RED)ERROR: SERVICE is required$(NC)"; exit 1; fi
	@echo "$(YELLOW)Rolling back $(SERVICE)...$(NC)"
	@kubectl rollout undo deployment/$(SERVICE) -n $(NAMESPACE)
	@echo "$(GREEN)✅ $(SERVICE) rolled back$(NC)"

k8s-scale: ## Scale a service (usage: make k8s-scale SERVICE=auth-service REPLICAS=3)
	@if [ -z "$(SERVICE)" ]; then echo "$(RED)ERROR: SERVICE is required$(NC)"; exit 1; fi
	@echo "$(BLUE)Scaling $(SERVICE) to $(REPLICAS) replicas...$(NC)"
	@kubectl scale deployment/$(SERVICE) --replicas=$(REPLICAS) -n $(NAMESPACE)
	@echo "$(GREEN)✅ $(SERVICE) scaled to $(REPLICAS) replicas$(NC)"

k8s-status: ## Show status of all Kubernetes resources
	@echo "$(BLUE)Kubernetes status for namespace '$(NAMESPACE)':$(NC)"
	@echo ""
	@echo "$(YELLOW)── Pods ──$(NC)"
	@kubectl get pods -n $(NAMESPACE) -o wide 2>/dev/null || echo "  No pods found"
	@echo ""
	@echo "$(YELLOW)── Services ──$(NC)"
	@kubectl get svc -n $(NAMESPACE) 2>/dev/null || echo "  No services found"
	@echo ""
	@echo "$(YELLOW)── Deployments ──$(NC)"
	@kubectl get deployments -n $(NAMESPACE) 2>/dev/null || echo "  No deployments found"
	@echo ""
	@echo "$(YELLOW)── HPA ──$(NC)"
	@kubectl get hpa -n $(NAMESPACE) 2>/dev/null || echo "  No HPAs found"
	@echo ""
	@echo "$(YELLOW)── Ingress ──$(NC)"
	@kubectl get ingress -n $(NAMESPACE) 2>/dev/null || echo "  No ingresses found"

k8s-logs: ## View logs of a Kubernetes service (usage: make k8s-logs SERVICE=auth-service)
	@if [ -z "$(SERVICE)" ]; then echo "$(RED)ERROR: SERVICE is required$(NC)"; exit 1; fi
	@kubectl logs -l app=$(SERVICE) -n $(NAMESPACE) --tail=200 -f

# ============================================================
# DEPLOYMENT
# ============================================================

deploy-staging: ## Deploy to staging cluster
	@echo "$(BLUE)Deploying to staging...$(NC)"
	@$(MAKE) build IMAGE_TAG=staging
	@$(MAKE) push IMAGE_TAG=staging
	@kubectl config use-context staging 2>/dev/null || echo "$(YELLOW)⚠ 'staging' context not found, using current$(NC)"
	@IMAGE_TAG=staging $(MAKE) k8s-deploy-all
	@echo "$(GREEN)✅ Deployed to staging$(NC)"

deploy-production: ## Deploy to production cluster (with confirmation)
	@echo "$(RED)⚠️  You are about to deploy to PRODUCTION!$(NC)"
	@read -p "Type 'yes' to confirm: " confirm && [ "$$confirm" = "yes" ] || { echo "Aborted."; exit 1; }
	@echo "$(BLUE)Deploying to production...$(NC)"
	@$(MAKE) build IMAGE_TAG=production
	@$(MAKE) push IMAGE_TAG=production
	@kubectl config use-context production 2>/dev/null || echo "$(YELLOW)⚠ 'production' context not found, using current$(NC)"
	@IMAGE_TAG=production $(MAKE) k8s-deploy-all
	@echo "$(GREEN)✅ Deployed to production$(NC)"

# ============================================================
# DATABASE
# ============================================================

db-migrate: ## Run database migrations
	@echo "$(BLUE)Running database migrations...$(NC)"
	@cd "$(PROJECT_ROOT)" && mvn flyway:migrate -pl auth-service,user-service,course-service,content-service,quiz-service,game-service,notification-service,admin-service 2>/dev/null || \
		echo "$(YELLOW)⚠ Flyway plugin not configured — migrations run at service startup$(NC)"

db-backup: ## Backup all databases
	@echo "$(BLUE)Backing up databases...$(NC)"
	@mkdir -p "$(INFRA_DIR)/backups"
	@TIMESTAMP=$$(date +%Y%m%d_%H%M%S); \
	cd "$(COMPOSE_DIR)" && $(DOCKER_COMPOSE) -f docker-compose.infra.yml exec -T mysql \
		mysqldump -u root -p"$${MYSQL_ROOT_PASSWORD:-root}" --all-databases --single-transaction \
		> "$(INFRA_DIR)/backups/acadevia_backup_$${TIMESTAMP}.sql" && \
	echo "$(GREEN)✅ Backup saved to backups/acadevia_backup_$${TIMESTAMP}.sql$(NC)" || \
	echo "$(RED)❌ Backup failed$(NC)"

db-restore: ## Restore database from backup (usage: make db-restore FILE=backups/acadevia_backup_xxx.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)ERROR: FILE is required. Usage: make db-restore FILE=backups/acadevia_backup_xxx.sql$(NC)"; \
		echo "$(YELLOW)Available backups:$(NC)"; \
		ls -la "$(INFRA_DIR)/backups/"*.sql 2>/dev/null || echo "  No backups found"; \
		exit 1; \
	fi
	@echo "$(YELLOW)⚠️  This will overwrite current database data!$(NC)"
	@read -p "Continue? (y/N): " confirm && [ "$$confirm" = "y" ] || { echo "Aborted."; exit 1; }
	@echo "$(BLUE)Restoring from $(FILE)...$(NC)"
	@cd "$(COMPOSE_DIR)" && cat "$(INFRA_DIR)/$(FILE)" | $(DOCKER_COMPOSE) -f docker-compose.infra.yml exec -T mysql \
		mysql -u root -p"$${MYSQL_ROOT_PASSWORD:-root}" && \
	echo "$(GREEN)✅ Database restored$(NC)" || \
	echo "$(RED)❌ Restore failed$(NC)"

# ============================================================
# MONITORING
# ============================================================

monitoring-up: ## Start monitoring stack (Grafana, Prometheus, Jaeger)
	@echo "$(BLUE)Starting monitoring stack...$(NC)"
	@cd "$(COMPOSE_DIR)" && $(DOCKER_COMPOSE) -f docker-compose.monitoring.yml up -d
	@echo "$(GREEN)✅ Monitoring started$(NC)"
	@echo "  Grafana:    http://localhost:3001"
	@echo "  Prometheus: http://localhost:9090"
	@echo "  Jaeger:     http://localhost:16686"

monitoring-down: ## Stop monitoring stack
	@echo "$(YELLOW)Stopping monitoring stack...$(NC)"
	@cd "$(COMPOSE_DIR)" && $(DOCKER_COMPOSE) -f docker-compose.monitoring.yml down
	@echo "$(GREEN)✅ Monitoring stopped$(NC)"

# ============================================================
# UTILITIES
# ============================================================

health: ## Health check all services
	@chmod +x "$(SCRIPTS_DIR)/health-check.sh"
	@"$(SCRIPTS_DIR)/health-check.sh"

smoke: ## Functional smoke test of the running full stack (infra→gateway→frontend)
	@chmod +x "$(SCRIPTS_DIR)/stack-smoke-test.sh"
	@"$(SCRIPTS_DIR)/stack-smoke-test.sh"

clean: ## Remove all containers, images, volumes, and build artifacts
	@echo "$(RED)⚠️  This will remove ALL Acadevia containers, images, and volumes$(NC)"
	@read -p "Continue? (y/N): " confirm && [ "$$confirm" = "y" ] || { echo "Aborted."; exit 1; }
	@echo "$(YELLOW)Stopping all containers...$(NC)"
	@cd "$(COMPOSE_DIR)" && $(DOCKER_COMPOSE) down -v --remove-orphans 2>/dev/null; true
	@cd "$(COMPOSE_DIR)" && $(DOCKER_COMPOSE) -f docker-compose.monitoring.yml down -v --remove-orphans 2>/dev/null; true
	@cd "$(COMPOSE_DIR)" && $(DOCKER_COMPOSE) -f docker-compose.infra.yml down -v --remove-orphans 2>/dev/null; true
	@echo "$(YELLOW)Removing Acadevia images...$(NC)"
	@docker images --format '{{.Repository}}:{{.Tag}}' | grep "$(REGISTRY)/" | xargs -r docker rmi -f 2>/dev/null; true
	@echo "$(YELLOW)Pruning dangling images...$(NC)"
	@docker image prune -f 2>/dev/null; true
	@echo "$(YELLOW)Cleaning Maven build artifacts...$(NC)"
	@cd "$(PROJECT_ROOT)" && mvn clean -q 2>/dev/null; true
	@echo "$(GREEN)✅ Everything cleaned$(NC)"

generate-secrets: ## Generate random secrets for .env
	@chmod +x "$(SCRIPTS_DIR)/generate-secrets.sh"
	@"$(SCRIPTS_DIR)/generate-secrets.sh"

lint: ## Run linters (backend + frontend)
	@echo "$(BLUE)Running linters...$(NC)"
	@echo ""
	@echo "$(YELLOW)── Backend (Checkstyle) ──$(NC)"
	@cd "$(PROJECT_ROOT)" && mvn checkstyle:check -q 2>/dev/null && \
		echo "$(GREEN)  ✅ Backend lint passed$(NC)" || \
		echo "$(YELLOW)  ⚠ Checkstyle plugin not configured or issues found$(NC)"
	@echo ""
	@echo "$(YELLOW)── Frontend (ESLint) ──$(NC)"
	@cd "$(PROJECT_ROOT)/acadevia-frontend" && npx eslint . 2>/dev/null && \
		echo "$(GREEN)  ✅ Frontend lint passed$(NC)" || \
		echo "$(YELLOW)  ⚠ ESLint issues found$(NC)"
	@echo ""
	@echo "$(GREEN)✅ Lint complete$(NC)"
