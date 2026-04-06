from __future__ import annotations

from typing import Iterable

import requests

from automation.social_engagement_bot.models import SocialItem


class FacebookMonitor:
    def __init__(self, *, page_access_token: str, page_ids: list[str], graph_version: str) -> None:
        self._page_access_token = page_access_token
        self._page_ids = page_ids
        self._graph_version = graph_version
        self._base_url = f"https://graph.facebook.com/{graph_version}"

    @property
    def blocked_authors(self) -> set[str]:
        return {"unknown"}

    def _get(self, edge: str, params: dict[str, str]) -> dict:
        response = requests.get(
            f"{self._base_url}/{edge}",
            params={**params, "access_token": self._page_access_token},
            timeout=30,
        )
        response.raise_for_status()
        return response.json()

    def _post(self, edge: str, data: dict[str, str]) -> dict:
        response = requests.post(
            f"{self._base_url}/{edge}",
            data={**data, "access_token": self._page_access_token},
            timeout=30,
        )
        response.raise_for_status()
        return response.json()

    def fetch_items(self, limit_per_page: int = 10, comment_limit: int = 10) -> Iterable[SocialItem]:
        fields = "id,message,created_time,from,permalink_url"
        for page_id in self._page_ids:
            posts = self._get(
                f"{page_id}/posts",
                {
                    "limit": str(limit_per_page),
                    "fields": f"id,message,created_time,permalink_url,comments.limit({comment_limit}){{id,message,created_time,from,permalink_url}}",
                },
            )
            for post in posts.get("data", []):
                message = post.get("message", "") or ""
                yield SocialItem(
                    platform="facebook",
                    item_id=f"facebook_post_{post['id']}",
                    parent_id=None,
                    author=((post.get("from") or {}).get("name") or "unknown"),
                    community=page_id,
                    title="",
                    text=message,
                    permalink=post.get("permalink_url", ""),
                    created_utc=_facebook_time_to_unix(post.get("created_time", "")),
                    reply_target_id=post["id"],
                )
                for comment in (post.get("comments") or {}).get("data", []):
                    yield SocialItem(
                        platform="facebook",
                        item_id=f"facebook_comment_{comment['id']}",
                        parent_id=post["id"],
                        author=((comment.get("from") or {}).get("name") or "unknown"),
                        community=page_id,
                        title="",
                        text=comment.get("message", "") or "",
                        permalink=comment.get("permalink_url", post.get("permalink_url", "")),
                        created_utc=_facebook_time_to_unix(comment.get("created_time", "")),
                        reply_target_id=comment["id"],
                    )

    def post_reply(self, reply_target_id: str, reply_text: str) -> str:
        payload = self._post(f"{reply_target_id}/comments", {"message": reply_text})
        return str(payload.get("id", ""))


def _facebook_time_to_unix(value: str) -> float:
    from datetime import datetime

    if not value:
        return 0.0
    normalized = value.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(normalized).timestamp()
    except ValueError:
        return datetime.strptime(value, "%Y-%m-%dT%H:%M:%S%z").timestamp()
