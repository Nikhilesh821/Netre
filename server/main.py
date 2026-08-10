import logging
from contextlib import asynccontextmanager
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import init_db
from routers import cameras, events, recordings, streams
from services.ai_worker import ai_background_task, recording_background_task

log = logging.getLogger("netre.server")


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Starting Netre VMS...")
    init_db()
    ai_task = asyncio.create_task(ai_background_task())
    rec_task = asyncio.create_task(recording_background_task())
    yield
    ai_task.cancel()
    rec_task.cancel()


app = FastAPI(title="Netre VMS API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cameras.router, prefix="/api/v1")
app.include_router(events.router, prefix="/api/v1")
app.include_router(recordings.router, prefix="/api/v1")
app.include_router(streams.router, prefix="/api/v1")


@app.get("/")
def read_root():
    return {"status": "ok", "service": "Netre VMS"}
