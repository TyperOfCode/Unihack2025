
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from typing import List

from models.profile import LLMResponse

load_dotenv()

def build_profile(pastQuestions: List[str], pastAnswers: List[str], model: str):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    messages=[
        {
            "role": "assistant",
            "content": f"""You need to help build a profile for a gift recipient. 
            You will be provided a list of past questions: {pastQuestions},
            a list of past answers: {pastAnswers},
            and the current profile model: {model}.
            
            You will need to also update the profile based on the last question and answer.
            
            Don't ask past questions. Judge completeness by how filled out the GiftUserProfile is, it is okay for some of the fields to be None, though you should ask questions to try and get answers to all fields."""
        },
    ],
    completion = client.chat.completions.create(
        model="o3-mini",
        messages=messages,
        response_format=LLMResponse
    )

    response: LLMResponse = completion.choices[0].message.parsed
    return json.dumps(response.model_dump())