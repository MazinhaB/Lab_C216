.PHONY: help install lint format format-check test check \
        db-upgrade db-current db-history up-db down ps logs-db \
        frontend-install frontend-dev frontend-lint frontend-format \
        frontend-test frontend-build frontend-check check-all

BACKEND_DIR := backend
FRONTEND_DIR := frontend
POETRY = poetry run
COMPOSE = docker compose

-include .env
export DATABASE_URL

help:
	@echo "===== BACKEND ====="
	@echo "  make install          - Instala dependencias do backend"
	@echo "  make lint             - Verifica o codigo com Ruff"
	@echo "  make format           - Formata o codigo com Ruff"
	@echo "  make format-check     - Verifica a formatacao do backend"
	@echo "  make test             - Executa os testes Pytest"
	@echo "  make check            - Executa todas as verificacoes do backend"
	@echo ""
	@echo "===== BANCO DE DADOS ====="
	@echo "  make up-db            - Inicia o PostgreSQL"
	@echo "  make down             - Encerra os servicos Docker"
	@echo "  make ps               - Mostra os containers"
	@echo "  make logs-db          - Mostra os logs do PostgreSQL"
	@echo "  make db-upgrade       - Aplica as migrations"
	@echo "  make db-current       - Mostra a migration atual"
	@echo "  make db-history       - Mostra o historico de migrations"
	@echo ""
	@echo "===== FRONTEND ====="
	@echo "  make frontend-install - Instala dependencias do frontend"
	@echo "  make frontend-dev     - Inicia o Vite"
	@echo "  make frontend-lint    - Verifica o codigo com Biome"
	@echo "  make frontend-format  - Formata o codigo com Biome"
	@echo "  make frontend-test    - Executa os testes Vitest"
	@echo "  make frontend-build   - Gera o build de producao"
	@echo "  make frontend-check   - Executa lint, testes e build"
	@echo ""
	@echo "===== PROJETO COMPLETO ====="
	@echo "  make check-all        - Verifica backend e frontend"

# BACKEND

install:
	cd $(BACKEND_DIR) && poetry install --no-root

lint:
	cd $(BACKEND_DIR) && $(POETRY) ruff check .

format:
	cd $(BACKEND_DIR) && $(POETRY) ruff check . --fix
	cd $(BACKEND_DIR) && $(POETRY) ruff format .

format-check:
	cd $(BACKEND_DIR) && $(POETRY) ruff format --check .

test:
	cd $(BACKEND_DIR) && $(POETRY) pytest -v

check: lint format-check test

# BD

db-upgrade:
	cd $(BACKEND_DIR) && $(POETRY) alembic upgrade head

db-current:
	cd $(BACKEND_DIR) && $(POETRY) alembic current

db-history:
	cd $(BACKEND_DIR) && $(POETRY) alembic history

up-db:
	$(COMPOSE) up -d db

down:
	$(COMPOSE) down

ps:
	$(COMPOSE) ps

logs-db:
	$(COMPOSE) logs -f db

# FRONTEND

frontend-install:
	cd $(FRONTEND_DIR) && npm install

frontend-dev:
	cd $(FRONTEND_DIR) && npm run dev

frontend-lint:
	cd $(FRONTEND_DIR) && npx biome check src tests vitest.config.js

frontend-format:
	cd $(FRONTEND_DIR) && npx biome check --write src tests vitest.config.js

frontend-test:
	cd $(FRONTEND_DIR) && npx vitest run

frontend-build:
	cd $(FRONTEND_DIR) && npm run build

frontend-check: frontend-lint frontend-test frontend-build

# Projeto completo

check-all: check frontend-check