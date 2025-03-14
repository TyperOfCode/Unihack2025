from pydantic import BaseModel

class Portfolio(BaseModel):
    name: str
    age: int
    email: str
    phone: str