from google import genai
from models.gift import Gift, GiftCategory
from models.recommendations import Recommendations
import os
import json
from typing import List

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

async def get_gifts(recommendations: Recommendations):
    schema = json.dumps(GiftCategory.model_json_schema())
    res = []

    for recommendation in recommendations:
        response = client.models.generate_content(
            model = "gemini-2.0-flash", contents=f"Give me 3 ideas and prices for {recommendation.product} to buy as a gift. I'd like them to fit the reason for buying, {recommendation.reason}, and be around the price {recommendation.price}. Give your answer in JSON, following the structure: {schema}. URLS should be from Australia.."
        )
        print(response.text[7:-3])
        res.append(GiftCategory.model_validate_json(response.text[7:-3]))

    return res
