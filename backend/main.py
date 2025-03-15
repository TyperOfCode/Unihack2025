from dotenv import load_dotenv
load_dotenv()

from typing import Optional
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
# from get_gifts import get_gifts
import json
from note_generation import note_to_voice

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

# @app.post("/get_gifts")
# async def get_gifts_route():
#     return await get_gifts()

# Create API endpoints
@app.post("/text-to-speech")
async def create_audio():
    return note_to_voice("Convert text to speech and return streaming audio")

@app.get("/test-audio")
async def test_audio():
    """Test endpoint with a sample text"""
    sample_text = "This is a test of the text to speech system. Happy birthday and enjoy your special gift!"
    return note_to_voice(sample_text)