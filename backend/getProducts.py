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
from clean_md import aggregation, clean_md
def get_markdown(query: str):
    headers = {
        'Authorization': f'Bearer {os.getenv("SPIDER_API_KEY")}',
        'Content-Type': 'application/json',
    }

    json_data = {"search":query,"search_limit":15,"limit":1,"return_format":"markdown"}

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

l = get_markdown("sony headphones")
s = clean_md(l)
print(aggregation(s))