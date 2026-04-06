# Social Engagement Bot

Python bot scaffold for Reddit, Facebook Page posts/comments, and OpenAI response generation.

This bot is designed to:

- poll Reddit submissions/comments and Facebook Page posts/comments
- detect configured keywords
- generate a natural reply with OpenAI
- optionally post the reply automatically
- softly invite the user to continue in direct messages

## Important Operating Notes

- Default mode is `DRY_RUN=true`. In that mode, the bot writes reply drafts to `runtime/drafts.jsonl` and does not post anything.
- You can point the bot at a local env file with `BOT_ENV_FILE=path\to\file.env`.
- `BOT_ONE_SHOT=true` runs a single polling cycle and exits, which is the safest way to validate setup.
- Auto-posting on social platforms can violate platform rules if used aggressively. Keep rate limits conservative and verify your app/account permissions before turning `DRY_RUN` off.
- The Facebook portion assumes you are monitoring assets you administrate and have a valid Page access token.
- Drafts are recorded with a `status` field. New drafts start as `pending_review`.

## Files

- `bot.py`: main polling loop
- `config.py`: env parsing
- `facebook_client.py`: Graph API polling/posting helpers
- `reddit_client.py`: Reddit polling/posting helpers
- `openai_client.py`: OpenAI Responses API wrapper
- `filters.py`: keyword and reply eligibility logic
- `state.py`: local dedupe/rate-limit persistence
- `prompting.py`: response prompt construction

## Environment

Copy `.env.social-bot.example` to your preferred local env file and export those values before running.

Required groups:

- OpenAI: `OPENAI_API_KEY`
- Reddit: `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USERNAME`, `REDDIT_PASSWORD`, `REDDIT_USER_AGENT`
- Facebook: `FACEBOOK_PAGE_ACCESS_TOKEN`, `FACEBOOK_PAGE_IDS`
- Bot config: `BOT_KEYWORDS`

## Run

```powershell
py -m venv automation\social_engagement_bot\.venv
automation\social_engagement_bot\.venv\Scripts\python -m pip install -r automation\social_engagement_bot\requirements.txt
automation\social_engagement_bot\.venv\Scripts\python -m automation.social_engagement_bot.bot
```

One-shot dry run:

```powershell
$env:BOT_ENV_FILE="automation\social_engagement_bot\.env.social-bot.example"
$env:BOT_ONE_SHOT="true"
automation\social_engagement_bot\.venv\Scripts\python -m automation.social_engagement_bot.bot
```

## Tests

Lightweight unit tests use the Python standard library `unittest`.

```powershell
automation\social_engagement_bot\.venv\Scripts\python -m unittest discover -s automation\social_engagement_bot\tests -p "test_*.py"
```

## Suggested Rollout

1. Start with `DRY_RUN=true`.
2. Start with `BOT_ONE_SHOT=true` until the filters look right.
3. Review `runtime/drafts.jsonl`.
4. Remove noisy keywords and tighten `BOT_REQUIRE_QUESTION_OR_INTENT` if needed.
5. Enable only one platform at a time.
6. Turn `DRY_RUN=false` only after validating the generated replies.
