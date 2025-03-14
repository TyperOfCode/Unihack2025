from pydantic import BaseModel, HttpUrl
from typing import List

class Gift(BaseModel):
    name: str
    price: int
    url: HttpUrl
    reasons: List[str]

class GiftCategory(BaseModel):
    name: str
    products: List[Gift] # Ordered by some arbitrary ranking?
