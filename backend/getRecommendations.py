from openai import OpenAI
import os
from dotenv import load_dotenv
import json

load_dotenv()

def select_gifts(data):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    completion = client.chat.completions.create(
        model="o3-mini",
        messages=[
            {
                "role": "system",
                "content": "You are helping me pick out a gift for someone based on the data I provide you. You should provide a json array of 5 gift ideas with reasons why you think they would be a good fit."
            },
            {
                "role": "user",
                "content": data
            }
        ]
    )
    return completion.choices[0].message.content


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