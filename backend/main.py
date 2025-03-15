from typing import Optional
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
import json

from buildProfile import build_profile
from getProducts import get_product
from getRecommendations import get_recommendations
from models.profile import GiftUserProfile, LLMRequest
from models.recommendations import Recommendation

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

@app.post("/buildProfile")
async def buildProfile(data: LLMRequest):
    return build_profile(data.pastQuestions, data.pastAnswers, data.model)

@app.post("/getRecommendations")
async def getRecommendations(data: GiftUserProfile):
    return get_recommendations(data)

@app.post("/getProduct")
async def getProduct(data: Recommendation):
    return get_product(data)