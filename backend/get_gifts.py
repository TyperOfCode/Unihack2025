from google import genai
from models.product import Gift, GiftCategory
import os

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

async def get_gifts():
    response = client.models.generate_content(
        model = "gemini-2.0-flash", contents="Give me ideas and prices for laptops to buy as a gift. Give your answer in JSON, following the structure: {categories: [{name: string, product: {name: string, price: number, best_deal_url: string, reason: string}}]}. URLS should be from Australia."
    ) # I was testing out, I'll replace this out with the actual thing in a little

    print(response.text)

    return {}
