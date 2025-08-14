pwd := $(shell pwd)

# Variables
DOCKER_COMPOSE = docker compose
DJANGO_BACKEND_CONTAINER = backend
MANAGE_PY = $(DOCKER_COMPOSE) exec $(DJANGO_BACKEND_CONTAINER) python manage.py

# Colors for output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m # No Color

.PHONY: help
help: ## Show this help message
	@echo "$(BLUE)Available commands:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# =============================================================================
# SETUP & INSTALLATION
# =============================================================================

.PHONY: setup
setup: build up migrate ## Complete project setup (build, up, migrate)
	@echo "$(GREEN)✅ Project setup complete!$(NC)"
	@echo "$(YELLOW)Backend:$(NC) http://localhost:8000"
	@echo "$(YELLOW)Frontend:$(NC) http://localhost:3000"
	@echo "$(YELLOW)pgAdmin:$(NC) http://localhost:5050"
	@echo "$(YELLOW)Flower:$(NC) http://localhost:5555"

.PHONY: first-time-setup
first-time-setup: clean build up wait-for-db migrate createsuperuser ## Complete first-time setup
	@echo "$(GREEN)🎉 First time setup complete!$(NC)"

# =============================================================================
# DOCKER OPERATIONS
# =============================================================================

.PHONY: build
build: ## Build all containers
	@echo "$(BLUE)🔨 Building containers...$(NC)"
	$(DOCKER_COMPOSE) build --no-cache

.PHONY: build-backend
build-backend: ## Build only backend container
	$(DOCKER_COMPOSE) build backend

.PHONY: build-frontend
build-frontend: ## Build only frontend container
	$(DOCKER_COMPOSE) build frontend

.PHONY: up
up: ## Start all services
	@echo "$(BLUE)🚀 Starting services...$(NC)"
	$(DOCKER_COMPOSE) up -d

.PHONY: down
down: ## Stop all services
	@echo "$(YELLOW)⏹️  Stopping services...$(NC)"
	$(DOCKER_COMPOSE) down

.PHONY: restart
restart: ## Restart all services
	@echo "$(BLUE)🔄 Restarting services...$(NC)"
	$(DOCKER_COMPOSE) restart

.PHONY: kill
kill: down ## Stop all services (alias for down)

.PHONY: ps
ps: ## Show running containers
	$(DOCKER_COMPOSE) ps

.PHONY: logs
logs: ## Show logs for all services
	$(DOCKER_COMPOSE) logs -f

# =============================================================================
# DATABASE OPERATIONS
# =============================================================================

.PHONY: migrate
migrate: ## Run Django migrations
	@echo "$(BLUE)🗄️  Running migrations...$(NC)"
	$(MANAGE_PY) migrate

.PHONY: makemigrations
makemigrations: ## Create Django migrations
	@echo "$(BLUE)📝 Creating migrations...$(NC)"
	$(MANAGE_PY) makemigrations

.PHONY: createsuperuser
createsuperuser: ## Create Django superuser
	@echo "$(BLUE)👤 Creating superuser...$(NC)"
	$(MANAGE_PY) createsuperuser

.PHONY: dbshell
dbshell: ## Access PostgreSQL shell
	$(DOCKER_COMPOSE) exec postgres psql -U postgres -d ielts_db

.PHONY: wait-for-db
wait-for-db: ## Wait for database to be ready
	@echo "$(BLUE)⏳ Waiting for database...$(NC)"
	@until $(DOCKER_COMPOSE) exec postgres pg_isready -U postgres; do sleep 1; done
	@echo "$(GREEN)✅ Database ready!$(NC)"

# =============================================================================
# SHELL ACCESS
# =============================================================================

.PHONY: shell
shell: ## Access Django shell
	$(MANAGE_PY) shell

.PHONY: exec-backend
exec-backend: ## Access backend container bash
	$(DOCKER_COMPOSE) exec backend bash

.PHONY: exec-frontend
exec-frontend: ## Access frontend container shell
	$(DOCKER_COMPOSE) exec frontend sh

.PHONY: exec-postgres
exec-postgres: ## Access postgres container bash
	$(DOCKER_COMPOSE) exec postgres bash

.PHONY: exec-redis
exec-redis: ## Access redis container
	$(DOCKER_COMPOSE) exec redis redis-cli

# =============================================================================
# LOGS
# =============================================================================

.PHONY: logs-backend
logs-backend: ## Show backend logs
	$(DOCKER_COMPOSE) logs --tail=100 -f backend

.PHONY: logs-frontend
logs-frontend: ## Show frontend logs
	$(DOCKER_COMPOSE) logs --tail=100 -f frontend

.PHONY: logs-worker
logs-worker: ## Show celery worker logs
	$(DOCKER_COMPOSE) logs --tail=100 -f celery-worker

.PHONY: logs-postgres
logs-postgres: ## Show postgres logs
	$(DOCKER_COMPOSE) logs --tail=100 -f postgres

.PHONY: logs-redis
logs-redis: ## Show redis logs
	$(DOCKER_COMPOSE) logs --tail=100 -f redis

# =============================================================================
# TESTING
# =============================================================================

.PHONY: test
test: ## Run backend tests
	@echo "$(BLUE)🧪 Running tests...$(NC)"
	$(MANAGE_PY) test

