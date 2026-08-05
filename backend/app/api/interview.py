import random
import re

from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter()


class GenerateQuestionRequest(BaseModel):
    company: str
    role: str


class AnalyzeAnswerRequest(BaseModel):
    question: str
    transcript: str
    fillerCount: int
    duration: int


QUESTION_BANK: dict[str, list[str]] = {
    "software_engineer": [
        "Tell me about a technically challenging software project you worked on. What was your contribution and what did you learn?",
        "Describe a difficult bug you encountered. How did you investigate and resolve it?",
        "How would you design a web application that needs to support millions of users?",
        "Tell me about a time you had to improve the performance of an application.",
        "Describe a situation where you disagreed with a technical decision made by your team.",
        "How do you ensure the code you write is reliable, maintainable, and easy for others to understand?",
        "Tell me about a time you had to learn a new technology quickly to complete a project.",
        "How would you approach debugging an application that works locally but fails in production?",
        "Describe a project where you had to balance speed of delivery with code quality.",
        "Tell me about a time your original technical approach failed. What did you do next?",
    ],

    "frontend": [
        "Describe a frontend project you built and explain the most difficult user-interface problem you solved.",
        "How would you improve the performance of a React application that feels slow?",
        "Tell me about a time you had to make a user interface responsive across different devices.",
        "How do you decide when to use local state, global state, or server state?",
        "Describe how you would make a web application accessible to users with disabilities.",
        "Tell me about a difficult browser compatibility issue you encountered.",
        "How would you reduce unnecessary re-renders in a React application?",
        "Describe a time you received negative feedback about a user interface. How did you respond?",
        "How do you translate a design prototype into a polished and reusable frontend implementation?",
        "Tell me about a frontend feature you built that significantly improved the user experience.",
    ],

    "backend": [
        "Describe a backend system you built and explain the most difficult design decision you made.",
        "How would you design a reliable API for a high-traffic application?",
        "Tell me about a database performance issue you encountered and how you solved it.",
        "How would you handle authentication and authorization in a production application?",
        "Describe a time an API you developed failed unexpectedly. How did you diagnose the issue?",
        "How do you decide between a relational and a non-relational database?",
        "Explain how you would prevent duplicate requests from creating duplicate records.",
        "How would you design a system that continues working when one external service becomes unavailable?",
        "Tell me about a time you improved the security of a backend system.",
        "How would you monitor and troubleshoot a backend service after deployment?",
    ],

    "machine_learning": [
        "Tell me about a machine-learning project you developed from problem definition to deployment.",
        "How do you decide which evaluation metric is appropriate for a machine-learning problem?",
        "Describe a time your model performed well during training but poorly on real-world data.",
        "How would you handle a highly imbalanced dataset?",
        "Tell me about a feature-engineering decision that significantly improved a model.",
        "How do you detect and reduce overfitting?",
        "Describe how you would explain a complex machine-learning model to a non-technical stakeholder.",
        "What steps would you take before deploying a machine-learning model into production?",
        "Tell me about a time your data contained bias or quality problems. How did you handle them?",
        "How would you monitor a deployed model for performance degradation or data drift?",
    ],

    "data_science": [
        "Describe a data-science project that produced a meaningful business or user outcome.",
        "Tell me about a time you discovered an unexpected insight while analyzing data.",
        "How do you approach a dataset containing missing, inconsistent, or incorrect values?",
        "Describe how you would test whether an observed relationship is meaningful rather than coincidental.",
        "How would you communicate a complex data finding to a non-technical audience?",
        "Tell me about a time your initial analysis produced a misleading conclusion.",
        "How do you decide which variables should be included in an analysis or model?",
        "Describe a dashboard or report you created and how it influenced a decision.",
        "How would you evaluate whether a data-driven solution created real impact?",
        "Tell me about a situation where stakeholders disagreed with your findings.",
    ],

    "product_manager": [
        "Tell me about a time you had to prioritize competing product requirements.",
        "How would you decide whether a proposed feature should be built?",
        "Describe a product you use frequently and explain one improvement you would make.",
        "Tell me about a time you made a product decision with incomplete information.",
        "How would you measure whether a newly launched feature is successful?",
        "Describe a situation where engineering, design, and business stakeholders had conflicting priorities.",
        "How would you investigate a sudden decrease in user engagement?",
        "Tell me about a product decision you made that did not produce the expected result.",
        "How would you define the minimum viable product for a new idea?",
        "Describe how you would gather and prioritize user feedback.",
    ],

    "ui_ux": [
        "Describe a design project where user research significantly changed your initial idea.",
        "Tell me about a time you had to defend a design decision to stakeholders.",
        "How do you decide whether a design is easy and intuitive to use?",
        "Describe a usability problem you discovered and how you addressed it.",
        "How would you redesign a confusing onboarding experience?",
        "Tell me about a time you had to balance user needs with technical limitations.",
        "How do you organize and evaluate feedback from usability testing?",
        "Describe how you ensure your designs are accessible.",
        "Tell me about a design that did not work as expected and what you learned.",
        "How do you maintain consistency across a large product or design system?",
    ],

    "devops": [
        "Describe a production incident you handled and explain how you restored the service.",
        "How would you design a reliable CI/CD pipeline?",
        "Tell me about a time you automated a repetitive engineering process.",
        "How do you monitor the health of a production system?",
        "Describe how you would deploy an application without causing noticeable downtime.",
        "Tell me about a difficult containerization or orchestration issue you solved.",
        "How would you manage configuration and secrets securely across environments?",
        "Describe a time infrastructure costs became too high. How did you respond?",
        "How would you investigate a service that becomes slow only during peak traffic?",
        "Tell me about a change you made that improved system reliability.",
    ],

    "cybersecurity": [
        "Describe a security vulnerability you discovered and how you addressed it.",
        "How would you investigate suspicious activity in a production system?",
        "Tell me about a time you had to balance security requirements with usability.",
        "How would you secure a public API?",
        "Describe the steps you would take after discovering exposed credentials.",
        "How do you assess and prioritize security risks?",
        "Tell me about a security control you implemented and how you evaluated its effectiveness.",
        "How would you explain a serious security risk to a non-technical stakeholder?",
        "Describe how you would approach threat modelling for a new application.",
        "How would you respond to a suspected data breach?",
    ],

    "marketing": [
        "Tell me about a marketing campaign you developed and how you measured its success.",
        "Describe a campaign that did not perform as expected. What did you change?",
        "How would you market a new product to a highly specific audience?",
        "Tell me about a time customer research changed your marketing strategy.",
        "How do you decide which marketing channels deserve the most investment?",
        "Describe how you would improve a campaign with high traffic but low conversion.",
        "Tell me about a time you had to work with a limited marketing budget.",
        "How would you measure brand awareness and customer engagement?",
        "Describe a situation where stakeholders disagreed with your proposed campaign.",
        "How do you ensure marketing decisions are supported by data?",
    ],

    "general": [
        "Tell me about yourself and explain how your experience relates to this role.",
        "Why are you interested in joining {company} as a {role}?",
        "Tell me about a difficult challenge you faced and how you overcame it.",
        "Describe a time you worked effectively with a team.",
        "Tell me about a situation where you demonstrated leadership.",
        "Describe a time you received critical feedback and how you responded.",
        "Tell me about a failure that taught you an important lesson.",
        "Describe a situation where you had to manage several priorities at once.",
        "What is one professional strength you would bring to this position?",
        "Why should {company} select you for this {role} position?",
    ],
}


