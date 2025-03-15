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
    print(search(query, tld="co.in", num=10, stop=10, pause=2))
    # client = genai.Client(api_key="YOUR_API_KEY")
    # response = client.models.generate_content(
    # model="gemini-2.0-flash", contents="Explain how AI works")



data: Recommendation = Recommendation(product="Painting Set", reason="She loves impressionist art work", price=50)
print(select_product(data))