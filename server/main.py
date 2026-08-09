import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.database import init_db
from routers import cameras, events, recordings, streams

log = logging.getLogger("open_nvr.server")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    log.info("Starting up Netre VMS server...")
    init_db()
    log.info("Database initialized.")
    yield
    # Shutdown
    log.info("Shutting down Netre VMS server...")

app = FastAPI(
    title="Netre VMS API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(cameras.router, prefix="/api/v1")
app.include_router(events.router, prefix="/api/v1")
app.include_router(recordings.router, prefix="/api/v1")
app.include_router(streams.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"status": "ok", "service": "Netre VMS"}
