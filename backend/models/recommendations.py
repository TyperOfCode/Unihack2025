from pydantic import BaseModel
from typing import List, Optional

class Recommendation(BaseModel):
    product: str
    reason: str
    price: float

class Recommendations(BaseModel):
    recommendations: List[Recommendation]