def determine_role_category(role: str) -> str:
    normalized_role = role.lower().strip()

    if any(
        phrase in normalized_role
        for phrase in [
            "machine learning",
            "ml engineer",
            "artificial intelligence",
            "ai engineer",
        ]
    ):
        return "machine_learning"

    if any(
        phrase in normalized_role
        for phrase in [
            "data scientist",
            "data analyst",
            "business intelligence",
            "analytics",
        ]
    ):
        return "data_science"

    if any(
        phrase in normalized_role
        for phrase in [
            "frontend",
            "front-end",
            "react",
            "web developer",
            "ui developer",
        ]
    ):
        return "frontend"

    if any(
        phrase in normalized_role
        for phrase in [
            "backend",
            "back-end",
            "api developer",
            "server engineer",
        ]
    ):
        return "backend"

    if any(
        phrase in normalized_role
        for phrase in [
            "product manager",
            "product management",
            "product owner",
        ]
    ):
        return "product_manager"

    if any(
        phrase in normalized_role
        for phrase in [
            "ui/ux",
            "ux designer",
            "ui designer",
            "product designer",
            "interaction designer",
        ]
    ):
        return "ui_ux"

    if any(
        phrase in normalized_role
        for phrase in [
            "devops",
            "site reliability",
            "sre",
            "cloud engineer",
            "platform engineer",
        ]
    ):
        return "devops"

    if any(
        phrase in normalized_role
        for phrase in [
            "cybersecurity",
            "security engineer",
            "security analyst",
            "penetration tester",
        ]
    ):
        return "cybersecurity"

    if any(
        phrase in normalized_role
        for phrase in [
            "marketing",
            "growth manager",
            "brand manager",
            "content strategist",
        ]
    ):
        return "marketing"

    if any(
        phrase in normalized_role
        for phrase in [
            "software engineer",
            "software developer",
            "full stack",
            "full-stack",
            "developer",
            "engineer",
        ]
    ):
        return "software_engineer"

    return "general"


