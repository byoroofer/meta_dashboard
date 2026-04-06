from __future__ import annotations

from typing import Iterable

from automation.social_engagement_bot.models import SocialItem


class RedditMonitor:
    def __init__(
        self,
        *,
        client_id: str,
        client_secret: str,
        username: str,
        password: str,
        user_agent: str,
        subreddits: list[str],
    ) -> None:
        import praw

        self._reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            username=username,
            password=password,
            user_agent=user_agent,
        )
        self._subreddits = subreddits
        self._own_username = username.lower()

    @property
    def blocked_authors(self) -> set[str]:
        return {self._own_username, "automoderator", "[deleted]"}

    def fetch_items(self, limit_per_kind: int = 25) -> Iterable[SocialItem]:
        subreddit = self._reddit.subreddit("+".join(self._subreddits))
        for submission in subreddit.new(limit=limit_per_kind):
            yield SocialItem(
                platform="reddit",
                item_id=f"reddit_submission_{submission.id}",
                parent_id=None,
                author=getattr(submission.author, "name", "[deleted]"),
                community=submission.subreddit.display_name,
                title=submission.title or "",
                text=submission.selftext or "",
                permalink=f"https://reddit.com{submission.permalink}",
                created_utc=float(submission.created_utc),
                reply_target_id=submission.fullname,
            )
        for comment in subreddit.comments(limit=limit_per_kind):
            yield SocialItem(
                platform="reddit",
                item_id=f"reddit_comment_{comment.id}",
                parent_id=getattr(comment, "parent_id", None),
                author=getattr(comment.author, "name", "[deleted]"),
                community=comment.subreddit.display_name,
                title="",
                text=comment.body or "",
                permalink=f"https://reddit.com{comment.permalink}",
                created_utc=float(comment.created_utc),
                reply_target_id=comment.fullname,
            )

    def post_reply(self, reply_target_id: str, reply_text: str) -> str:
        thing = self._reddit.info([reply_target_id])
        target = next(iter(thing), None)
        if target is None:
            raise RuntimeError(f"Unable to resolve Reddit target {reply_target_id}")
        reply = target.reply(reply_text)
        return getattr(reply, "id", "")
