from __future__ import annotations

from automation.social_engagement_bot.prompting import build_messages
from automation.social_engagement_bot.models import SocialItem


class OpenAIResponder:
    def __init__(self, api_key: str, model: str) -> None:
        from openai import OpenAI

        self._client = OpenAI(api_key=api_key)
        self._model = model

    def generate_reply(
        self,
        item: SocialItem,
        *,
        keyword: str,
        reply_style: str,
        dm_call_to_action: str,
    ) -> str:
        messages = build_messages(
            item,
            keyword=keyword,
            reply_style=reply_style,
            dm_call_to_action=dm_call_to_action,
        )
        response = self._client.responses.create(
            model=self._model,
            input=messages,
        )
        text = (response.output_text or "").strip()
        if not text:
            raise RuntimeError("OpenAI returned an empty reply.")
        return text