@router.post("/generate-question")
async def generate_question(request: GenerateQuestionRequest):
    """
    Select a random interview question based on the requested role.
    No external AI service or API key is required.
    """

    category = determine_role_category(request.role)
    questions = QUESTION_BANK.get(category, QUESTION_BANK["general"])

    question = random.choice(questions).format(
        company=request.company,
        role=request.role,
    )

    return {
        "question": question,
        "category": category,
    }


def contains_any(text: str, terms: list[str]) -> bool:
    return any(term in text for term in terms)


def contains_metric(text: str) -> bool:
    metric_patterns = [
        r"\b\d+%",
        r"\b\d+\s*(users|customers|people|requests|seconds|minutes|hours|days)",
        r"\b(increased|decreased|reduced|improved|grew|saved)\s+.*\d+",
        r"\b\d+\s*(x|times)\b",
    ]

    return any(re.search(pattern, text) for pattern in metric_patterns)


def build_ideal_answer(question: str) -> str:
    lowered_question = question.lower()

    if contains_any(
        lowered_question,
        ["design", "architecture", "scalable", "system", "api"],
    ):
        return (
            "Begin by clarifying the requirements, expected users, constraints, "
            "performance targets, security needs, and failure scenarios. Explain "
            "the main components of your proposed design, how data moves between "
            "them, the trade-offs you considered, and how the system could be "
            "monitored and scaled."
        )

    if contains_any(
        lowered_question,
        ["tell me about a time", "describe a time", "situation"],
    ):
        return (
            "Use the STAR structure. Briefly explain the situation and your "
            "responsibility, describe the specific actions you personally took, "
            "and finish with a measurable result and what you learned from the "
            "experience."
        )

    if contains_any(
        lowered_question,
        ["how would you", "how do you", "approach"],
    ):
        return (
            "Start by clarifying the goal and constraints. Present a logical "
            "step-by-step approach, explain why you selected each step, mention "
            "important trade-offs and risks, and conclude with how you would "
            "measure success."
        )

    return (
        "Give a direct opening answer, support it with a relevant example, "
        "explain your personal contribution, describe the result, and connect "
        "the experience back to the responsibilities of the role."
    )


