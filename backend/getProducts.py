import json
import os
import re
from dotenv import load_dotenv
from models.recommendations import Gift, Recommendation
from googlesearch import search
from google import genai
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

load_dotenv()

def get_page_html(url, wait_time=10):
    # Initialize the WebDriver (Make sure you have the right WebDriver installed)
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')  # Run in headless mode
    driver = webdriver.Chrome(options=options)
    
    try:
        driver.get(url)
        
        # Wait for the page to fully load
        WebDriverWait(driver, wait_time).until(
            lambda d: d.execute_script('return document.readyState') == 'complete'
        )
        
        # Get page source
        page_html = driver.page_source
        
    finally:
        driver.quit()
    
    return page_html

def select_product(data: Recommendation):
    query = f"{data.product} for sale Sydney Australia around ${data.price}"
    url = search(query, tld="co.in", num=10, stop=10, pause=2).__next__()
    greater_html = get_page_html(url)
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    response1 = client.models.generate_content(
        model="gemini-2.0-flash", contents=f"""Extract and return just the URL to the page listing of the first product from the following HTML:
        {greater_html}""")
    product_html = get_page_html(response1.text)
    response2 = client.models.generate_content(
        model="gemini-2.0-flash", contents=f"""Given the following html extract a product name, description, and price:
        {product_html}

        The output should be JSON of the following format: name: str, description: str, price: float"""
    )
    match = re.search(r'\{.*\}', response2.text, re.DOTALL)
    if match:
        response2_json = json.loads(match.group(0))
    else:
        raise ValueError("No JSON object found in the response")
    request_response: Gift = Gift(product=response2_json["name"], description=response2_json["description"], price=response2_json["price"], url=response1.text)
    return request_response



data: Recommendation = Recommendation(product="Painting Set", reason="She loves impressionist art work", price=50)
print(select_product(data))