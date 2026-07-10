from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
try:
    response = client.models.generate_content(
        model="gemini-2.0-flash-lite",
        contents="Say hi"
    )
    print("Lite works:", response.text)
except Exception as e:
    print("Lite error:", e)

try:
    response = client.models.generate_content(
        model="gemini-flash-lite-latest",
        contents="Say hi"
    )
    print("Flash lite latest works:", response.text)
except Exception as e:
    print("Flash lite latest error:", e)

