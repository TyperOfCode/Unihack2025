import os
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_note(context: str):
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": context
            }
        ]
    )
    print(completion.choices[0].message.content)
    
generate_note()