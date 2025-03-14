from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from pydantic import BaseModel
from typing import List, Optional

load_dotenv()

class Recommendation(BaseModel):
    product: str
    reason: str
    price: float

class Recommendations(BaseModel):
    recommendations: List[Recommendation]

def select_gifts(data):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    completion = client.chat.completions.create(
        model="o3-mini",
        messages=[
            {
                "role": "system",
                "content": """You are helping me pick out a gift for someone based on the data I provide you. You should provide a json array of 5 gift ideas. Each idea should have the following fields:
                product: Type of product, reason: Why you think this is a good gift, price: Price of the product"""
            },
            {
                "role": "user",
                "content": data
            }
        ]
    )
    recommendations_data = json.loads(completion.choices[0].message.content)
    recommendations = [Recommendation(**rec) for rec in recommendations_data]
    return Recommendations(recommendations=recommendations)


json_data = json.dumps({
  "Age": 27,
  "Gender": "Female",
  "Occupation": "Graphic Designer",
  "Location": "Seattle, WA",
  "Relationship_to_Gift_Recipient": "Close friend",
  "Hobbies": ["Painting", "Photography", "Gaming", "Hiking"],
  "Genre_Aesthetic_Vibe": ["Indie", "Cozy", "Artsy", "Cottagecore"],
  "Outdoor_Indoor_Preference": "Mostly indoor, but enjoys weekend hikes",
  "Fashion_Preference": "Casual chic, oversized sweaters, vintage finds",
  "Tech_Interest": "Loves cool gadgets but not super tech-savvy",
  "Fitness_Interest": ["Light yoga", "Occasional rock climbing"],
  "Budget": "$50-$100",
  "Upcoming_Events_Special_Occasion": "Birthday in two weeks",
})

print(select_gifts(json_data))