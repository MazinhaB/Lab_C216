# Cthulhu's Hub

**Gerenciador de campanhas e investigadores para Call of Cthulhu (7ª edição).**

Projeto final da disciplina **C216 — Sistemas Distribuídos (2026.2)**, desenvolvido como uma aplicação web full-stack com integração entre frontend React, API FastAPI e banco de dados PostgreSQL.

A aplicação permite organizar campanhas de RPG Call of Cthulhu e manter fichas de investigadores, incluindo atributos, condições, histórico e inventário. O objetivo é centralizar informações utilizadas durante as sessões, com persistência dos dados e operações acessíveis pelo navegador.

## Funcionalidades

### Campanhas

- Criar campanhas com nome e descrição.
- Listar campanhas cadastradas e consultar seus detalhes.
- Editar e excluir campanhas.
- Excluir os investigadores associados quando uma campanha é removida.

### Investigadores

- Cadastrar investigadores vinculados a uma campanha, com identificação e características.
- Gerar aleatoriamente os nove atributos básicos durante a criação.
- Calcular automaticamente pontos de vida, pontos de magia, sanidade, movimento, porte físico, bônus de dano e esquiva.
- Personalizar valores calculados para utilizar regras personalizadas.
- Consultar fichas organizadas em abas de atributos, história e personalidade, e inventário.
- Editar informações da ficha e salvar apenas os campos alterados por meio de requisições `PATCH`.
- Acompanhar condições como insanidade temporária, insanidade indefinida, ferimento grave, inconsciência e estado de morte iminente, destacando condições ativas nos cards.
- Excluir investigadores individualmente.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | JavaScript, React, Vite, CSS |
| Backend | Python 3.14, FastAPI, Pydantic, Uvicorn |
| Persistência | PostgreSQL 16, SQLAlchemy, Alembic, Psycopg |
| Dependências e automação | Poetry, npm, GNU Make |
| Qualidade | Ruff, Biome, Pytest, Vitest, Testing Library, Playwright |
| Infraestrutura e CI | Docker, Docker Compose, GitHub Actions |

## Arquitetura

```text
Navegador (http://localhost:5173)
             |
             v
       React + Vite
             |
             | HTTP / JSON
             v
     FastAPI (porta 8000)
             |
       SQLAlchemy / Psycopg
             |
             v
       PostgreSQL 16
```

O backend organiza suas responsabilidades em **rotas, schemas, serviços, repositórios e modelos**, além de centralizar regras de negócio. As migrações de banco são versionadas com Alembic.

No Docker Compose, os serviços são identificados como `frontend`, `backend` e `db`. O backend acessa o PostgreSQL pelo hostname interno `db:5432`; o navegador consome a API em `localhost:8000`.

### Estrutura principal

```text
.
├── .github/workflows/       # CI do backend e frontend
├── backend/
│   ├── alembic/            # Migrações versionadas
│   ├── app/
│   │   ├── core/           # Regras de negócio
│   │   ├── database/       # Conexão e sessões
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── repositories/   # Acesso aos dados
│   │   ├── routes/         # Endpoints REST
│   │   ├── schemas/        # Validação Pydantic
│   │   └── services/       # Lógica da aplicação
│   ├── tests/              # Testes Pytest
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   │   ├── e2e/            # Testes Playwright
│   │   ├── integration/    # Testes Vitest
│   │   └── unit/           # Testes Vitest
│   ├── Dockerfile
│   ├── package.json
│   └── playwright.config.js
├── .env.example
├── compose.yaml
├── Makefile
└── README.md
```

## Pré-requisitos

Para a execução da aplicação é necessário ter instalado:

- Git;
- Docker com suporte ao Docker Compose.

Para executar verificações diretamente na máquina, sem depender dos contêineres para Python e Node, também são necessários **Python 3.14**, **Poetry 2.4.1**, **Node.js 24**, **npm** e **GNU Make**.

As portas locais **5173**, **8000** e **5433** devem estar disponíveis. Para utilizar os comandos `make`, o GNU Make também deve estar instalado.

## Execução com Docker Compose

Na raiz do repositório, na branch `projeto-final`:

```bash
git clone -b projeto-final https://github.com/MazinhaB/Lab_C216.git
cd Lab_C216
cp .env.example .env
make up
```

O Compose constrói as imagens, inicia PostgreSQL, FastAPI e frontend, aguarda os healthchecks e executa as migrações pendentes do Alembic antes de iniciar a API.

### Endereços

| Serviço | URL |
| --- | --- |
| Aplicação web | http://localhost:5173 |
| Documentação interativa da API (Swagger) | http://localhost:8000/docs |
| Healthcheck da API | http://localhost:8000/health |
| PostgreSQL (acesso a partir da máquina) | `localhost:5433` |

### Comandos úteis

Execute a partir da raiz do repositório:

```bash
make up             # Constrói, inicia e aguarda os healthchecks dos três serviços
make ps             # Exibe o estado dos contêineres
make logs           # Acompanha logs de todos os serviços
make logs-db        # Acompanha somente os logs do banco
make down           # Para e remove os contêineres, preservando os dados
```

Para iniciar apenas o PostgreSQL:

```bash
make up-db
```

O banco usa um **volume nomeado** (`postgres_data`), portanto os dados persistem após reiniciar os contêineres ou executar `make down`.

**Atenção:** `docker compose down -v` remove o volume e pode apagar todos os dados cadastrados.

## Variáveis de ambiente

Copie `.env.example` para `.env` na raiz. As opções disponíveis nesse arquivo são:

| Variável | Finalidade | Valor de exemplo |
| --- | --- | --- |
| `POSTGRES_USER` | Usuário do PostgreSQL | `cthulhu` |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL | `cthulhu_dev` |
| `POSTGRES_DB` | Nome do banco | `cthulhu` |
| `POSTGRES_PORT` | Porta do banco exposta na máquina | `5433` |

O Compose define internamente a `DATABASE_URL` do backend com o hostname `db` e a porta `5432`. Para comandos locais do Makefile, a URL é montada automaticamente com as variáveis do `.env`, usando `localhost` e a porta `POSTGRES_PORT`.

No frontend, `VITE_API_URL` é opcional: se não for definida, a aplicação utiliza `http://localhost:8000`.

## Migrações do banco de dados

Ao subir o backend pelo Compose, as migrações são aplicadas automaticamente por `alembic upgrade head`.

Para executar ou inspecionar as migrações a partir da máquina, com Poetry instalado e o banco ativo:

```bash
make db-upgrade     # Aplica migrações pendentes
make db-current     # Exibe a revisão aplicada
make db-history     # Exibe o histórico de revisões
```

## API REST

Os principais endpoints são:

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Verifica o status da API |
| `GET`, `POST` | `/campaigns/` | Lista ou cria campanhas |
| `GET`, `PUT`, `PATCH`, `DELETE` | `/campaigns/{campaign_id}` | Consulta, atualiza ou exclui uma campanha |
| `GET`, `POST` | `/campaigns/{campaign_id}/investigators` | Lista ou cria investigadores de uma campanha |
| `GET`, `PUT`, `PATCH`, `DELETE` | `/campaigns/{campaign_id}/investigators/{investigator_id}` | Consulta, atualiza ou exclui um investigador |

As requisições e respostas utilizam JSON. A API valida os dados com Pydantic e utiliza códigos HTTP apropriados, incluindo `201` para criação, `204` para exclusão e `404` para recursos inexistentes.

A especificação completa pode ser consultada em **http://localhost:8000/docs**.

## Testes e qualidade

O projeto possui três níveis de testes automatizados:

- **Pytest (backend):** 108 testes unitários e de integração, cobrindo regras, validações, serviços e endpoints.
- **Vitest + Testing Library (frontend):** 27 testes de componentes, formulários e fluxos de campanhas e investigadores.
- **Playwright (E2E):** 2 testes de CRUD real, um para campanhas e outro para investigadores, utilizando frontend, API e PostgreSQL. Eles criam e removem seus próprios dados temporários.

### Verificações separadas

Com as dependências locais instaladas:

```bash
make install            # Instala as dependências Python via Poetry
make frontend-install   # Instala as dependências Node
make check              # Ruff + Pytest (backend)
make frontend-check     # Biome + Vitest + build (frontend)
make frontend-e2e       # Playwright; requer aplicação em execução
```

Antes do Playwright, pode ser necessário instalar o navegador na máquina:

```bash
cd frontend
npx playwright install chromium
cd ..
```

### Validação completa

`check-all` **inclui os testes E2E.** Para executar esse comando, é necessário iniciar a aplicação Docker:

```bash
make up
make check-all
```

O comando reúne lint, formatação, testes do backend, testes do frontend, build e os dois cenários Playwright. Os testes foram projetados para utilizar dados temporários, sem depender de campanhas preexistentes.

## Integração contínua

A pasta `.github/workflows/` contém dois workflows do GitHub Actions:

- **CI - Backend:** inicia um serviço PostgreSQL, aplica migrações e executa Ruff e Pytest.
- **CI - Frontend:** instala dependências, executa Biome, Vitest e build; sobe a aplicação pelo Docker Compose e executa os testes E2E com Playwright.

Os workflows são acionados por alterações relevantes na branch `projeto-final` e em Pull Requests direcionados à `main`.

## Vídeo demonstrativo

**Link do vídeo:** ... .

O vídeo apresenta a proposta e a arquitetura do Cthulhu's Hub, a inicialização com Docker Compose, o CRUD de campanhas e investigadores, a persistência dos dados e os testes automatizados.