@router.post("/analyze-answer")
async def analyze_answer(request: AnalyzeAnswerRequest):
    """
    Analyze an interview response locally using measurable delivery and
    content signals. No external AI service or API key is required.
    """

    transcript = request.transcript.strip()
    lowered_transcript = transcript.lower()

    words = re.findall(r"\b[\w'-]+\b", transcript)
    word_count = len(words)

    speaking_rate = (
        round(word_count / (request.duration / 60))
        if request.duration > 0
        else 0
    )

    score = 50
    strengths: list[str] = []
    weaknesses: list[str] = []
    recommendations: list[str] = []

    # Answer length
    if 60 <= word_count <= 250:
        score += 12
        strengths.append(
            "The response contained enough detail without becoming excessively long."
        )
    elif word_count < 30:
        score -= 15
        weaknesses.append(
            "The response was too brief to demonstrate your experience clearly."
        )
        recommendations.append(
            "Add a specific example, the actions you took, and the final outcome."
        )
    elif word_count < 60:
        score -= 5
        weaknesses.append(
            "The response could include more context and evidence."
        )
        recommendations.append(
            "Expand on your personal contribution and the result of your actions."
        )
    else:
        score -= 5
        weaknesses.append(
            "The response may be longer than necessary."
        )
        recommendations.append(
            "Remove background details that do not directly support your answer."
        )

    # Duration
    if 45 <= request.duration <= 150:
        score += 10
        strengths.append(
            "The response length was suitable for an interview answer."
        )
    elif request.duration < 30:
        score -= 10
        weaknesses.append(
            "The answer ended too quickly."
        )
        recommendations.append(
            "Aim to speak for approximately 45 to 120 seconds for most questions."
        )
    elif request.duration > 180:
        score -= 8
        weaknesses.append(
            "The answer may be difficult for an interviewer to follow because of its length."
        )
        recommendations.append(
            "Use a clearer structure and finish once the key result has been explained."
        )

    # Filler words
    if request.fillerCount == 0:
        score += 10
        strengths.append(
            "The response contained no detected filler words."
        )
    elif request.fillerCount <= 3:
        score += 6
        strengths.append(
            "Filler-word usage was low."
        )
    elif request.fillerCount <= 6:
        score -= 3
        weaknesses.append(
            f"The response contained {request.fillerCount} filler words."
        )
        recommendations.append(
            "Pause briefly when thinking instead of filling the silence."
        )
    else:
        score -= min(18, request.fillerCount * 2)
        weaknesses.append(
            f"The response contained {request.fillerCount} filler words, which may reduce confidence and clarity."
        )
        recommendations.append(
            "Practise answering slowly and replace filler words with short pauses."
        )

    # Speaking rate
    if 110 <= speaking_rate <= 170:
        score += 8
        strengths.append(
            "The speaking pace was clear and appropriate."
        )
    elif speaking_rate > 190:
        score -= 8
        weaknesses.append(
            "The speaking pace may have been too fast."
        )
        recommendations.append(
            "Slow down slightly and pause between the main parts of your answer."
        )
    elif 0 < speaking_rate < 90:
        score -= 5
        weaknesses.append(
            "The speaking pace may have been too slow or hesitant."
        )
        recommendations.append(
            "Practise the main points beforehand so you can speak more steadily."
        )

    # STAR structure
    star_terms = {
        "situation": ["situation", "context", "when i was", "during"],
        "task": ["task", "responsible", "goal", "objective", "needed to"],
        "action": ["i decided", "i created", "i implemented", "i developed", "i worked", "i analysed", "i analyzed"],
        "result": ["result", "outcome", "improved", "increased", "reduced", "achieved", "learned"],
    }

    star_sections_found = sum(
        contains_any(lowered_transcript, terms)
        for terms in star_terms.values()
    )

    if star_sections_found >= 3:
        score += 12
        strengths.append(
            "The response followed a clear situation-action-result structure."
        )
    elif star_sections_found >= 2:
        score += 5
        recommendations.append(
            "Make the final result more explicit to strengthen the structure."
        )
    else:
        score -= 5
        weaknesses.append(
            "The response did not have a clearly identifiable structure."
        )
        recommendations.append(
            "Use the STAR framework: Situation, Task, Action, and Result."
        )

    # Personal ownership
    personal_action_terms = [
        "i built",
        "i created",
        "i designed",
        "i implemented",
        "i led",
        "i developed",
        "i solved",
        "i improved",
        "i managed",
        "i decided",
    ]

    if contains_any(lowered_transcript, personal_action_terms):
        score += 8
        strengths.append(
            "The response clearly described your personal contribution."
        )
    else:
        weaknesses.append(
            "Your individual contribution was not completely clear."
        )
        recommendations.append(
            "Use direct statements such as 'I designed', 'I implemented', or 'I led'."
        )

    # Quantifiable evidence
    if contains_metric(lowered_transcript):
        score += 10
        strengths.append(
            "The response included measurable evidence or a concrete result."
        )
    else:
        weaknesses.append(
            "The response did not include a measurable result."
        )
        recommendations.append(
            "Include a number, percentage, time saving, performance gain, or another concrete outcome."
        )

    # Reflection
    reflection_terms = [
        "i learned",
        "this taught me",
        "next time",
        "in the future",
        "looking back",
    ]

    if contains_any(lowered_transcript, reflection_terms):
        score += 5
        strengths.append(
            "The response showed reflection and learning."
        )
    else:
        recommendations.append(
            "Finish by briefly explaining what you learned or would do differently."
        )

    # Prevent repetitive output and ensure useful minimum feedback
    strengths = list(dict.fromkeys(strengths))
    weaknesses = list(dict.fromkeys(weaknesses))
    recommendations = list(dict.fromkeys(recommendations))

    if not strengths:
        strengths.append(
            "You attempted the question and provided a recorded response."
        )

    if not weaknesses:
        weaknesses.append(
            "The response could be strengthened with an additional concrete example."
        )

    if not recommendations:
        recommendations.append(
            "Continue practising with different interview questions."
        )

    score = max(0, min(100, score))

    analysis = {
        "score": score,
        "strengths": strengths[:4],
        "weaknesses": weaknesses[:3],
        "idealAnswer": build_ideal_answer(request.question),
        "recommendations": recommendations[:4],
    }

    metrics = {
        "fillerWords": request.fillerCount,
        "duration": request.duration,
        "wordCount": word_count,
        "speakingRate": speaking_rate,
    }

    return {
        "analysis": analysis,
        "metrics": metrics,
    }
