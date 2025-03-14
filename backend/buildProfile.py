
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from pydantic import BaseModel
from typing import List, Optional
import re

from models.recommendations import Recommendation, Recommendations
from models.profile import GiftUserProfile, Preference

load_dotenv()

def build_profile():
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    messages=[
            {
                "role": "assistant",
                "content": """You're helping build a profile for a gift recipient based on the following fields:
                    age: Optional[int]
                    gender: Optional[str]
                    occupation: Optional[str]
                    location: Optional[str]
                    relationship_to_recipient: Optional[str]
                    likes: Optional[List[Preference]]
                    dislikes: Optional[List[Preference]]
                    budget: Optional[float]
                    gift_giving_history: Optional[List[str]]
                    upcoming_events: Optional[List[str]]
                    wishlist: Optional[List[str]]
                    gift_guesses: Optional[List[str]]
                    completed_percentage: float

                    A Preference is defined by the following:
                    name: str
                    description: str
                    how_important: int
                    
                    For Example:
                    {
                    "age": 34,
                    "gender": "Male",
                    "occupation": "Accountant",
                    "location": "Sydney",
                    "relationship_to_recipient": "Brother",
                    "likes": [
                        {
                        "name": "Cooking",
                        "description": "he really likes making italian food",
                        "how_important": 4
                        },
                        {
                        "name": "Gaming",
                        "description": "he loves playing first person shooters",
                        "how_important": 7
                        },
                        {
                        "name": "Rock Climbing",
                        "description": "he goes every week",
                        "how_important": 8
                        }
                    ],
                    "dislikes": [
                        {
                        "name": "Cleaning",
                        "description": "he hates cleaning up after himself",
                        "how_important": 4
                        }
                    ],
                    "budget": 120.0,
                    "gift_giving_history": [],
                    "upcoming_events": ["Birthday"],
                    "wishlist": ["A new keyboard"],
                    "gift_guesses": ["Some gadgets for his gaming computer"],
                    "completed_percentage": 100.0
                    }

                    You need to ask questions to fill in the profile, continue asking questions until the profile is complete. When complete say 'FINISHED' and return the profile as a JSON object.
                    Start immediately by asking the first question."""
            },
        ]
    completion = client.chat.completions.create(
        model="o3-mini",
        messages=messages
    )
    while ("FINISHED" not in completion.choices[-1].message.content):
        messages.append({
            "role": "assistant",
            "content": completion.choices[-1].message.content
        })
        print(completion.choices[-1].message.content)
        input_message = input("User: ")
        messages.append({
            "role": "user",
            "content": input_message
        })
        completion = client.chat.completions.create(
            model="o3-mini",
            messages=messages
        )

    match = re.search(r'\{.*\}', completion.choices[-1].message.content, re.DOTALL)
    if match:
        profile_json = match.group(0)
    else:
        raise ValueError("No JSON object found in the completion response")

    profile_data = json.loads(profile_json)

    profile_data['likes'] = [Preference(**like) for like in profile_data['likes']]
    profile_data['dislikes'] = [Preference(**dislike) for dislike in profile_data['dislikes']]

    gift_user_profile = GiftUserProfile(**profile_data)
    return gift_user_profile

print(build_profile())