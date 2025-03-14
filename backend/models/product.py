from pydantic import BaseModel, HttpUrl
from typing import List

class Product(BaseModel):
    name: str
    price: int
    url: HttpUrl
    reasons: List[str]
    
class ProductCategory(BaseModel):
    name: str
    products: List[Product] # Ordered by some arbitrary ranking?
