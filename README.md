# Sistemas Distribuídos

Repositório destinado às atividades práticas do lab da disciplina de **Sistemas Distribuídos (C216)**.

O projeto é desenvolvido de forma contínua ao longo das aulas da disciplina, utilizando Git/GitHub para versionamento e diferentes tecnologias para construção, execução e validação de aplicações.

Atualmente, o projeto contempla um backend com API REST para gerenciamento de personagens de RPG e um frontend independente, desenvolvido para permitir o cadastro, edição, remoção e a visualização desses personagens.

## Estrutura do projeto

```text
sistemas-distribuidos/
├── .github/
│   └── workflows/
│       └── ci-backend.yml
        └── ci-frontend.yml
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
│   │   └── env.py
│   ├── tests/
│   │   ├── integration/
│   │   └── unit/
│   ├── alembic.ini
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── poetry.lock
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CharacterForm.jsx
│   │   │   └── CharacterList.jsx
│   │   │   └── CharacterDetails.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── validation.js
│   ├── tests/
│   │   ├── e2e/
│   │   ├── integration/
│   │   ├── unit/
│   │   └── setup.js
│   ├── biome.json
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── playwright.config.js
│   └── vite.config.js
├── compose.yaml
├── Makefile
└── README.md
```

## Tecnologias

- GitHub Actions

### Backend
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

### Frontend
- JavaScript
- React
- Vite
- Tailwind CSS
- Vitest
- Testing Library
- Playwright
- Biome

## Backend

O backend é desenvolvido em Python utilizando FastAPI e disponibiliza uma API REST para gerenciamento de personagens de RPG.

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

### Validações

As informações dos personagens possuem regras de validação, incluindo:

- Nome, classe e raça obrigatórios.
- Campos textuais limitados a 100 caracteres.
- Remoção de espaços desnecessários no início e no final dos textos.
- Nível representado por um número inteiro entre 1 e 20.

As validações são realizadas nas camadas de entrada e de serviço, com restrições adicionais no banco de dados para garantir a integridade dos dados.

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

## Frontend

O frontend é desenvolvido utilizando React e Vite, com estilização por meio do Tailwind CSS.

A aplicação apresenta uma interface para gerenciamento de personagens de RPG, permitindo cadastrar novos personagens e visualizar os registros existentes.

### Funcionalidades

- Cadastro de personagens.
- Edição de personagens cadastrados.
- Remoção de personagens cadastrados.
- Exibição dos personagens cadastrados.
- Visualização do nome, classe, raça e nível de cada personagem.
- Validação dos campos obrigatórios.
- Validação dos limites de caracteres.
- Validação do nível, que deve ser um número inteiro entre 1 e 20.
- Limpeza do formulário após um cadastro bem-sucedido.
- Exibição de mensagens de validação e estado vazio da listagem.

### Organização do frontend

- **App:** componente principal da aplicação, responsável pelo gerenciamento do estado dos personagens.
- **Components:** reúne os componentes reutilizáveis:
  - **CharacterForm:** formulário para cadastro e edição de personagens.
  - **CharacterList:** exibição dos personagens cadastrados.
  - **CharacterDetails:** modal com informações detalhadas e opções de edição e remoção.
- **Validation:** centraliza as regras de validação dos dados.
- **Tests:** organiza os testes unitários, de integração e de ponta a ponta.

### Executando o frontend

Para instalar as dependências:
```bash
make frontend-install
```
Para iniciar o servidor de desenvolvimento:

```bash
make frontend-dev
```

A aplicação estará disponível em: http://localhost:5173

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
## Testes

O projeto possui testes automatizados tanto para o backend quanto para o frontend.

### Testes do backend

Os testes são desenvolvidos utilizando Pytest e estão divididos em:

- **Testes unitários:** verificam funções e regras do service de personagens de forma isolada, utilizando mocks para simular o repositório.
- **Testes de integração:** verificam os endpoints da API e o comportamento da aplicação com um banco de teste isolado.

Comandos:

```bash
make backend-test
```

Para verificar o lint e a formatação:

```bash
make backend-check
```

### Testes do frontend

Os testes do frontend utilizam Vitest, Testing Library e Playwright.

Estão organizados em três categorias:

- **Testes unitários:** verificam as regras de validação e o comportamento individual dos componentes.
- **Testes de integração:** verificam a interação entre os componentes e o fluxo de cadastro na aplicação.
- **Testes E2E (End-to-End):** simulam a utilização da aplicação no navegador, verificando os principais fluxos do usuário.

Comandos:

```bash
make frontend-test
```

Executar os testes E2E:

