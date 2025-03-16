import concurrent
import json
import os, requests
import time
from typing import List
from dotenv import load_dotenv
from clean_md import clean_md, aggregation
from models.product import CrawledData, DisplayProduct, Listing, Products
from concurrent.futures import ThreadPoolExecutor
import re
from google import genai
from duckduckgo_search import DDGS

from models.profile import GiftUserProfile

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

def get_markdown(query: str):
    headers = {
        'Authorization': f'Bearer {os.getenv("SPIDER_API_KEY")}',
        'Content-Type': 'application/json',
    }
    
    urls_string = ",".join(get_urls(query))
    json_data = {"limit":1,"return_format":"markdown", "url":urls_string}

    response2 = requests.post('https://api.spider.cloud/crawl', 
    headers=headers, json=json_data).json()
    return_list = []
    for site in response2:
        return_list.append(CrawledData(url=site["url"], md=site["content"]))
    return return_list

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

    return Listing(url=sites[count].url, image=find_product_image(product)[0])


def get_urls(query: str):
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
    return urls

def get_product(query: str, profile: GiftUserProfile):
    
    data = get_markdown(query)
    summaries = clean_md(data, query)
    products: Products = aggregation(summaries, json.dumps(profile.model_dump()))
    listings: List[DisplayProduct] = []
    
    def fetch_listing(product_name):
        return get_listing(product_name)

    with ThreadPoolExecutor() as executor:
        future_to_product = {executor.submit(fetch_listing, product.name): product for product in products.products}
        for future in concurrent.futures.as_completed(future_to_product):
            product = future_to_product[future]
            listing: Listing = future.result()
            listings.append(DisplayProduct(
                name=product.name,
                price=product.price,
                description=product.description,
                review_sentiment=product.review_sentiment,
                reason=product.reason,
                image=listing.image,
                url=listing.url
            ))
    return listings
# start = time.time()
# print(get_product("iPhone 16 Pro Max",  GiftUserProfile(
#     interests=["technology", "gadgets", "photography"],
#     dislikes=["sports", "cooking"],
#     about="A tech enthusiast who loves gadgets and photography.",
#     completed_percentage=75.0)))
# end = time.time()
# print(end-start)