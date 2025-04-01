from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import Runnable
from huggingface_hub import InferenceClient
from django.http import JsonResponse
from rest_framework.decorators import api_view
import os
import re
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()
api_key = os.environ.get("HUGGINGFACEHUB_API_TOKEN")
if not api_key:
    raise ValueError("HUGGINGFACEHUB_API_TOKEN not found in .env file")

model_id = os.environ.get("MODEL_ID", "meta-llama/Meta-Llama-3-8B-Instruct")
logger.debug(f"Model ID loaded: {model_id}")

class HuggingFaceInferenceRunnable(Runnable):
    def __init__(self, model_id, api_key):
        logger.debug(f"Initializing InferenceClient with model: {model_id}")
        self.client = InferenceClient(model=model_id, token=api_key)

    def invoke(self, input, *kwargs):
        response = self.client.text_generation(
            input,
            max_new_tokens=500,
            temperature=0.7
        )
        return response

llm = HuggingFaceInferenceRunnable(model_id=model_id, api_key=api_key)

template = """
You are a helpful assistant. Please answer the following question clearly and concisely:
Question: {question}
Answer:
"""

prompt = PromptTemplate(template=template, input_variables=["question"])

def extract_answer(response):
    answer_pattern = r"Answer:\s(.?)(?:\s|$)"
    match = re.search(answer_pattern, response, re.DOTALL)
    if match:
        cleaned = match.group(1).strip()
        cleaned = re.sub(r'^[:\s]+', '', cleaned)
        return cleaned
    
    cleaned = re.sub(r"(?:human|ai):\s*", "", response, flags=re.IGNORECASE)
    cleaned = re.sub(r".?```", "", cleaned, flags=re.DOTALL)
    cleaned = re.sub(r"Question:.?(?=Answer:|$)", "", cleaned, flags=re.DOTALL)
    cleaned = re.sub(r"Answer:\s*", "", cleaned, flags=re.DOTALL)
    cleaned = re.sub(r'^[:\s]+', '', cleaned)
    return cleaned.strip()

def get_answer(question):
    try:
        formatted_prompt = prompt.format(question=question)
        logger.debug(f"Sending prompt: {formatted_prompt}")
        response = llm.invoke(formatted_prompt)
        logger.debug(f"Raw response: {response}")
        clean_answer = extract_answer(response)
        logger.debug(f"Cleaned answer: {clean_answer}")
        return clean_answer
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return f"Error: {str(e)}"

@api_view(['POST'])
def ask_question(request):
    question = request.data.get('question', '').strip()
    if not question:
        return JsonResponse({'error': 'Please enter a question.'}, status=400)
    
    answer = get_answer(question)
    return JsonResponse({'answer': answer})
