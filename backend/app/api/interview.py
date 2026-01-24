from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
from app.core.config import settings

router = APIRouter()


class GenerateQuestionRequest(BaseModel):
    company: str
    role: str


class AnalyzeAnswerRequest(BaseModel):
    question: str
    transcript: str
    fillerCount: int
    duration: int


@router.post("/generate-question")
async def generate_question(request: GenerateQuestionRequest):
    """Generate an AI interview question using Groq API"""
    
    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="Groq API key not configured")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{
                        "role": "user",
                        "content": f"""You are an expert interviewer at {request.company}. Generate ONE realistic interview question for a {request.role} position.

Requirements:
- Make it specific to {request.company}'s interview style
- Should be behavioral or technical depending on the role
- Keep it concise (1-2 sentences max)
- Return ONLY the question, nothing else

Question:"""
                    }],
                    "temperature": 0.8,
                    "max_tokens": 150
                }
            )
            
            if response.status_code != 200:
                error_data = response.json()
                raise HTTPException(status_code=response.status_code, detail=error_data.get("error", {}).get("message", "Failed to generate question"))
            
            data = response.json()
            question = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            
            return {"question": question}
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect to Groq API: {str(e)}")


@router.post("/analyze-answer")
async def analyze_answer(request: AnalyzeAnswerRequest):
    """Analyze an interview answer using Groq API"""
    
    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="Groq API key not configured")
    
    try:
        word_count = len(request.transcript.split())
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{
                        "role": "user",
                        "content": f"""You are an expert interview coach. Analyze this interview response.

Interview Question: "{request.question}"
Candidate's Answer: "{request.transcript}"

Metrics:
- Filler words detected: {request.fillerCount}
- Answer duration: {request.duration} seconds
- Word count: {word_count}

Provide a detailed analysis in this EXACT JSON format (no markdown, no extra text):
{{
  "score": <number 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "idealAnswer": "A concise example of how a strong candidate would answer this question using specific frameworks like STAR",
  "recommendations": ["specific tip 1", "specific tip 2", "specific tip 3"]
}}

Consider:
- Content quality and relevance
- Use of frameworks (STAR, etc.)
- Specificity and examples
- Filler word count (>5 is concerning)
- Answer length (30-120 seconds is ideal)

Return ONLY valid JSON, nothing else."""
                    }],
                    "temperature": 0.7,
                    "max_tokens": 1000
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to analyze answer")
            
            data = response.json()
            analysis_text = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            
            # Remove markdown code blocks if present
            analysis_text = analysis_text.replace("```json\n", "").replace("```\n", "").replace("```", "")
            
            import json
            analysis_data = json.loads(analysis_text)
            
            return {
                "analysis": analysis_data,
                "metrics": {
                    "fillerWords": request.fillerCount,
                    "duration": request.duration,
                    "wordCount": word_count,
                    "speakingRate": round(word_count / (request.duration / 60)) if request.duration > 0 else 0
                }
            }
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect to Groq API: {str(e)}")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
