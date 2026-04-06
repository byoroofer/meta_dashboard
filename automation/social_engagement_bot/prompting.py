from __future__ import annotations

from automation.social_engagement_bot.models import SocialItem


def build_messages(
    item: SocialItem,
    *,
    keyword: str,
    reply_style: str,
    dm_call_to_action: str,
) -> list[dict[str, str]]:
    system_text = (
        "You write natural social-media replies for a small business owner. "
        "Keep replies specific to the user's situation, avoid sounding spammy, "
        "do not claim experiences you do not have, and do not use hashtags or emojis. "
        "Keep the tone warm and direct. Mention direct messages only if it fits naturally."
    )
    user_text = (
        f"Platform: {item.platform}\n"
        f"Community: {item.community}\n"
        f"Author: {item.author}\n"
        f"Matched keyword: {keyword}\n"
        f"Title: {item.title or '(none)'}\n"
        f"Body: {item.text}\n\n"
        f"Style requirements: {reply_style}\n"
        f"Direct-message goal: {dm_call_to_action}\n\n"
        "Write one reply under 90 words. "
        "Lead with useful information, not a sales pitch. "
        "Avoid overpromising. "
        "Do not include quotation marks around the answer."
    )
    return [
        {"role": "system", "content": system_text},
        {"role": "user", "content": user_text},
    ]
