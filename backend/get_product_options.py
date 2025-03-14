from google import genai
from models.product import Product, ProductCategory
import os

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

async def get_product_options():
    response = client.models.generate_content(
        model = "gemini-2.0-flash", contents="AAAAAAAAAAA"
    )

    print(response.text)

    return {}
