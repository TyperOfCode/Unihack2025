from models.product import CrawledData, Product
from typing import List
from google import genai
from openai import OpenAI

client = genai.Client(api_key="GEMINI_API_KEY")
openAiClient = OpenAI(api_key="OPEN_AI_KEY")

def clean_md(data: List[CrawledData], product: str):
    data_to_clean = ""
    for cD in data:
        crawledData = cD.model_dump()
        url, md = crawledData["url"], crawledData["md"]
        data_to_clean +=  f"{url}:\n{md}\n\n"
    
    clean_prompt = f"""
    You are a specialized data extraction and summarization assistant, who will summarise data for further processing.
    You will be given a certain product/topic which should always be the focus when determing what data to extract and be use in the summary.
    You will also be given several different md files, each belonging to a different url/website. A summary should be generated for each
    url. Below are some things you might want to include in the summary
    - Product names, models, and identifiers
    - Technical specifications and features
    - Pricing information and payment options
    - Compatibility requirements
    - Release dates and version information
    - Usage instructions and best practices
    - Limitations and known issues
    - Customer testimonials or feedback
    
    The chosen topic: {product}
    Below is the md data you will need to process. The data is split by each url's md file:
    {data_to_clean}

    Return a single string containing each summary separated by a newline.
    """

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=clean_prompt,
    )
    print(response.text)
    return response.text

def aggregation(summaries: str):
    completion = openAiClient.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """You are a specialised data analyst. You will be given multiple summaries (separated by a newline) about a certain product
                but from different websites. Your job is to aggregate all the summaries to then decide which website the user should purchase the product from.
                Take into consideration price, reviews, availability and any other data point that is relevant. After deciding
                the website, return your findings in the response_format provided.
                """
            },
            {
                "role": "user",
                "content": summaries
            }
        ],
        response_format=Product
    )
    response = completion.choices[0].message.parsed
    return response.model_dump()

