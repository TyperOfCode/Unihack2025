from pydantic import BaseModel
from typing import List, Optional

class Preference(BaseModel):
    name: str
    description: str
    how_important: int # 1-100
    
class GiftUserProfile(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None
    location: Optional[str] = None
    relationship_to_recipient: Optional[str] = None
    likes: Optional[List[Preference]] = None
    dislikes: Optional[List[Preference]] = None
    budget: Optional[float] = None
    gift_giving_history: Optional[List[str]] = None
    upcoming_events: Optional[List[str]] = None
    wishlist: Optional[List[str]] = None
    gift_guesses: Optional[List[str]] = None
    completed_percentage: float = 0.0

class LLMRequest(BaseModel):
    pastQuestions: List[str]
    pastAnswers: List[str]
    model: str

class LLMResponse(BaseModel):
    profile=GiftUserProfile,
    newQuestion: str
