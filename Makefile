.PHONY: help

.PHONY: build clean down up up-build ps logs logs-api shell

.PHONY: db-current db-migration db-upgrade

.PHONY: backend-check-all backend-install backend-dev backend-lint backend-format backend-check backend-test backend-build

.PHONY: frontend-check-all frontend-install frontend-dev frontend-lint frontend-format frontend-check frontend-test frontend-test-e2e frontend-build


BACKEND_DIR := backend
FRONTEND_DIR := frontend
COMPOSE := docker compose
POETRY := poetry -C $(BACKEND_DIR)
PYTEST := $(POETRY) run python -m pytest
UVICORN := $(POETRY) run uvicorn
RUFF := $(POETRY) run ruff
NPM := npm --prefix $(FRONTEND_DIR)

backend-build:
	$(COMPOSE) build api

backend-check:
	$(RUFF) check .
	$(RUFF) format --check .

backend-check-all:
	$(POETRY) install --no-root
	$(RUFF) check .
	$(RUFF) format --check .
	$(PYTEST)

backend-dev:
	$(UVICORN) app.main:app --reload

backend-format:
	$(RUFF) format .

backend-install:
	$(POETRY) install --no-root

backend-lint:
	$(RUFF) check .

backend-test:
	$(PYTEST)

build:
	$(COMPOSE) build

clean:
	$(COMPOSE) down -v

down:
	$(COMPOSE) down

db-current:
	$(COMPOSE) exec api poetry run alembic current

db-migration:
	$(COMPOSE) exec api poetry run alembic revision --autogenerate -m "$(msg)"

db-upgrade:
	$(COMPOSE) exec api poetry run alembic upgrade head

frontend-build:
	$(NPM) run build

frontend-check:
	$(NPM) run check

frontend-check-all:
	$(NPM) ci
	$(NPM) run lint
	$(NPM) run format:check
	$(NPM) run test
	$(NPM) run build
	$(NPM) run test:e2e

frontend-dev:
	$(NPM) run dev

frontend-format:
	$(NPM) run format

frontend-install:
	$(NPM) ci

frontend-lint:
	$(NPM) run lint

frontend-test:
	$(NPM) test

frontend-test-e2e:
	$(NPM) run test:e2e

help:
	@echo "Comandos disponiveis:"
	@echo ""
	@echo "Infraestrutura:"
	@echo "  make build		- constroi as imagens"
	@echo "  make clean		- remove containers, rede e volumes do Compose"
	@echo "  make down		- para e remove os containers"
	@echo "  make up		- sobe os containers"
	@echo "  make up-build	- reconstroi a imagem e sobe os containers"
	@echo "  make ps		- mostra o status dos servicos"
	@echo "  make logs		- acompanha os logs"
	@echo "  make logs-api	- acompanha apenas os logs da API"
	@echo "  make shell		- abre um shell no container da API"
	@echo ""
	@echo "Banco de dados:"
	@echo "  make db-current    - mostra a revisao atual do banco"
	@echo "  make db-migration  - cria uma nova migration (use msg='descricao')"
	@echo "  make db-upgrade    - aplica as migrations pendentes"
	@echo ""
	@echo "Backend:"
	@echo "  make backend-build     - constroi a API"
	@echo "  make backend-check     - verifica lint e formatacao"
	@echo "  make backend-format	- formata o codigo"
	@echo "  make backend-install	- instala dependencias"
	@echo "  make backend-lint		- verifica o codigo"
	@echo "  make backend-dev		- inicia o servidor"
	@echo "  make backend-test		- executa testes com Pytest"
	@echo "  make backend-check-all - executa todas as verificacoes do backend"
	@echo ""
	@echo "Frontend:"
	@echo "  make frontend-install  - instala dependencias"
	@echo "  make frontend-dev      - inicia o Vite"
	@echo "  make frontend-lint     - verifica com Biome"
	@echo "  make frontend-format   - formata com Biome"
	@echo "  make frontend-check    - verifica lint e formatacao"
	@echo "  make frontend-test     - executa testes com Vitest"
	@echo "  make frontend-test-e2e - executa testes com Playwright"
	@echo "  make frontend-build    - gera build de producao"
	@echo "  make frontend-check-all - executa todas as verificacoes do frontend"

logs:
	$(COMPOSE) logs -f

logs-api:
	$(COMPOSE) logs -f api

ps:
	$(COMPOSE) ps

shell:
	$(COMPOSE) exec api sh

up:
	$(COMPOSE) up -d

up-build:
	$(COMPOSE) up -d --build