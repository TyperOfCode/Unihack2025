from typing import List
from pydantic import BaseModel

class Product(BaseModel):
    url: str
    name: str
    description: str
    price: int

class CrawledData(BaseModel):
    url: str
    md: str

class Products(BaseModel):
    products: List[Product]