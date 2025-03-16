from pydantic import BaseModel
from typing import List, Optional

class GiftUserProfile(BaseModel):
    interests: List[str]
    dislikes: List[str]
    about: str
    completed_percentage: float

class LLMRequest(BaseModel):
    pastQuestions: List[str]
    pastAnswers: List[str]
    profile: str

class LLMResponse(BaseModel):
    profile: GiftUserProfile
    newQuestion: str


class SearchQuery(BaseModel):
    query: str