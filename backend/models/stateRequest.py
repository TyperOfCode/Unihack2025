from typing import Dict
from pydantic import BaseModel
from models.product import DisplayProducts

class loadStateRequest(BaseModel):
    uuid: str

class stateDB(BaseModel):
    data: Dict[str, DisplayProducts]