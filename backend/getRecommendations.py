from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from models.recommendations import Recommendation, Recommendations
from models.profile import GiftUserProfile, Preference
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
    return json.dumps(response.model_dump())

start = time.time()

mock_profile = GiftUserProfile(
    age=34,
    gender="Male",
    occupation="Accountant",
    location="Sydney",
    relationship_to_recipient="Brother",
    likes=[
        Preference(name="Cooking", description="He really likes making Italian food", how_important=4),
        Preference(name="Gaming", description="He loves playing first-person shooters", how_important=7),
        Preference(name="Rock Climbing", description="He goes every week", how_important=8)
    ],
    dislikes=[
        Preference(name="Cleaning", description="He hates cleaning up after himself", how_important=4)
    ],
    budget=120.0,
    gift_giving_history=[],
    upcoming_events=["Birthday"],
    wishlist=["A new keyboard"],
    gift_guesses=["Some gadgets for his gaming computer"],
    completed_percentage=100.0
)

print(get_recommendations(mock_profile))

end = time.time()

print()
print(end-start)