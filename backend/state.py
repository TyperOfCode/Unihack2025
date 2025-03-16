from typing import List
from models.product import DisplayProducts
from models.stateRequest import stateDB
import json

states: stateDB = dict()

def saveState(uuid: str, listings: DisplayProducts):
    states[uuid] = listings

def loadState(uuid: str):
    if uuid in states:
        products: DisplayProducts = states[uuid]
        return json.dumps(products.model_dump())
    else:
        return ""

if __name__ == "__main__":
    ...