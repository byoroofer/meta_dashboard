import time
import unittest

from automation.social_engagement_bot.filters import (
    find_matching_keyword,
    has_question_or_purchase_intent,
    is_reply_eligible,
)
from automation.social_engagement_bot.models import SocialItem


class FilterTests(unittest.TestCase):
    def test_find_matching_keyword_returns_original_keyword(self) -> None:
        match = find_matching_keyword(
            ["Need a move out cleaning before Friday."],
            ["deep clean", "move out cleaning"],
        )
        self.assertEqual(match, "move out cleaning")

    def test_is_reply_eligible_rejects_blocked_author(self) -> None:
        item = SocialItem(
            platform="reddit",
            item_id="1",
            parent_id=None,
            author="AutoModerator",
            community="cleaning",
            title="",
            text="Need help with house cleaning this week.",
            permalink="https://example.com",
            created_utc=time.time(),
            reply_target_id="t1_test",
        )
        self.assertFalse(
            is_reply_eligible(
                item,
                min_text_length=10,
                max_item_age_minutes=60,
                require_question_or_intent=False,
                blocked_authors={"automoderator"},
            )
        )

    def test_is_reply_eligible_rejects_stale_item(self) -> None:
        item = SocialItem(
            platform="facebook",
            item_id="2",
            parent_id=None,
            author="Someone",
            community="page-1",
            title="",
            text="Looking for a cleaning service recommendation.",
            permalink="https://example.com",
            created_utc=time.time() - 7200,
            reply_target_id="fb_1",
        )
        self.assertFalse(
            is_reply_eligible(
                item,
                min_text_length=10,
                max_item_age_minutes=30,
                require_question_or_intent=False,
                blocked_authors=set(),
            )
        )

    def test_question_or_intent_detection_accepts_buying_signal(self) -> None:
        self.assertTrue(has_question_or_purchase_intent(["Looking for a house cleaning quote this week."]))

    def test_is_reply_eligible_rejects_non_intent_when_required(self) -> None:
        item = SocialItem(
            platform="reddit",
            item_id="3",
            parent_id=None,
            author="poster",
            community="cleaning",
            title="Sunday reset",
            text="Just sharing photos of my clean kitchen.",
            permalink="https://example.com",
            created_utc=time.time(),
            reply_target_id="t3_test",
        )
        self.assertFalse(
            is_reply_eligible(
                item,
                min_text_length=10,
                max_item_age_minutes=60,
                require_question_or_intent=True,
                blocked_authors=set(),
            )
        )


if __name__ == "__main__":
    unittest.main()
