from models.product import CrawledData, Product
from typing import List
from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")

def clean_md(data: List[CrawledData], product: str):
    clean_prompt = """
    You are a specialized data extraction and summarization assistant focused on analyzing Markdown files to extract product-relevant information.
    Your primary function is to transform detailed Markdown documentation into concise, structured product insights.

    When processing Markdown content:

    1. EXTRACT KEY PRODUCT INFORMATION:
    - Product names, models, and identifiers
    - Technical specifications and features
    - Pricing information and payment options
    - Compatibility requirements
    - Release dates and version information
    - Usage instructions and best practices
    - Limitations and known issues
    - Customer testimonials or feedback
    """
    # Convert md to json
    # Summarise each website
    # Need to be able pass into gpt

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=clean_prompt,
    )
    # return List[NewProduct]