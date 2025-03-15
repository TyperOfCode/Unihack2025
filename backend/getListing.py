import json
import os, requests
from typing import List
import re
import time
from dotenv import load_dotenv
from getProducts import get_markdown
from models.product import CrawledData
from models.recommendations import Gift, Recommendation
from googlesearch import search
from google import genai

load_dotenv()

def get_listing(product: str):
    sites: List[CrawledData] = get_markdown("buy " + product)
    print(sites[0].url)
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    response = client.models.generate_content(
        model="gemini-2.0-flash-lite", contents=f"""Is this a page to purchase a {product} and not a review page? If so reply with only 'Yes', if not reply with only 'No'.
        {sites[0].md}"""
    )
    count = 1
    while ('no' in response.text.lower()):
        print(sites[count].url)
        response = client.models.generate_content(
            model="gemini-2.0-flash-lite", contents=f"""Is this a page to purchase a {product} and not a review page? If so reply with only 'Yes', if not reply with only 'No.
            {sites[count].md}"""
        )
        count += 1
        if count >= len(sites):
            return sites[0].url
    return sites[count - 1].url

print(get_listing("Born Acrylic Paint Set 40 Pieces"))