import pytest
from fastapi.testclient import TestClient

from app.main import app, validate_username


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def user():
    return {
        "name": "Mariana",
        "email": "mariana@email.com",
    }


def test_root_status_code(client):
    response = client.get("/")

    assert response.status_code == 200


def test_root_response(client):
    response = client.get("/")

    assert response.json() == {"message": "Código inicial funcionando!"}


def test_nonexistent_route(client):
    response = client.get("/login")

    assert response.status_code == 404


@pytest.mark.parametrize("method", ["post", "put", "delete"])
def test_root_invalid_methods(client, method):
    response = getattr(client, method)("/")

    assert (
        response.status_code != 200
    )  # Não deve ser OK porque esses métodos ainda não foram tratados


# Teste com exception
def test_username_empty():
    with pytest.raises(ValueError):
        validate_username("")


def test_username(user):
    username = validate_username(user["name"])

    assert username == "Mariana"
