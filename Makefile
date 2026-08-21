hello:
	echo "Ola, Sistemas Distribuidos!!"

.PHONY: clean format help install lint run test

POETRY := poetry run
PYTEST := $(POETRY) pytest
UVICORN := $(POETRY) uvicorn
RUFF := $(POETRY) ruff

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +

format:
	$(RUFF) format .

help:
	@echo "Comandos disponiveis:"
	@echo "  make clean    - remove arquivos temporarios"
	@echo "  make format   - formata o codigo"
	@echo "  make install  - instala dependencias"
	@echo "  make lint     - verifica o codigo"
	@echo "  make run      - inicia o servidor"
	@echo "  make test     - executa testes"

install:
	poetry install

lint:
	$(RUFF) check .

run:
	$(UVICORN) app.main:app --reload

test:
	$(PYTEST)
