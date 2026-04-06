from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

from automation.social_engagement_bot.models import DraftReply


@dataclass
class BotState:
    processed_ids: set[str] = field(default_factory=set)
    reply_timestamps: list[float] = field(default_factory=list)

    @classmethod
    def load(cls, path: Path) -> "BotState":
        if not path.exists():
            return cls()
        payload = json.loads(path.read_text(encoding="utf-8"))
        return cls(
            processed_ids=set(payload.get("processed_ids", [])),
            reply_timestamps=list(payload.get("reply_timestamps", [])),
        )

    def save(self, path: Path) -> None:
        path.write_text(
            json.dumps(
                {
                    "processed_ids": sorted(self.processed_ids),
                    "reply_timestamps": self.reply_timestamps,
                },
                indent=2,
            ),
            encoding="utf-8",
        )

    def has_processed(self, item_id: str) -> bool:
        return item_id in self.processed_ids

    def mark_processed(self, item_id: str) -> None:
        self.processed_ids.add(item_id)

    def trim_reply_window(self, now_ts: float) -> None:
        one_hour_ago = now_ts - 3600
        self.reply_timestamps = [ts for ts in self.reply_timestamps if ts >= one_hour_ago]

    def can_send_reply(self, now_ts: float, max_replies_per_hour: int) -> bool:
        self.trim_reply_window(now_ts)
        return len(self.reply_timestamps) < max_replies_per_hour

    def mark_reply_sent(self, now_ts: float) -> None:
        self.reply_timestamps.append(now_ts)


def append_draft(path: Path, draft: DraftReply) -> None:
    payload: dict[str, Any] = {
        "platform": draft.item.platform,
        "item_id": draft.item.item_id,
        "parent_id": draft.item.parent_id,
        "author": draft.item.author,
        "community": draft.item.community,
        "title": draft.item.title,
        "text": draft.item.text,
        "permalink": draft.item.permalink,
        "created_utc": draft.item.created_utc,
        "reply_target_id": draft.item.reply_target_id,
        "keyword": draft.keyword,
        "reply_text": draft.reply_text,
        "status": draft.status,
    }
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(payload) + "\n")
