from fastapi import FastAPI

from app.routes.campaign import router as campaign_router
from app.routes.health import router as health_router

app = FastAPI(
    title="Cthulhu - Gerenciador de Investigadores",
    description=(
        "API REST para gerenciamento de campanhas e fichas de investigadores de Call of Cthulhu."
    ),
    version="0.1.0",
)

app.include_router(health_router)
app.include_router(campaign_router)
