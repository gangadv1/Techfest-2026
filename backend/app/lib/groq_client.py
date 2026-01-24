"""Groq API client for LLM-based plan generation."""
import os
import json
from typing import Optional, Dict, Any
import httpx

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = "llama-3.1-8b-instant"

def _get_api_key() -> str:
    """Get GROQ API key from environment."""
    key = os.getenv("GROQ_API_KEY", "").strip()
    if not key:
        raise ValueError("GROQ_API_KEY environment variable not set")
    return key

async def call_groq_chat(
    system_prompt: str,
    user_prompt: str,
    model: str = DEFAULT_MODEL,
    temperature: float = 0.3,
    max_tokens: int = 4000,
) -> Optional[str]:
    """
    Call Groq Chat Completions API with the given prompts.
    Returns the assistant's response text or None on error.
    """
    api_key = _get_api_key()

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    try:
        print(f"🔍 Sending Groq API request:")
        print(f"   Model: {model}")
        print(f"   Temperature: {temperature}")
        print(f"   Max tokens: {max_tokens}")
        print(f"   System prompt length: {len(system_prompt)}")
        print(f"   User prompt length: {len(user_prompt)}")
        print(f"   API Key set: {'Yes' if api_key else 'No'}")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(GROQ_API_URL, json=payload, headers=headers)
            
            print(f"📡 Groq API response status: {response.status_code}")
            if response.status_code != 200:
                print(f"❌ Response content: {response.text}")
            
            response.raise_for_status()
            data = response.json()
            
            if "choices" in data and len(data["choices"]) > 0:
                return data["choices"][0]["message"]["content"]
            return None
    except Exception as e:
        print(f"Groq API error: {e}")
        return None


async def call_groq_json(
    system_prompt: str,
    user_prompt: str,
    model: str = DEFAULT_MODEL,
) -> Optional[Dict[Any, Any]]:
    """
    Call Groq and parse response as JSON.
    Returns parsed dict or None on error.
    """
    response_text = await call_groq_chat(system_prompt, user_prompt, model=model)
    if not response_text:
        return None

    # Try to extract JSON from response (may have markdown code blocks)
    text = response_text.strip()
    
    # Remove markdown code blocks if present
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    
    if text.endswith("```"):
        text = text[:-3]
    
    text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        print(f"Failed to parse Groq response as JSON: {e}")
        print(f"Response text: {text[:500]}")
        return None
