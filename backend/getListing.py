import json
from openai import OpenAI
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
from duckduckgo_search import DDGS

load_dotenv()

def extract_image_urls(markdown: str) -> List[str]:
    # Regular expression to find image URLs in markdown
    image_url_pattern = re.compile(r'https://[^:]*\.(?:png|jpg|jpeg)')
    return image_url_pattern.findall(markdown)

def find_product_image(product_name):
    with DDGS() as ddgs:
        results = list(ddgs.images(product_name, max_results=10))
    if results:
        for result in results:
            if ".png" in result["image"] or ".jpg" in result["image"]:
                return extract_image_urls(result["image"])
        return "No image found."
    else:
        return "No image found."

def get_listing(product: str):
    sites: List[CrawledData] = get_markdown("buy " + product)
    print(sites[0].url)
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=f"""Is this a page to purchase a {product} and not a review page? If so reply with only 'Yes', if not reply with only 'No'.
        {sites[0].md}"""
    )
    count = 1
    while ('no' in response.text.lower() and sites[count].url != "chrome-error://chromewebdata/"):
        print(sites[count].url)
        response = client.models.generate_content(
            model="gemini-2.0-flash", contents=f"""Is this a page to purchase a {product} and not a review page? If so reply with only 'Yes', if not reply with only 'No.
            {sites[count].md}"""
        )
        count += 1
        if count >= len(sites):
            return sites[0].url
    count -= 1

    return (sites[count].url, find_product_image(product)[0])

print(get_listing("iPhone 16 Pro Max"))