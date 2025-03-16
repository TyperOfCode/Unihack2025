import concurrent
import json
import os, requests
import time
import logging
import asyncio
from datetime import datetime
from typing import List
from typing import List
from dotenv import load_dotenv
from clean_md import clean_md, aggregation
from models.product import CrawledData, DisplayProduct, Listing, Products
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import re
from clean_md import clean_md, aggregation
from models.product import CrawledData, DisplayProduct, Listing, Products
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import re
from google import genai
from duckduckgo_search import DDGS

from models.profile import GiftUserProfile

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

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

async def get_urls_async(query: str):
    """Asynchronous version of get_urls"""
    logging.info(f"Starting get_urls_async for query: {query}")
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, get_urls, query)

async def get_markdown_async(query: str):
    """Asynchronous version of get_markdown"""
    logging.info(f"Starting get_markdown_async for query: {query}")
    
    # Get URLs asynchronously
    urls = await get_urls_async(query)
    urls_string = ",".join(urls)
    
    # Set up headers and request data
    headers = {
        'Authorization': f'Bearer {os.getenv("SPIDER_API_KEY")}',
        'Content-Type': 'application/json',
    }
    json_data = {"limit":1,"return_format":"markdown", "url":urls_string}
    
    # Make the API request in an executor to avoid blocking
    loop = asyncio.get_event_loop()
    
    def make_request():
        response = requests.post('https://api.spider.cloud/crawl', headers=headers, json=json_data).json()
        return_list = []
        for site in response:
            return_list.append(CrawledData(url=site["url"], md=site["content"]))
        return return_list
    
    return await loop.run_in_executor(None, make_request)

async def get_listing_async(product: str):
    """Asynchronous version of get_listing"""
    logging.info(f"Starting get_listing_async for product: {product}")
    
    # Get markdown data asynchronously
    sites = await get_markdown_async("buy " + product)
    logging.info(f"Got markdown data for {product}")
    
    # Initialize Gemini client
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    
    # Check first site
    loop = asyncio.get_event_loop()
    logging.info(f"Checking if {sites[0].url} is a purchase page for {product}")
    
    # Define a function to run the Gemini check in an executor
    def check_site(site_md, product_name):
        response = client.models.generate_content(
            model="gemini-2.0-flash", 
            contents=f"""Is this a page to purchase a {product_name} and not a review page? If so reply with only 'Yes', if not reply with only 'No'.
            {site_md}"""
        )
        return response.text.lower()
    
    count = 0
    response_text = await loop.run_in_executor(None, lambda: check_site(sites[0].md, product))
    
    # Check subsequent sites if needed
    count = 1
    while ('no' in response_text and count < len(sites) and sites[count].url != "chrome-error://chromewebdata/"):
        logging.info(f"Site {count-1} was not a purchase page, checking {sites[count].url}")
        response_text = await loop.run_in_executor(None, lambda: check_site(sites[count].md, product))
        count += 1
        if count >= len(sites):
            logging.info(f"No purchase page found for {product}, using first site")
            count = 0
            break
    
    if 'no' in response_text:
        count = 0
    else:
        count -= 1
    
    # Find product image asynchronously
    image_url = await loop.run_in_executor(None, lambda: find_product_image(product)[0])
    
    return Listing(url=sites[count].url, image=image_url)

async def get_product_async(query: str, profile: GiftUserProfile):
    """Asynchronous version of get_product"""
    start_time = time.time()
    logging.info(f"Starting get_product_async for query: {query}")
    
    # Get markdown data asynchronously
    data = await get_markdown_async(query)
    markdown_time = time.time()
    logging.info(f"get_markdown_async completed in {markdown_time - start_time:.2f} seconds")
    
    # Run clean_md in executor to avoid blocking
    loop = asyncio.get_event_loop()
    summaries = await loop.run_in_executor(None, lambda: clean_md(data, query))
    clean_time = time.time()
    logging.info(f"clean_md completed in {clean_time - markdown_time:.2f} seconds")
    
    # Run aggregation in executor to avoid blocking
    products = await loop.run_in_executor(None, lambda: aggregation(summaries, json.dumps(profile.model_dump())))
    aggregation_time = time.time()
    logging.info(f"aggregation completed in {aggregation_time - clean_time:.2f} seconds")
    
    listings: List[DisplayProduct] = []
    
    # Create tasks for all product listings
    tasks = [get_listing_async(product.name) for product in products.products]
    
    # Wait for all tasks to complete
    results = await asyncio.gather(*tasks)
    
    # Process results
    for product, listing in zip(products.products, results):
        listings.append(DisplayProduct(
            name=product.name,
            price=product.price,
            description=product.description,
            review_sentiment=product.review_sentiment,
            reason=product.reason,
            image=listing.image,
            url=listing.url
        ))
    
    end_time = time.time()
    total_time = end_time - start_time
    logging.info(f"get_product_async completed in {total_time:.2f} seconds")
    
    return listings

# Keep the original function for backward compatibility
def get_product(query: str, profile: GiftUserProfile):
    """
    Synchronous wrapper for get_product_async.
    This function is kept for backward compatibility.
    For non-blocking operation, use get_product_async directly.
    """
    start_time = time.time()
    logging.info(f"Starting get_product for query: {query}")
    
    # Create a new event loop for this function
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Run the async function in the loop
        result = loop.run_until_complete(get_product_async(query, profile))
    finally:
        # Clean up
        loop.close()
    
    end_time = time.time()
    total_time = end_time - start_time
    logging.info(f"get_product completed in {total_time:.2f} seconds")
    
    return result
  
# Example usage:
# async def main():
#     result = await get_product_async("iPhone 16 Pro Max", GiftUserProfile(
#         interests=["technology", "gadgets", "photography"],
#         dislikes=["sports", "cooking"],
#         about="A tech enthusiast who loves gadgets and photography.",
#         completed_percentage=75.0))
#     print(result)
#
# if __name__ == "__main__":
#     asyncio.run(main())