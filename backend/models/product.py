from pydantic import BaseModel

class Product(BaseModel):
    name: str
    description: str
    price: int

class CrawledData(BaseModel):
    url: str
    md: str