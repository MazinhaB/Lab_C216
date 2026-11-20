from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.engine import Connection
from sqlalchemy.orm import Session

from app.database.connection import engine, get_db
from app.main import app


@pytest.fixture
def conexao_teste() -> Generator[Connection]:
    with engine.connect() as connection:
        transaction = connection.begin()

        try:
            yield connection
        finally:
            transaction.rollback()


@pytest.fixture
def cliente(conexao_teste: Connection) -> Generator[TestClient]:
    def override_get_db():
        with Session(
            bind=conexao_teste,
            join_transaction_mode="create_savepoint",
        ) as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.pop(get_db, None)