```bash
make frontend-test-e2e
```

Verificar lint e formatação:

```bash
make frontend-check
```

Construir o frontend para produção:

```bash
make frontend-build
```

## Docker

O projeto possui configuração para execução utilizando Docker e Docker Compose.

## Integração Contínua

O projeto utiliza GitHub Actions para automatizar a validação do backend e do frontend por meio de workflows independentes.

O workflow está localizado em:

```text
.github/
└── workflows/
    ├── ci-backend.yml
    └── ci-frontend.yml
```

### CI do backend

O workflow `ci-backend.yml` automatiza as verificações relacionadas ao backend, incluindo:

- Formatação do código com Ruff.
- Lint com Ruff.
- Testes automatizados com Pytest.

### CI do frontend

O workflow `ci-frontend.yml` automatiza as verificações relacionadas ao frontend, permitindo validar sua implementação de forma independente do backend.
A execução é acionada em duas situações:

- **Pull Request:** quando há alterações nos arquivos dentro de `frontend/` ou no próprio workflow.
- **Push:** quando há alterações nesses mesmos caminhos na branch `main`.

O workflow é dividido em dois jobs:

- **Linter (`lint`):** instala as dependências e executa a análise estática do código utilizando Biome.
- **Testes e validação (`tests`):** executa a verificação de formatação, os testes unitários e de integração com Vitest, a construção do projeto para produção e os testes E2E com Playwright.

O job `tests` depende da conclusão bem-sucedida do job `lint`, por meio da propriedade `needs: lint`. Dessa forma, os testes e as demais verificações só são executados se o código passar pelo linter.

## Comandos disponíveis

O projeto utiliza um Makefile para centralizar e simplificar a execução de tarefas relacionadas à infraestrutura, ao banco de dados, ao backend e ao frontend.

Para consultar todos os comandos disponíveis:

```bash
make help
```

### Infraestrutura

| Comando | Descrição |
|---|---|
| `make build` | Constrói todas as imagens Docker |
| `make clean` | Remove containers, rede e volumes do Docker Compose |
| `make down` | Para e remove os containers |
| `make up` | Inicia os containers |
| `make up-build` | Reconstrói as imagens e inicia os containers |
| `make ps` | Mostra o status dos serviços |
| `make logs` | Acompanha os logs de todos os serviços |
| `make logs-api` | Acompanha apenas os logs da API |
| `make shell` | Abre um shell no container da API |

**Atenção:** o comando `make clean` também remove os volumes do Docker, podendo apagar os dados armazenados no PostgreSQL.

### Banco de dados

| Comando | Descrição |
|---|---|
| `make db-current` | Consulta a revisão atual do banco de dados |
| `make db-migration msg="descricao"` | Gera uma nova migração do Alembic |
| `make db-upgrade` | Aplica as migrações pendentes |

### Backend

| Comando | Descrição |
|---|---|
| `make backend-build` | Constrói a imagem da API |
| `make backend-check` | Verifica lint e formatação do código |
| `make backend-check-all` | Instala as dependências e executa todas as verificações do backend |
| `make backend-dev` | Inicia o servidor FastAPI em modo de desenvolvimento |
| `make backend-format` | Formata o código utilizando Ruff |
| `make backend-install` | Instala as dependências utilizando Poetry |
| `make backend-lint` | Executa a verificação estática do código com Ruff |
| `make backend-test` | Executa os testes automatizados com Pytest |

### Frontend

| Comando | Descrição |
|---|---|
| `make frontend-build` | Gera o build de produção |
| `make frontend-check` | Verifica o código utilizando Biome |
| `make frontend-check-all` | Instala as dependências e executa todas as verificações do frontend |
| `make frontend-dev` | Inicia o servidor de desenvolvimento Vite |
| `make frontend-format` | Formata o código utilizando Biome |
| `make frontend-install` | Instala as dependências com npm |
| `make frontend-lint` | Executa a verificação estática com Biome |
| `make frontend-test` | Executa os testes automatizados com Vitest |
| `make frontend-test-e2e` | Executa os testes End-to-End com Playwright |

### Validação completa

Para executar todas as verificações do backend:

```bash
make backend-check-all
```

Para executar todas as verificações do frontend:

```bash
make frontend-check-all
```

## Desenvolvimento

O desenvolvimento é organizado utilizando branches e pull requests no GitHub.

As implementações das práticas são desenvolvidas em branches próprias e posteriormente integradas à branch `aulas` por meio de pull requests.

Cada prática adiciona novas funcionalidades e/ou ferramentas ao projeto, mantendo o desenvolvimento incremental ao longo da disciplina.