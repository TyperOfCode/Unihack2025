from pydantic import BaseModel
from typing import List

class Recommendation(BaseModel):
    product: str
    reason: str
    price: float

class Recommendations(BaseModel):
    recommendations: List[Recommendation]

class Gift(BaseModel):
    product: str
    description: str
    price: float
    url: str