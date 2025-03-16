import json
import os, requests
import re
import time
from dotenv import load_dotenv
from models.product import CrawledData
from models.recommendations import Gift, Recommendation
from googlesearch import search
from google import genai

load_dotenv()
def get_markdown(query: str):
    headers = {
        'Authorization': f'Bearer {os.getenv("SPIDER_API_KEY")}',
        'Content-Type': 'application/json',
    }

    json_data = {"search":query + " reviews","search_limit":15,"limit":1,"return_format":"markdown"}

    response1 = requests.post('https://api.spider.cloud/search', 
    headers=headers, json=json_data).json()
    urls = []
    for site in response1["content"]:
        urls.append(site["url"])

    urls_string = ",".join(urls)
    json_data = {"limit":1,"return_format":"markdown", "url":urls_string}

    response2 = requests.post('https://api.spider.cloud/crawl', 
    headers=headers, json=json_data).json()
    return_list = []
    for site in response2:
        return_list.append(CrawledData(url=site["url"], md=site["content"]))
    return return_list

def get_product(query: str):
    # Import the functions here to avoid circular imports
    from clean_md import aggregation, clean_md
    
    data = get_markdown(query)
    summaries = clean_md(data, query)
    return aggregation(summaries)