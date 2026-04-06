from __future__ import annotations

import sys
import time
from typing import Iterable

from automation.social_engagement_bot.config import BotConfig
from automation.social_engagement_bot.facebook_client import FacebookMonitor
from automation.social_engagement_bot.filters import find_matching_keyword, is_reply_eligible
from automation.social_engagement_bot.models import DraftReply, SocialItem
from automation.social_engagement_bot.openai_client import OpenAIResponder
from automation.social_engagement_bot.reddit_client import RedditMonitor
from automation.social_engagement_bot.state import BotState, append_draft


def _iter_sources(config: BotConfig) -> list[tuple[object, set[str]]]:
    sources: list[tuple[object, set[str]]] = []
    if config.enable_reddit:
        reddit = RedditMonitor(
            client_id=config.reddit_client_id,
            client_secret=config.reddit_client_secret,
            username=config.reddit_username,
            password=config.reddit_password,
            user_agent=config.reddit_user_agent,
            subreddits=config.reddit_subreddits,
        )
        sources.append((reddit, reddit.blocked_authors))
    if config.enable_facebook:
        facebook = FacebookMonitor(
            page_access_token=config.facebook_page_access_token,
            page_ids=config.facebook_page_ids,
            graph_version=config.facebook_graph_version,
        )
        sources.append((facebook, facebook.blocked_authors))
    return sources


def _handle_item(
    item: SocialItem,
    *,
    blocked_authors: set[str],
    responder: OpenAIResponder,
    config: BotConfig,
    state: BotState,
    source: object,
) -> None:
    if state.has_processed(item.item_id):
        return
    if not is_reply_eligible(
        item,
        min_text_length=config.min_text_length,
        max_item_age_minutes=config.max_item_age_minutes,
        require_question_or_intent=config.require_question_or_intent,
        blocked_authors=blocked_authors,
    ):
        state.mark_processed(item.item_id)
        return
    keyword = find_matching_keyword((item.title, item.text), config.keywords)
    if not keyword:
        state.mark_processed(item.item_id)
        return

    now_ts = time.time()
    if not state.can_send_reply(now_ts, config.max_replies_per_hour):
        print(f"Rate-limited: skipped {item.platform} item {item.item_id}")
        return

    reply_text = responder.generate_reply(
        item,
        keyword=keyword,
        reply_style=config.reply_style,
        dm_call_to_action=config.dm_call_to_action,
    )
    draft = DraftReply(item=item, keyword=keyword, reply_text=reply_text)

    if config.dry_run:
        append_draft(config.draft_log_file, draft)
        print(f"Drafted reply for {item.platform} item {item.item_id}: {item.permalink}")
    else:
        reply_id = source.post_reply(item.reply_target_id, reply_text)
        state.mark_reply_sent(now_ts)
        print(f"Posted reply {reply_id} for {item.platform} item {item.item_id}")

    state.mark_processed(item.item_id)


def run_once(config: BotConfig, state: BotState, responder: OpenAIResponder) -> None:
    for source, blocked_authors in _iter_sources(config):
        for item in source.fetch_items():
            _handle_item(
                item,
                blocked_authors=blocked_authors,
                responder=responder,
                config=config,
                state=state,
                source=source,
            )
        state.save(config.state_file)


def main() -> int:
    try:
        config = BotConfig.from_env()
        config.ensure_runtime_paths()
        config.validate()
        state = BotState.load(config.state_file)
        responder = OpenAIResponder(config.openai_api_key, config.openai_model)
        print(
            "Bot started. "
            f"dry_run={config.dry_run} "
            f"one_shot={config.one_shot} "
            f"poll_seconds={config.poll_seconds}"
        )
        while True:
            run_once(config, state, responder)
            if config.one_shot:
                print("One-shot run completed.")
                return 0
            time.sleep(config.poll_seconds)
    except KeyboardInterrupt:
        print("Bot stopped by user.")
        return 0
    except Exception as exc:
        print(f"Fatal error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