.PHONY: test-coverage
test-coverage: ## Run tests with coverage
	$(DOCKER_COMPOSE) exec backend coverage run --source='.' manage.py test
	$(DOCKER_COMPOSE) exec backend coverage report

.PHONY: lint
lint: ## Run linting
	$(DOCKER_COMPOSE) exec backend flake8 .
	$(DOCKER_COMPOSE) exec frontend npm run lint

# =============================================================================
# DEVELOPMENT TOOLS
# =============================================================================

.PHONY: collectstatic
collectstatic: ## Collect static files
	$(MANAGE_PY) collectstatic --noinput

.PHONY: install-deps-backend
install-deps-backend: ## Install backend dependencies
	$(DOCKER_COMPOSE) exec backend pip install -r requirements.txt

.PHONY: install-deps-frontend
install-deps-frontend: ## Install frontend dependencies
	$(DOCKER_COMPOSE) exec frontend npm install

.PHONY: check-swagger
check-swagger: ## Check Swagger API documentation
	@echo "$(BLUE)🔍 Checking Swagger schema endpoint...$(NC)"
	@$(DOCKER_COMPOSE) exec $(DJANGO_BACKEND_CONTAINER) python -c "import requests; r = requests.get('http://127.0.0.1:8000/api/swagger/?format=openapi'); print(f'Status: {r.status_code}'); exit(0 if r.status_code == 200 else 1)" || (echo "$(RED)❌ Swagger schema endpoint failed!$(NC)" && exit 1)
	@echo "$(GREEN)✅ Swagger schema is working.$(NC)"

# =============================================================================
# CLEANING
# =============================================================================

.PHONY: clean
clean: clean-docker clean-pyc ## Remove all artifacts
	@echo "$(GREEN)✅ Cleanup complete!$(NC)"

.PHONY: clean-docker
clean-docker: ## Clean Docker artifacts
	@echo "$(YELLOW)🧹 Cleaning Docker...$(NC)"
	docker system prune -f

.PHONY: clean-pyc
clean-pyc: ## Remove Python cache files
	find . -name '*.pyc' -exec rm -f {} +
	find . -name '*.pyo' -exec rm -f {} +
	find . -name '*~' -exec rm -f {} +
	find . -name '__pycache__' -exec rm -fr {} +

.PHONY: clean-frontend
clean-frontend: ## Remove frontend artifacts
	rm -fr frontend/.next/
	rm -fr frontend/node_modules/

.PHONY: reset-db
reset-db: ## Reset database (WARNING: destroys all data)
	@echo "$(RED)⚠️  This will destroy all database data!$(NC)"
	@read -p "Are you sure? [y/N]: " confirm && [ "$$confirm" = "y" ]
	$(DOCKER_COMPOSE) down -v
	docker volume rm $$(docker volume ls -q | grep postgres) || true
	$(DOCKER_COMPOSE) up -d postgres
	$(MAKE) wait-for-db migrate

# =============================================================================
# QUICK ACCESS URLs
# =============================================================================

.PHONY: open
open: ## Open all services in browser
	@echo "$(BLUE)🌐 Opening services...$(NC)"
	@open http://localhost:8000 || true  # Backend
	@open http://localhost:3000 || true  # Frontend
	@open http://localhost:5050 || true  # pgAdmin
	@open http://localhost:5555 || true  # Flower

.PHONY: urls
urls: ## Show all service URLs
	@echo "$(BLUE)🌐 Service URLs:$(NC)"
	@echo "  $(GREEN)Backend API:$(NC)     http://localhost:8000"
	@echo "  $(GREEN)Frontend:$(NC)        http://localhost:3000"
	@echo "  $(GREEN)pgAdmin:$(NC)         http://localhost:5050 (admin@example.com / admin123)"
	@echo "  $(GREEN)Flower (Celery):$(NC) http://localhost:5555"
	@echo "  $(GREEN)Swagger API Docs:$(NC) http://localhost:8000/api/swagger/"

# =============================================================================
# DEVELOPMENT WORKFLOW
# =============================================================================

.PHONY: dev
dev: up logs ## Start development environment and show logs

.PHONY: fresh-start
fresh-start: clean-docker build up wait-for-db migrate ## Fresh start (clean + build + migrate)

.PHONY: quick-restart
quick-restart: down up ## Quick restart without rebuilding

# =============================================================================
# STATUS & MONITORING
# =============================================================================

.PHONY: status
status: ## Show status of all services
	@echo "$(BLUE)📊 Service Status:$(NC)"
	@$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "$(BLUE)💾 Database Status:$(NC)"
	@$(DOCKER_COMPOSE) exec postgres pg_isready -U postgres || echo "$(RED)Database not ready$(NC)"
	@echo ""
	@echo "$(BLUE)🔄 Redis Status:$(NC)"
	@$(DOCKER_COMPOSE) exec redis redis-cli ping || echo "$(RED)Redis not ready$(NC)"

.PHONY: health
health: ## Check health of all services
	@echo "$(BLUE)🏥 Health Check:$(NC)"
	@curl -s http://localhost:8000/health/ || echo "$(RED)Backend unhealthy$(NC)"
	@curl -s http://localhost:3000/ || echo "$(RED)Frontend unhealthy$(NC)"

# Default target
.DEFAULT_GOAL := help