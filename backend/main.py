from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from uuid import uuid4
import json
import traceback

from buildProfile import build_profile
from getProducts import get_listing, get_product, get_urls
from getRecommendations import get_recommendations
from models.profile import GiftUserProfile, LLMRequest, SearchQuery
from models.recommendations import Recommendation
from models.stateRequest import loadStateRequest, saveStateRequest

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",  # Next.js default port
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost",
    "*",  # Allow all origins (you may want to restrict this in production)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ping")
async def ping():
    return {"success": True}

@app.post("/buildProfile")
async def buildProfile(data: LLMRequest):
    try:
        result = build_profile(data.pastQuestions, data.pastAnswers, data.profile)
        return JSONResponse(content=json.loads(result))
    except Exception as e:
        print(f"Error in buildProfile: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/getRecommendations")
async def getRecommendations(data: GiftUserProfile):
    return get_recommendations(data)

@app.post("/getURLS")
async def getURLS(product: SearchQuery):
    return get_urls(product.query)

@app.post("/getProducts")
async def getProduct(data: Recommendation, profile: GiftUserProfile):
    return get_product(data.product, profile)

 

# Add a global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

@app.post("/saveState")
async def saveState(req: saveStateRequest):
    saveState(req)
    return JSONResponse(
        status_code=200,
    )

@app.post("/loadState")
async def loadState(req: loadStateRequest):
    return loadState(req.uuid)