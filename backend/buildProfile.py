from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from typing import List, Dict, Any
import traceback

from models.profile import LLMResponse

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
        
        print(current_profile)
        
        # Format the messages for the API call
        messages = [
            {
                "role": "system",
                "content": f"""You need to help build a profile for a gift recipient. 
                You will be provided a list of past questions: {pastQuestions},
                a list of past answers: {pastAnswers},
                and the current profile model: {current_profile}.
                
                the most recent question is: {pastQuestions[-1]} 
                and the most recent answer is: {pastAnswers[-1]}.
                
                You will need to also update the profile based on the last question and answer.
                
                Don't ask past questions. Questions should be no more than 1 sentence long. 
                
                Judge completeness by how filled out the GiftUserProfile is, there should be a coule of interests and a semi specific description of the person.
                Factor in the past questions and answers when judging completeness, some fields may not have an answer.
                
                Profile completeness must only go up, never down.
                Return the current profile with ADDED detail, do not remove any detail.
                
                Return a new question that will help fill out the profile further for the sole purpose of giving them a gift.
                """
            }
        ]
        
        # Make the API call
        completion = client.beta.chat.completions.parse(
            model="gpt-4o",
            messages=messages,
            response_format=LLMResponse
        )

        response: LLMResponse = completion.choices[0].message.parsed
        return json.dumps(response.model_dump())
    except Exception as e:
        print(f"Error in build_profile: {str(e)}")
        print(traceback.format_exc())
        raise