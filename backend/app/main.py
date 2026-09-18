from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Código inicial funcionando!"}

def validate_username(username):
    if not username:
        raise ValueError("nome de usuário não pode ser vazio")

    return username