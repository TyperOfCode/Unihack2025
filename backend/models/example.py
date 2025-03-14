from pydantic import BaseModel

class Example(BaseModel):
    name: str
    age: int
    email: str
    phone: str
    
    