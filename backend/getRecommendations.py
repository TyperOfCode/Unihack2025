from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from models.recommendations import Recommendation, Recommendations
from models.profile import GiftUserProfile

load_dotenv()

def select_gifts(data: GiftUserProfile):
    data_string = json.dumps(data.model_dump())
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    completion = client.chat.completions.create(
        model="o3-mini",
        messages=[
            {
                "role": "system",
                "content": """You are helping me pick out a gift for someone based on the data I provide you. You should provide a json array of 5 gift ideas. Each idea should have the following fields:
                product: Type of product, reason: Why you think this is a good gift, price: Price of the product as just a number. For example: [{"product": "Painting Set", "reason": "She loves impressionist art work", "price": 50}]"""
            },
            {
                "role": "user",
                "content": data_string
            }
        ]
    )
    recommendations_data = json.loads(completion.choices[0].message.content)
    recommendations = [Recommendation(**rec) for rec in recommendations_data]
    return Recommendations(recommendations=recommendations)