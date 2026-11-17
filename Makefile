.PHONY: help install lint format format-check test check db-upgrade db-current db-history up-db down ps logs-db

BACKEND_DIR := backend
POETRY = poetry run
COMPOSE = docker compose

help:
	@echo "Comandos disponiveis:"
	@echo "  make install       - Instala dependencias do backend"
	@echo "  make lint          - Verifica o codigo com Ruff"
	@echo "  make format        - Formata o codigo com Ruff"
	@echo "  make format-check  - Verifica a formatacao"
	@echo "  make test          - Executa os testes Pytest"
	@echo "  make check         - Executa lint, format-check e test"
	@echo "  make db-upgrade    - Aplica as migrations"
	@echo "  make db-current    - Mostra a migration atual"
	@echo "  make db-history    - Mostra o historico de migrations"
	@echo "  make up-db         - Inicia o PostgreSQL"
	@echo "  make down          - Encerra os servicos Docker"
	@echo "  make ps            - Lista os containers"
	@echo "  make logs-db       - Mostra os logs do PostgreSQL"

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
