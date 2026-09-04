# TubeSaku WebMCP

**Agent-native discovery for Japanese YouTube data.**

TubeSaku is a Japanese YouTube data service. This repository contains the public WebMCP/browser integration used to let AI agents search TubeSaku data, make personalized selections, explain those selections, and bring the results back into the TubeSaku page.

## Live production demos

- Live Schedule: https://tubesaku.com/stream-schedule/
- Cover-song Planner: https://tubesaku.com/utattemita-ranking/
- Demo video: https://youtu.be/gBGsZgCt6-o
- TubeSaku: https://tubesaku.com/

## What WebMCP adds

### 1. Live Schedule

- `search_live_streams` — search TubeSaku's upcoming Japanese YouTube live schedule.
- `show_live_streams` — render the agent's selected streams as first-party AI Picks on TubeSaku.
- `selection_notes` — optionally return a short reason for each selected stream so the agent's judgment is visible inside the first-party page, not only in chat.

Example request:

> Find three gaming streams for tomorrow, explain why each one fits, and show the picks on TubeSaku.

![Live Schedule Result Sample](images/live-schedule.png)

### 2. Cover-song Planner

- `search_cover_songs` — compare current song demand, recent cover supply, historical supply when available, and early spread performance.
- `show_cover_playlist` — render the agent's choices and build an in-page YouTube listening shortlist.
- `selection_notes` — optionally attach a short reason to each selected song.

Example request:

> I'm a small VTuber planning my next Japanese cover. Find songs that are popular in Japan but not too crowded with recent cover uploads, explain each choice, then create a listening shortlist on TubeSaku.

![Cover Planner Result Sample](images/cover-planner.png)

## Why WebMCP fits this use case

TubeSaku and the user's agent know different things:

- **TubeSaku owns domain evidence** — Japanese YouTube observations, live schedules, chart demand, cover-supply signals, and historical measurements.
- **The agent owns user context** — the user's current request, language, constraints, and preferences available in that conversation.

WebMCP lets those two sources of intelligence meet at the moment of decision.

```text
TubeSaku data
    ↓
WebMCP search tool
    ↓
AI agent reasons / personalizes
    ↓
WebMCP show tool + optional selection reasons
    ↓
TubeSaku first-party UI
```

The result is not limited to a text response in chat. The agent's selected items—and, when supplied, the reasons for those selections—are rendered back into the original TubeSaku page.

## Hackathon scope

TubeSaku and its production YouTube data pipeline existed before the WebMCP Challenge.

During the challenge, this project added the WebMCP layer represented in this repository:

- four browser tools: `search_live_streams`, `show_live_streams`, `search_cover_songs`, and `show_cover_playlist`;
- first-party AI Picks / AI Cover Picks UI flows;
- agent-authored `selection_notes` rendered safely in the TubeSaku page;
- a standalone runnable demo using sample data;
- browser-compatibility and safety handling for WebMCP tool execution.

The repository commit history documents the public implementation work during the challenge period.

## Public repository scope

This repository intentionally contains only:

- the WebMCP browser integration used by the production site;
- a standalone sample demo with sample data;
- architecture and testing documentation.

TubeSaku's production crawlers, private database, ranking pipeline, API keys, and proprietary data-processing logic are not included.

The standalone demo is the fully runnable open-source reference implementation for this submission. The production URLs demonstrate the same WebMCP interaction pattern against TubeSaku's live data.

## Standalone demo

```bash
cd demo
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000/
```

Use a browser/environment with WebMCP enabled, then ask an agent to use the registered tools.

Suggested prompts:

> Find two gaming streams and show them with a short reason for each choice.

> Find low-supply Japanese cover-song opportunities, explain each choice, and create a listening shortlist.

The standalone demo registers four tools:

```text
search_live_streams
show_live_streams
search_cover_songs
show_cover_playlist
```

See [`docs/TESTING.md`](docs/TESTING.md) for production and standalone verification steps.

## Safety and interoperability

The public implementation intentionally keeps the agent-facing boundary narrow:

- Search tools are read-only and mark returned third-party metadata as untrusted.
- Show tools accept only IDs present in the latest search result.
- Agent-authored selection reasons are length-limited, associated only with selected IDs, and rendered as text rather than HTML.
- Production cover links are restricted to HTTPS and approved YouTube hosts before being written into the page.
- Tool execution tolerates WebMCP hosts that omit the optional execution-context argument (`execute(input)` as well as `execute(input, { signal })`).

## Repository structure

```text
.
├── README.md
├── LICENSE
├── src/
│   ├── webmcp-live-schedule.js
│   └── webmcp-cover-planner.js
├── demo/
│   ├── index.html
│   ├── demo.js
│   ├── sample-streams.json
│   └── sample-cover-songs.json
├── docs/
│   ├── ARCHITECTURE.md
│   └── TESTING.md
└── images/
    ├── cover-planner.png
    └── live-schedule.png
```

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — data/experience tool split, trust boundaries, and browser integration design.
- [`docs/TESTING.md`](docs/TESTING.md) — reproducible smoke tests, negative tests, and browser-compatibility checks.

## License

MIT for the code in this public repository. TubeSaku data and the TubeSaku service itself are not covered by this license.
