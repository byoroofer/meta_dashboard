from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


def load_env_file(path: Path) -> None:
    if not path.exists():
        raise FileNotFoundError(f"Env file not found: {path}")
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if value.startswith(("\"", "'")) and value.endswith(("\"", "'")) and len(value) >= 2:
            value = value[1:-1]
        os.environ.setdefault(key, value)


def _get_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _get_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None or not value.strip():
        return default
    return int(value)


def _get_list(name: str) -> list[str]:
    raw = os.getenv(name, "")
    return [item.strip() for item in raw.split(",") if item.strip()]


@dataclass(frozen=True)
class BotConfig:
    openai_api_key: str
    openai_model: str
    keywords: list[str]
    reply_style: str
    dm_call_to_action: str
    max_replies_per_hour: int
    max_item_age_minutes: int
    min_text_length: int
    poll_seconds: int
    require_question_or_intent: bool
    one_shot: bool
    dry_run: bool
    enable_reddit: bool
    enable_facebook: bool
    reddit_client_id: str
    reddit_client_secret: str
    reddit_username: str
    reddit_password: str
    reddit_user_agent: str
    reddit_subreddits: list[str]
    facebook_page_access_token: str
    facebook_page_ids: list[str]
    facebook_graph_version: str
    runtime_dir: Path
    state_file: Path
    draft_log_file: Path

    @classmethod
    def from_env(cls) -> "BotConfig":
        base_dir = Path(__file__).resolve().parent
        runtime_dir = base_dir / "runtime"
        env_file = os.getenv("BOT_ENV_FILE")
        if env_file:
            load_env_file(Path(env_file))
        return cls(
            openai_api_key=os.getenv("OPENAI_API_KEY", ""),
            openai_model=os.getenv("OPENAI_MODEL", "gpt-5-mini"),
            keywords=_get_list("BOT_KEYWORDS"),
            reply_style=os.getenv(
                "BOT_REPLY_STYLE",
                "Helpful, concise, and conversational. Avoid sounding scripted.",
            ),
            dm_call_to_action=os.getenv(
                "BOT_DM_CALL_TO_ACTION",
                "If appropriate, invite them to DM for details.",
            ),
            max_replies_per_hour=_get_int("BOT_MAX_REPLIES_PER_HOUR", 12),
            max_item_age_minutes=_get_int("BOT_MAX_ITEM_AGE_MINUTES", 180),
            min_text_length=_get_int("BOT_MIN_TEXT_LENGTH", 30),
            poll_seconds=_get_int("BOT_POLL_SECONDS", 30),
            require_question_or_intent=_get_bool("BOT_REQUIRE_QUESTION_OR_INTENT", True),
            one_shot=_get_bool("BOT_ONE_SHOT", False),
            dry_run=_get_bool("DRY_RUN", True),
            enable_reddit=_get_bool("ENABLE_REDDIT", True),
            enable_facebook=_get_bool("ENABLE_FACEBOOK", True),
            reddit_client_id=os.getenv("REDDIT_CLIENT_ID", ""),
            reddit_client_secret=os.getenv("REDDIT_CLIENT_SECRET", ""),
            reddit_username=os.getenv("REDDIT_USERNAME", ""),
            reddit_password=os.getenv("REDDIT_PASSWORD", ""),
            reddit_user_agent=os.getenv("REDDIT_USER_AGENT", ""),
            reddit_subreddits=_get_list("REDDIT_SUBREDDITS"),
            facebook_page_access_token=os.getenv("FACEBOOK_PAGE_ACCESS_TOKEN", ""),
            facebook_page_ids=_get_list("FACEBOOK_PAGE_IDS"),
            facebook_graph_version=os.getenv("FACEBOOK_GRAPH_VERSION", "v20.0"),
            runtime_dir=runtime_dir,
            state_file=runtime_dir / "state.json",
            draft_log_file=runtime_dir / "drafts.jsonl",
        )

    def ensure_runtime_paths(self) -> None:
        self.runtime_dir.mkdir(parents=True, exist_ok=True)

    def validate(self) -> None:
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY is required.")
        if not self.keywords:
            raise ValueError("BOT_KEYWORDS must include at least one keyword.")
        if not self.enable_reddit and not self.enable_facebook:
            raise ValueError("At least one platform must be enabled.")
        if self.enable_reddit:
            required = {
                "REDDIT_CLIENT_ID": self.reddit_client_id,
                "REDDIT_CLIENT_SECRET": self.reddit_client_secret,
                "REDDIT_USERNAME": self.reddit_username,
                "REDDIT_PASSWORD": self.reddit_password,
                "REDDIT_USER_AGENT": self.reddit_user_agent,
            }
            missing = [name for name, value in required.items() if not value]
            if missing:
                raise ValueError(f"Missing Reddit settings: {', '.join(missing)}")
            if not self.reddit_subreddits:
                raise ValueError("REDDIT_SUBREDDITS is required when Reddit is enabled.")
        if self.enable_facebook:
            if not self.facebook_page_access_token:
                raise ValueError("FACEBOOK_PAGE_ACCESS_TOKEN is required when Facebook is enabled.")
            if not self.facebook_page_ids:
                raise ValueError("FACEBOOK_PAGE_IDS is required when Facebook is enabled.")
