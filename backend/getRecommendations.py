from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from models.recommendations import Recommendations
from models.profile import GiftUserProfile
import time

load_dotenv()

def get_recommendations(data: GiftUserProfile):
    data_string = json.dumps(data.model_dump())
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
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
        ],
        response_format=Recommendations
    )
    response: Recommendations = completion.choices[0].message.parsed
    return response.recommendations



if __name__ == "__main__":
  ...