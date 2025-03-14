from pydantic import BaseModel

class Gift(BaseModel):
    name: str
    age: int
    email: str
    phone: str