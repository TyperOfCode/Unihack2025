import os
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv
from openai import OpenAI
from .gift import Gift
from .portfolio import Portfolio

load_dotenv()

OpenAIclient = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
ElevenClient = ElevenLabs(api_key=os.getenv("sk_cedf819676a729417ffa10e59df0109a54563819e0bc530b"))

def generate_note(portfolio: Portfolio, gift: Gift, context: str):
    completion = OpenAIclient.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": context
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
