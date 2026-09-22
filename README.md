# Sistemas Distribuídos

Repositório destinado às atividades práticas do lab da disciplina de **Sistemas Distribuídos (C216)**.

O projeto é desenvolvido de forma contínua ao longo das aulas da disciplina, utilizando Git/GitHub para versionamento e diferentes tecnologias para construção, execução e validação do backend.

## Estrutura do projeto

```text
sistemas-distribuidos/
├── backend/
│   ├── app/
│   │   └── main.py
│   ├── tests/
│   │   └── test_main.py
│   ├── data/
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
- Ruff
- Docker
- Docker Compose
- GitHub Actions

## Backend

O backend é desenvolvido em Python utilizando FastAPI.

Atualmente, a aplicação possui um endpoint principal e uma função de validação de nome de usuário, além de testes automatizados para verificar seu comportamento.

### Executando o backend

As dependências do projeto são gerenciadas utilizando Poetry.

A partir da raiz do projeto, o backend pode ser executado com:

```bash
make run
```

A aplicação estará disponível em:

```text
http://localhost:8000
```

## Testes

Os testes automatizados são desenvolvidos utilizando Pytest.

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