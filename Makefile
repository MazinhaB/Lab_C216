hello:
	echo "Ola, Sistemas Distribuidos!!"

.PHONY: build clean down format help install lint logs logs-api ps shell run temp-clean test up up-build
BACKEND_DIR := backend
COMPOSE := docker compose
POETRY := poetry -C $(BACKEND_DIR)
PYTEST := $(POETRY) run pytest
UVICORN := $(POETRY) run uvicorn
RUFF := $(POETRY) run ruff

build:
	$(COMPOSE) build

clean:
	$(COMPOSE) down -v

down:
	$(COMPOSE) down

format:
	$(RUFF) format .

help:
	@echo "Comandos disponiveis:"
	@echo "  make build			- constroi as imagens"
	@echo "  make clean			- remove containers, rede e volumes do Compose"
	@echo "  make down			- para e remove os containers"
	@echo "  make format		- formata o codigo"
	@echo "  make install		- instala dependencias"
	@echo "  make lint			- verifica o codigo"
	@echo "  make logs			- acompanha os logs"
	@echo "  make logs-api		- acompanha apenas os logs da API"
	@echo "  make ps			- mostra o status dos servicos"
	@echo "  make shell			- abre um shell no container da API"
	@echo "  make run			- inicia o servidor"
	@echo "  make temp-clean	- remove arquivos temporarios"
	@echo "  make test			- executa testes"
	@echo "  make up			- sobe os containers"
	@echo "  make up-build		- reconstroi a imagem e sobe os containers"

install:
	$(POETRY) install

lint:
	$(RUFF) check .

logs:
	$(COMPOSE) logs -f

logs-api:
	$(COMPOSE) logs -f api

ps:
	$(COMPOSE) ps

shell:
	$(COMPOSE) exec api sh

run:
	$(UVICORN) app.main:app --reload

temp-clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +

test:
	$(PYTEST)

up:
	$(COMPOSE) up -d

up-build:
	$(COMPOSE) up -d --build