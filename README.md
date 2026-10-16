# Sistemas Distribuídos

Repositório destinado às atividades práticas do lab da disciplina de **Sistemas Distribuídos (C216)**.

O projeto é desenvolvido de forma contínua ao longo das aulas da disciplina, utilizando Git/GitHub para versionamento e diferentes tecnologias para construção, execução e validação do backend.

## Estrutura do projeto

```text
sistemas-distribuidos/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       └── characters.py
│   │   ├── core/
│   │   │   └── config.py
│   │   ├── database/
│   │   │   ├── base.py
│   │   │   └── session.py
│   │   ├── models/
│   │   │   └── character_model.py
│   │   ├── repositories/
│   │   │   └── character_repository.py
│   │   ├── schemas/
│   │   │   └── character_schema.py
│   │   ├── services/
│   │   │   └── character_service.py
│   │   └── main.py
│   ├── alembic/
│   │   ├── versions/
│   │   │   └── cf9044a96366_create_characters_table.py
│   │   └── env.py
│   ├── tests/
│   │   ├── integration/
│   │   │   └── test_characters.py
│   │   └── unit/
│   │       └── test_character_service.py
│   ├── alembic.ini
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── poetry.lock
├── .github/
│   └── workflows/
│       └── ci-backend.yml
├── compose.yaml
├── Makefile
└── README.md
```

## Tecnologias

- Python
- FastAPI
- Poetry
- Pytest
- Pydantic
- SQLAlchemy
- PostgreSQL
- Alembic
- Ruff
- Docker
- Docker Compose
- GitHub Actions

## Backend

O backend é desenvolvido em Python utilizando FastAPI e disponibiliza uma API REST para gerenciamento de personagens de um projeto relacionado a RPG.

Os dados são armazenados em um banco de dados PostgreSQL, executado por meio do Docker Compose.

