from __future__ import annotations

import re
import time
from typing import Iterable, Optional

from automation.social_engagement_bot.models import SocialItem


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip().lower()


def find_matching_keyword(text_parts: Iterable[str], keywords: Iterable[str]) -> Optional[str]:
    haystack = normalize_text(" ".join(text_parts))
    for keyword in keywords:
        candidate = normalize_text(keyword)
        if candidate and candidate in haystack:
            return keyword
    return None


def has_question_or_purchase_intent(text_parts: Iterable[str]) -> bool:
    haystack = normalize_text(" ".join(text_parts))
    if "?" in " ".join(text_parts):
        return True
    intent_markers = (
        "looking for",
        "need",
        "recommend",
        "recommendation",
        "who do you use",
        "can anyone suggest",
        "quote",
        "price",
        "pricing",
        "cost",
        "help",
    )
    return any(marker in haystack for marker in intent_markers)


def is_recent_enough(created_utc: float, max_item_age_minutes: int) -> bool:
    age_seconds = time.time() - created_utc
    return age_seconds <= max_item_age_minutes * 60


def is_reply_eligible(
    item: SocialItem,
    *,
    min_text_length: int,
    max_item_age_minutes: int,
    require_question_or_intent: bool,
    blocked_authors: set[str],
) -> bool:
    text = normalize_text(f"{item.title} {item.text}")
    if len(text) < min_text_length:
        return False
    if item.author.lower() in blocked_authors:
        return False
    if require_question_or_intent and not has_question_or_purchase_intent((item.title, item.text)):
        return False
    return is_recent_enough(item.created_utc, max_item_age_minutes)
