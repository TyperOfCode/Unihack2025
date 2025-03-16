from typing import List
from pydantic import BaseModel

class Product(BaseModel):
    name: str
    description: str
    price: int
    review_sentiment: str
    reason: str

class CrawledData(BaseModel):
    url: str
    md: str

class Products(BaseModel):
    products: List[Product]

class Listing(BaseModel):
    url: str
    image: str

class DisplayProduct(BaseModel):
    name: str
    price: int
    description: str
    review_sentiment: str
    reason: str
    image: str
    url: str