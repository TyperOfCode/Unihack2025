from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from pydantic import BaseModel
from typing import List, Optional

from models.recommendations import Recommendation, Recommendations
from models.profile import GiftUserProfile, Preference

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


json_data = GiftUserProfile(**{
    "Age": 27,
    "Gender": "Female",
    "Occupation": "Graphic Designer",
    "Location": "Seattle, WA",
    "Relationship_to_Recipient": "Close friend",
    "likes": [Preference(name="Art", description="Loves impressionist art work", how_important=45), Preference(name="Photography", description="Loves taking photos of her travels and lifestyle", how_important=72), Preference(name="Gaming", description="has been a gamer her whole life and really likes relaxing games like Stardew Valley", how_important=60), Preference(name="Hiking", description="Loves hiking and exploring the outdoors", how_important=80)],
    "dislikes": [Preference(name="Cooking", description="Hates how time consuming cooking can be", how_important=34)],
    "Budget": "50",
    "Gift_Giving_History": ["Painting Set", "Photography Book", "Gaming Mouse", "Hiking Boots"],
    "Upcoming_Events": ["Birthday", "Christmas", "Anniversary"],
    "Wishlist": ["Painting Set", "Photography Book", "Gaming Mouse", "Hiking Boots"],
    "Gift_Guesses": ["Painting Set", "Photography Book", "Gaming Mouse", "Hiking Boots"],
    "Completed_Percentage": 0.0
})

print(select_gifts(json_data))