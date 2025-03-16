import json
import os
import time
from dotenv import load_dotenv
from models.product import CrawledData, Product, Products
from typing import List
from google import genai
from openai import OpenAI

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
openAiClient = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def clean_md(data: List[CrawledData], product: str):
    data_to_clean = ""
    for cD in data:
        crawledData = cD.model_dump()
        url, md = crawledData["url"], crawledData["md"]
        data_to_clean +=  f"{url}:\n{md}\n\n"
    
    clean_prompt = f"""
    You are a specialized data extraction and summarization assistant, who will summarise data for further processing.
    You will be given a certain product/topic which should always be the focus when determing what data to extract and be use in the summary.
    You will also be given several different md files, each belonging to a different url/website. A summary should be generated for each
    url. Below are some things you might want to include in the summary
    - Product names, models, and identifiers
    - Technical specifications and features
    - Pricing information and payment options
    - Compatibility requirements
    - Release dates and version information
    - Usage instructions and best practices
    - Limitations and known issues
    - Customer testimonials or feedback
    
    The chosen topic: {product}
    Below is the md data you will need to process. The data is split by each url's md file:
    {data_to_clean}

    Return a single string containing each summary separated by a newline.
    """

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=clean_prompt,
    )
    return response.text

def aggregation(summaries: str, profile: str):
    completion = openAiClient.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": f"""You are a specialised data analyst. You will be given multiple summaries (separated by a newline) about a certain product
                but from different websites. Your job is to aggregate all the summaries to then decide which three products the user should purchase.
                Take into consideration price, reviews, availability and any other data point that is relevant. After deciding
                on which products, return your findings in the response_format provided.
                You should provide a name, price, descriptionin about 15 words, and review sentiment about 15 words for each product.
                """
            },
            {
                "role": "user",
                "content": summaries
            }
        ],
        response_format=Products
    )
    response = completion.choices[0].message.parsed
    return response
    return response