### Endpoints

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/characters/` | Lista todos os personagens |
| GET | `/characters/{character_id}` | Consulta um personagem pelo ID |
| POST | `/characters/` | Cria um novo personagem |
| PUT | `/characters/{character_id}` | Atualiza um personagem |
| PATCH | `/characters/{character_id}` | Atualiza parcialmente um personagem |
| DELETE | `/characters/{character_id}` | Exclui um personagem |

Os endpoints utilizam Path Parameters, como `character_id`, para identificar os personagens.

Os dados recebidos pela API são validados utilizando modelos Pydantic.

### Estrutura do backend

A aplicação utiliza uma separação de responsabilidades entre as principais partes do backend:

- **Routes:** responsáveis pelos endpoints e pela comunicação HTTP;
- **Schemas:** responsáveis pela definição e validação dos dados utilizando Pydantic;
- **Services:** responsáveis pelas regras e operações relacionadas aos personagens;
- **Models:** representam as entidades ORM mapeadas para as tabelas do banco de dados.
- **Database:** centraliza a configuração da conexão e das sessões do SQLAlchemy.
- **Core:** reúne configurações da aplicação, incluindo variáveis de ambiente.
- **Alembic:** gerencia as migrações e o versionamento do esquema do banco de dados.
- **Main:** responsável pela inicialização da aplicação e inclusão dos routers.

O fluxo principal segue a sequência:

`API → Service → Repository → SQLAlchemy → PostgreSQL`

Essa separação reduz o acoplamento entre as camadas e facilita a manutenção e os testes.

## Banco de dados e migrações

O PostgreSQL é executado em um container Docker. As configurações de conexão são fornecidas por variáveis de ambiente, evitando deixar os parâmetros de conexão fixos no código.

A variável `DATABASE_URL` define a URL de conexão utilizada pela aplicação.

O SQLAlchemy é responsável pelo mapeamento objeto-relacional e pela interação com o banco de dados. O Alembic é utilizado para versionar as alterações no esquema.

### Comandos de migração

Consultar a versão atual da migração:

```bash
make db-current
```

Aplicar as migrações pendentes:

```bash
make db-upgrade
```

Gerar uma nova migração automaticamente a partir das diferenças entre os modelos e o esquema do banco:

```bash
make db-migration msg="descricao_da_migracao"
```

Após alterar os modelos ORM, gere e revise a migração antes de aplicá-la. O arquivo gerado deve ser verificado antes de ser commitado.

### Executando o backend

As dependências do projeto são gerenciadas utilizando Poetry. Além disso, é necessário ter Docker, Docker Compose e Make disponíveis no ambiente de execução.

### Iniciar a aplicação

Na raiz do repositório, execute:

```bash
make up-build
```

Esse comando constrói a imagem da API e inicia os serviços definidos no Docker Compose, incluindo o PostgreSQL.

Para iniciar os containers sem reconstruir a imagem:

```bash
make up
```

A API estará disponível em:

- **API:** http://localhost:8000
- **Documentação interativa:** http://localhost:8000/docs
- **Documentação alternativa:** http://localhost:8000/redoc

A documentação interativa permite consultar os endpoints e executar requisições para testar as operações CRUD.

## Testes

Os testes automatizados são desenvolvidos utilizando Pytest.

Os testes são separados em:

- **Testes unitários:** verificam funções e regras do service de personagens de forma isolada, utilizando mocks para simular o repositório;
- **Testes de integração:** verificam os endpoints da API com um banco de teste isolado.

Para executar os testes localmente:

```bash
make test
```

Também é possível executar o lint:

```bash
make lint
```

E formatar o código utilizando Ruff:

```bash
make format
```

## Docker

O projeto possui configuração para execução utilizando Docker e Docker Compose.

Para construir a imagem:

```bash
make build
```

Para iniciar os containers:

```bash
make up
```

Para iniciar os containers reconstruindo a imagem:

```bash
make up-build
```

Para visualizar o status dos serviços:

```bash
make ps
```

Para acompanhar os logs:

```bash
make logs
```

Para parar os containers:

```bash
make down
```

Para remover os containers, rede e volumes:

```bash
make clean
```

## Integração Contínua

O projeto utiliza **GitHub Actions** para automatizar a validação do backend.

O workflow está localizado em:

```text
.github/workflows/ci-backend.yml
```

A cada `push` ou `pull_request` relacionado ao backend ou ao workflow, são executadas verificações de:

- Formatação do código com Ruff;
- Lint com Ruff;
- Testes automatizados com Pytest.

Dessa forma, as alterações são verificadas automaticamente antes de serem integradas à branch de desenvolvimento.

## Comandos disponíveis

Os comandos do projeto citados anteriormente podem ser consultados executando:

```bash
make help
```

| Comando | Descrição |
|---|---|
| `make build` | Constrói as imagens Docker |
| `make clean` | Remove containers, rede e volumes |
| `make db-current` | Consulta a versão atual da migração |
| `make db-migration` | Gera uma nova migração do Alembic |
| `make db-upgrade` | Aplica as migrações pendentes |
| `make down` | Para e remove os containers |
| `make format` | Formata o código com Ruff |
| `make install` | Instala as dependências |
| `make lint` | Verifica o código com Ruff |
| `make logs` | Exibe os logs dos serviços |
| `make logs-api` | Exibe os logs da API |
| `make ps` | Mostra o status dos serviços |
| `make run` | Inicia o servidor FastAPI |
| `make test` | Executa os testes |
| `make up` | Inicia os containers |
| `make up-build` | Reconstrói a imagem e inicia os containers |

## Desenvolvimento

O desenvolvimento é organizado utilizando branches e pull requests no GitHub.

As implementações das práticas são desenvolvidas em branches próprias e posteriormente integradas à branch `aulas` por meio de pull requests.

Cada prática adiciona novas funcionalidades e/ou ferramentas ao projeto, mantendo o desenvolvimento incremental ao longo da disciplina.