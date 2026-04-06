from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class SocialItem:
    platform: str
    item_id: str
    parent_id: Optional[str]
    author: str
    community: str
    title: str
    text: str
    permalink: str
    created_utc: float
    reply_target_id: str


@dataclass(frozen=True)
class DraftReply:
    item: SocialItem
    keyword: str
    reply_text: str
    status: str = "pending_review"
