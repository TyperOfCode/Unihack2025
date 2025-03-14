from dotenv import load_dotenv
load_dotenv()

from typing import Optional
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from get_gifts import get_gifts
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ping")
async def ping():
    return {"success": True}

@app.post("/get_gifts")
async def get_gifts_route():
    return await get_gifts()
