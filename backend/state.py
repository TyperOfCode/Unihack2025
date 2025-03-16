from models.product import Products
from models.stateRequest import saveStateRequest, stateDB
import json

states: stateDB = dict()

def saveState(req: saveStateRequest):
    states[req.uuid] = req.result

def loadState(uuid: str):
    if uuid in states:
        products: Products = states[uuid]
        return json.dumps(products.model_dump())
    else:
        return ""

if __name__ == "__main__":
    ...