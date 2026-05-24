import json
import re
import httpx
from typing import List, Dict, Any, Optional
from backend.app.config import settings

class AIService:
    @staticmethod
    async def invoke_llm(messages: List[Dict[str, str]], temperature: float = 0.7) -> Dict[str, Any]:
        has_api_key = bool(settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip())
        
        if has_api_key:
            try:
                # Groq uses OpenAI compatible API format
                api_url = settings.GROQ_API_URL
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {settings.GROQ_API_KEY}"
                }
                payload = {
                    "model": "llama-3.3-70b-versatile",
                    "messages": messages,
                    "temperature": temperature
                }
                
                async with httpx.AsyncClient() as client:
                    response = await client.post(api_url, json=payload, headers=headers, timeout=60.0)
                    if response.status_code == 200:
                        return response.json()
                    print(f"[AI Service] Groq API returned non-ok status: {response.status_code}")
            except Exception as e:
                print(f"[AI Service] Error calling Groq API: {e}")

        # Fallback / Mock generator for offline/local development
        print("[AI Service] Using fallback mock AI content generator")
        prompt = messages[-1]["content"] if messages else ""
        is_subject_line = "subject line" in prompt.lower()

        if is_subject_line:
            return {
                "choices": [
                    {
                        "message": {
                            "role": "assistant",
                            "content": json.dumps([
                                "🇵🇰 Pakistan's AI Revolution: Are We Ready?",
                                "5 AI Tools Saving Pakistani Startups 20+ Hours a Week",
                                "NexusAI: Localizing LLMs for Urdu and Regional Languages",
                                "How Pakistani Fintechs are Leveraging Agentic AI",
                                "Is AI the Answer to Pakistan's Freelancer Boom?",
                            ])
                        }
                    }
                ]
            }

        # Generate full issue mock content
        topic_match = re.search(r"about:\s*([^.\n]+)", prompt)
        topic = topic_match.group(1) if topic_match else "AI in Pakistani Business"
        
        mock_full_content = {
            "title": f"NexusAI Digest: {topic}",
            "sections": [
                {
                    "sectionType": "news_roundup",
                    "title": "Global AI Roundup",
                    "content": "### 1. GPT-5 and the Quest for AGI\nOpenAI has reportedly begun training its next-generation frontier model, sparking intense discussions about agentic capabilities.\n\n### 2. Open-Source Llama Continues to Dominate\nMeta's Llama models have crossed 500 million downloads, solidifying open-source dominance in enterprise deployments."
                },
                {
                    "sectionType": "pakistan_spotlight",
                    "title": "Pakistan AI Spotlight",
                    "content": "### Localization of LLMs for Urdu\nLocal researchers in Karachi and Islamabad are collaborating on fine-tuning Llama models for Urdu dialects. This could unlock conversational AI for 150M+ non-English speakers in Pakistan, revolutionizing customer support for local fintechs like Easypaisa and Sadapay.\n\n### AI in Freelancing\nWith Pakistan being one of the largest freelancing hubs globally, the adoption of AI coding assistants (Cursor, GitHub Copilot) has boosted dev productivity by 40%, keeping local agencies highly competitive."
                },
                {
                    "sectionType": "deep_dive",
                    "title": "Deep Dive: Agentic Workflows",
                    "content": "### The Shift from Chatbots to Agents\nIn 2026, the buzz is all about AI Agents that can plan, execute, and self-correct. We analyze how Pakistani logistics and retail operations can use multi-agent systems (like LangGraph) to automate inventory management and client communication.\n\n#### Why it matters:\nInstead of writing simple scripts, companies are now deploying agents that can negotiate rates with local suppliers and automatically dispatch riders."
                },
                {
                    "sectionType": "tool_of_week",
                    "title": "Tool of the Week: Bolt.diy",
                    "content": "### Bolt.diy: Open Source Web App Builder\nAn amazing tool that allows developers to run prompt-to-app engines locally using Ollama or Groq. Perfect for Pakistani developers wanting to bypass expensive API fees.\n\n* **Pros:** Highly customizable, zero token cost if run locally.\n* **Link:** https://github.com/stackblitz-labs/bolt.diy"
                },
                {
                    "sectionType": "prompt_of_week",
                    "title": "Prompt of the Week: The Localizer",
                    "content": "### Local Market Positioning Prompt\nUse this prompt to adapt any global business idea for the Pakistani consumer market:\n\n```text\nAct as a Pakistani strategy consultant. Analyze the following business idea [Insert Idea] and outline: 1) local challenges (e.g., cash-on-delivery preference, internet penetration), 2) regional adaptations needed, and 3) potential local partners.\n```"
                }
            ]
        }

        return {
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": json.dumps(mock_full_content)
                    }
                }
            ]
        }
