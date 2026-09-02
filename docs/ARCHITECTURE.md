# Architecture

TubeSaku follows a simple pattern: **Data tools + Experience tools**.

```text
TubeSaku data pipeline
  ├─ YouTube live schedule observations
  ├─ YouTube Charts (Japan)
  ├─ recent cover-song observations
  └─ historical cover-supply checks
          │
          ▼
read-only TubeSaku APIs
          │
          ▼
WebMCP search tools
  ├─ search_live_streams
  └─ search_cover_songs
          │
          ▼
AI agent chooses / explains / translates
          │
          ▼
WebMCP experience tools
  ├─ show_live_streams
  └─ show_cover_playlist
          │
          ▼
TubeSaku first-party page UI
```

## Why two tools per workflow?

The search tool exposes structured evidence without forcing TubeSaku to decide what the user should choose. The agent can use the user's request and context to make the decision. The show tool then brings that decision back into the first-party TubeSaku experience.

## Production safety notes

- Search tools are read-only.
- UI actions accept only IDs returned by the latest search result.
- Third-party titles are rendered as text, not injected HTML.
- Cover listening examples are filtered before being exposed to the agent/player.
- Production data collectors and proprietary ranking logic are intentionally not included in this public repository.
