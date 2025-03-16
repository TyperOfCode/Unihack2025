from typing import Dict
from pydantic import BaseModel
from models.product import Products

class saveStateRequest(BaseModel):
    uuid: str
    result: Products

class loadStateRequest(BaseModel):
    uuid: str

class stateDB(BaseModel):
    data: Dict[str, Products]