import os
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv
from fastapi.responses import StreamingResponse
from openai import OpenAI

from typing import List
import io
from models.profile import GiftUserProfile, Preference
from models.product import Gift
import requests
import json
from google import genai

load_dotenv()
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDQzNjcxMjBjOGI3ZWI2MWM5MDY3OCIsInVpZCI6NTgwNzEzMCwiZW1haWwiOiJraW1jaGhvZXVAZ21haWwuY29tIiwiY3JlZGVudGlhbElkIjoiNjdkNDM3MWUyMGM4YjdlYjYxYzkxOTA1IiwiZmlyc3ROYW1lIjoiS2ltIiwibGFzdE5hbWUiOiJDaGhvZXUiLCJ0ZWFtX2lkIjoiNjdkNDM2NzFiNTA4ZTIxNWJiY2Q4ODAwIiwicm9sZV9hY3Rpb25zIjpbMSwyLDMsNCw1LDYsNyw4LDldLCJpc19kZWZhdWx0X3RlYW0iOnRydWUsImZyb20iOiJ0b08iLCJ0eXBlIjoidXNlciIsImlhdCI6MTc0MTk2MzEyNywiZXhwIjoyMDUzMDAzMTI3fQ._QOJ9PhdaxinqOFcA3SKokVPecZVcEo53Nclrj__HzI"
OpenAIclient = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
ElevenClient = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))
AkoolClient = os.getenv("AKOOL_API_KEY")
GenAiclient = genai.Client(api_key="GEMINI_API_KEY")

def format_for_prompt(list: List[str]):
    return "\n".join([f"- {item}" for item in list])

def format_for_likes_prompt(list: List[Preference]):
    return "\n".join([f"- {item.name}" for item in list])

def generate_note(profile: GiftUserProfile, gift: Gift, context: str):
    system_prompt = '''
    You are a thoughtful gift note writer with an exceptional ability to craft personalized, heartfelt messages.
    Your task is to create the perfect note to accompany a gift based on:
    1. The relationship between giver and recipient (family member, friend, romantic partner, colleague, etc.)
    2. The occasion (birthday, anniversary, holiday, congratulations, thank you, etc.)
    3. The gift itself
    4. Any personal details about the recipient (their interests, personality, shared memories)

    Create a note that:
    - Sounds natural and conversational, not generic or formulaic
    - Captures the appropriate emotional tone for the relationship and occasion 
    - References specific details about the recipient and/or your relationship
    - Connects meaningfully to the gift being given
    - Is concise (50-100 words) but impactful

    Each note should feel authentic to the giver and make the recipient feel truly seen and appreciated, enhancing the meaning and impact of the gift.
    '''

    user_prompt = f'''
    Please write a gift note for the following:

    Relationship: {profile.relationship_to_recipient}
    Occasion: {context}
    Gift: {gift.name}
    Tone preference: Base it on relationship with recipient

    Additional context:
    Likes: 
    {format_for_likes_prompt(profile.likes)}
    
    Wishlist: 
    {format_for_prompt(profile.wishlist)}
    
    Upcoming events: 
    {format_for_prompt(profile.upcoming_events)}
    '''

    completion = OpenAIclient.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ]
    )

    return completion.choices[0].message.content

def note_to_voice(input: str):
    audio = ElevenClient.text_to_speech.convert(
        text=input,
        voice_id="56AoDkrOh6qfVPDXZ7Pt",
        model_id="eleven_multilingual_v2",
        output_format="mp3_44100_128",
    )

    return StreamingResponse(
        audio, 
        media_type="audio/mpeg",
        headers={
            "Content-Disposition": f"attachment; filename=gift_note.mp3"
        }
    )

def generate_card(note: str):
    response = GenAiclient.models.generate_content(
        model="gemini-2.0-flash", contents=note
    )
    print(response.text)

profile = GiftUserProfile(relationship_to_recipient="Girlfriend", likes=[Preference(name="Music", description="Hiphop", how_important=80)], upcoming_events=["Concert", "Interview", "Marathon"], wishlist=["Car", "Tickets to Drake"])
gift = Gift(name="Front row seats to Taylor Swift's Australian Tour", price=250)
context = "Birthday"
output = generate_note(profile, gift, context)
print(output)
# play(note_to_voice(output))

# user_prompt = f'''
# Please write a gift note for the following:

# Relationship: {profile.relationship_to_recipient}
# Occasion: {context}
# Gift: {gift.name}
# Tone preference: Base it on relationship with recipient

# Additional context:
# Likes: 
# {format_for_likes_prompt(profile.likes)}

# Wishlist: 
# {format_for_prompt(profile.wishlist)}

# Upcoming events: 
# {format_for_prompt(profile.upcoming_events)}
# '''
# print(user_prompt)

# print(note_to_voice("Hi my name is Bob"))

# image_url = "data:image/jpeg;base64,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"
# script = "Hello, this is a test of the Akool Talking Photo API."

# result = create_talking_photo(image_url, script)

# if result:
#     # The response will include a video_url field with the generated talking photo
#     print(f"Talking photo created: {result}")