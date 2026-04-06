import unittest

from automation.social_engagement_bot.models import SocialItem
from automation.social_engagement_bot.prompting import build_messages


class PromptingTests(unittest.TestCase):
    def test_build_messages_includes_dm_goal_and_keyword(self) -> None:
        item = SocialItem(
            platform="reddit",
            item_id="1",
            parent_id=None,
            author="poster",
            community="cleaning",
            title="Need cleaners",
            text="Looking for a move out cleaning crew.",
            permalink="https://example.com",
            created_utc=0,
            reply_target_id="t3_test",
        )
        messages = build_messages(
            item,
            keyword="move out cleaning",
            reply_style="Helpful and concise.",
            dm_call_to_action="Invite them to DM for a quote if it feels natural.",
        )
        combined = "\n".join(message["content"] for message in messages)
        self.assertIn("move out cleaning", combined)
        self.assertIn("Invite them to DM for a quote", combined)
        self.assertIn("Need cleaners", combined)


if __name__ == "__main__":
    unittest.main()
