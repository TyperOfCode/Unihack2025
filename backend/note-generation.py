import os
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv
from openai import OpenAI

from typing import List

from models.profile import GiftUserProfile

load_dotenv()

OpenAIclient = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
ElevenClient = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

def format_for_prompt(list: List[str]):
    return "\n".join([f"- {item}" for item in list])

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
    {format_for_prompt(profile.likes)}
    
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
        voice_id="JBFqnCBsd6RMkjVDRZzb",
        model_id="eleven_multilingual_v2",
        output_format="mp3_44100_128",
    )

    return audio
