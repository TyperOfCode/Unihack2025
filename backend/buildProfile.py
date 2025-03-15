from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from typing import List, Dict, Any
import traceback

from models.profile import LLMResponse, GiftUserProfile

load_dotenv()

def build_profile(pastQuestions: List[str], pastAnswers: List[str], model: str):
    try:
        # Parse the model string to a dictionary if it's not empty
        current_profile = {}
        if model and model.strip():
            try:
                current_profile = json.loads(model)
            except json.JSONDecodeError:
                print(f"Warning: Could not parse model string: {model}")
                current_profile = {}
        
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # Format the messages for the API call
        messages = [
            {
                "role": "system",
                "content": f"""You need to help build a profile for a gift recipient. 
                You will be provided a list of past questions: {pastQuestions},
                a list of past answers: {pastAnswers},
                and the current profile model: {current_profile}.
                
                You will need to also update the profile based on the last question and answer.
                
                Don't ask past questions. Judge completeness by how filled out the GiftUserProfile is, it is okay for some of the fields to be None, though you should ask questions to try and get answers to all fields.
                
                The completed_percentage field should be a number between 0 and 100 that represents how complete the profile is. This should be based on how many fields are filled out and how detailed they are.
                
                Return a new question that will help fill out the profile further."""
            }
        ]
        
        # Make the API call
        completion = client.beta.chat.completions.parse(
            model="o3-mini",
            messages=messages,
            response_format=LLMResponse
        )

        response: LLMResponse = completion.choices[0].message.parsed
        return json.dumps(response.model_dump())
    except Exception as e:
        print(f"Error in build_profile: {str(e)}")
        print(traceback.format_exc())
        raise