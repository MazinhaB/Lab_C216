from fastapi import APIRouter

router = APIRouter(tags=["Saúde da aplicação"])


@router.get("/health")
def verificar_saude():
    return {"status": "ok"}
