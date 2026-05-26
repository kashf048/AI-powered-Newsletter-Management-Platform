import json
import logging
import httpx
from typing import List, Dict, Any, Optional
from backend.app.config import settings

logger = logging.getLogger(__name__)

_GROQ_MODEL = "llama-3.3-70b-versatile"
_REQUEST_TIMEOUT = 90.0
_MAX_RETRIES = 2


class AIService:
    @staticmethod
    async def invoke_llm(
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        """
        Call the Groq LLM API with retry logic.
        Falls back to deterministic mock content if no API key is configured.
        """
        has_api_key = bool(settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip())

        if has_api_key:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            }
            body = {
                "model": _GROQ_MODEL,
                "messages": messages,
                "temperature": temperature,
            }

            last_error: Optional[Exception] = None
            for attempt in range(1, _MAX_RETRIES + 1):
                try:
                    async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT) as client:
                        response = await client.post(
                            settings.GROQ_API_URL,
                            json=body,
                            headers=headers,
                        )
                        if response.status_code == 200:
                            return response.json()
                        elif response.status_code == 429:
                            logger.warning(
                                "Groq API rate limited (attempt %d/%d)", attempt, _MAX_RETRIES
                            )
                        else:
                            logger.warning(
                                "Groq API returned %d on attempt %d/%d",
                                response.status_code,
                                attempt,
                                _MAX_RETRIES,
                            )
                except httpx.TimeoutException as e:
                    last_error = e
                    logger.warning(
                        "Groq API timeout on attempt %d/%d", attempt, _MAX_RETRIES
                    )
                except Exception as e:
                    last_error = e
                    logger.error(
                        "Groq API error on attempt %d/%d: %s", attempt, _MAX_RETRIES, e
                    )

            logger.error(
                "All Groq API attempts failed. Falling back to mock content. Last error: %s",
                last_error,
            )
        else:
            logger.info(
                "GROQ_API_KEY not configured — using offline mock content generator."
            )

        return AIService._mock_response(messages)

    @staticmethod
    def _mock_response(messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """Return deterministic mock content for offline/development use."""
        prompt = messages[-1]["content"] if messages else ""
        is_subject_line = "subject line" in prompt.lower()

        if is_subject_line:
            content = json.dumps([
                "🇵🇰 Pakistan's AI Revolution: Are We Ready?",
                "5 AI Tools Saving Pakistani Startups 20+ Hours a Week",
                "NexusAI: Localizing LLMs for Urdu and Regional Languages",
                "How Pakistani Fintechs Are Leveraging Agentic AI",
                "Is AI the Answer to Pakistan's Freelancer Boom?",
            ])
        else:
            import re
            topic_match = re.search(r"about:\s*([^.\n]+)", prompt)
            topic = topic_match.group(1).strip() if topic_match else "AI in Pakistani Business"

            mock_issue = {
                "title": f"NexusAI Digest: {topic}",
                "sections": [
                    {
                        "sectionType": "news_roundup",
                        "title": "Global AI Roundup",
                        "content": (
                            "### 1. GPT-5 and the Quest for AGI\n"
                            "OpenAI has reportedly begun training its next-generation frontier model, "
                            "sparking intense discussions about agentic capabilities.\n\n"
                            "### 2. Open-Source Llama Continues to Dominate\n"
                            "Meta's Llama models have crossed 500 million downloads, solidifying "
                            "open-source dominance in enterprise deployments."
                        ),
                    },
                    {
                        "sectionType": "pakistan_spotlight",
                        "title": "Pakistan AI Spotlight",
                        "content": (
                            "### Localization of LLMs for Urdu\n"
                            "Local researchers in Karachi and Islamabad are collaborating on "
                            "fine-tuning Llama models for Urdu dialects. This could unlock "
                            "conversational AI for 150M+ non-English speakers in Pakistan.\n\n"
                            "### AI in Freelancing\n"
                            "With Pakistan being one of the largest freelancing hubs globally, "
                            "the adoption of AI coding assistants has boosted dev productivity by 40%."
                        ),
                    },
                    {
                        "sectionType": "deep_dive",
                        "title": "Deep Dive: Agentic Workflows",
                        "content": (
                            "### The Shift from Chatbots to Agents\n"
                            "In 2026, the buzz is all about AI Agents that can plan, execute, "
                            "and self-correct. We analyze how Pakistani logistics and retail "
                            "operations can use multi-agent systems to automate workflows."
                        ),
                    },
                    {
                        "sectionType": "tool_of_week",
                        "title": "Tool of the Week: Bolt.diy",
                        "content": (
                            "### Bolt.diy: Open Source Web App Builder\n"
                            "An amazing tool that allows developers to run prompt-to-app engines "
                            "locally using Ollama or Groq. Perfect for Pakistani developers wanting "
                            "to bypass expensive API fees.\n\n"
                            "* **Pros:** Highly customizable, zero token cost if run locally.\n"
                            "* **Link:** https://github.com/stackblitz-labs/bolt.diy"
                        ),
                    },
                    {
                        "sectionType": "prompt_of_week",
                        "title": "Prompt of the Week: The Localizer",
                        "content": (
                            "### Local Market Positioning Prompt\n"
                            "Use this prompt to adapt any global business idea for the Pakistani "
                            "consumer market:\n\n"
                            "```\nAct as a Pakistani strategy consultant. Analyze the following "
                            "business idea [Insert Idea] and outline: 1) local challenges, "
                            "2) regional adaptations needed, and 3) potential local partners.\n```"
                        ),
                    },
                ],
            }
            content = json.dumps(mock_issue)

        return {
            "choices": [{"message": {"role": "assistant", "content": content}}],
            "usage": {"total_tokens": len(content) // 4, "prompt_tokens": 0, "completion_tokens": len(content) // 4},
        }
