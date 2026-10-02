from fastapi import FastAPI

from app.api.routes.characters import router as characters_router

app = FastAPI()

app.include_router(characters_router)
