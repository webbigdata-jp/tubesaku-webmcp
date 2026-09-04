# Testing TubeSaku WebMCP

This document provides reproducible checks for both the production pages and the standalone public demo.

## 1. Production smoke test — Live Schedule

Open:

https://tubesaku.com/stream-schedule/

Use a WebMCP-capable agent/browser and ask something similar to:

> Find three gaming live streams for tomorrow, explain briefly why each one fits, and feature the top picks on my Live Schedule page.

Expected flow:

1. Agent calls `search_live_streams`.
2. The tool returns structured TubeSaku live-stream candidates.
3. Agent compares the candidates.
4. Agent calls `show_live_streams` using only IDs from that search result.
5. The **AI Picks** section appears on the TubeSaku page.
6. If `selection_notes` were supplied, each matching card shows an **AI selection reason**.

Expected property: the page is still usable normally when WebMCP is unavailable.

## 2. Production smoke test — Cover-song Planner

Open:

https://tubesaku.com/utattemita-ranking/

Suggested prompt:

> I'm a small VTuber. Find three Japanese songs with strong demand but relatively low recent cover supply, explain each choice, and create a listening shortlist on TubeSaku.

Expected flow:

1. Agent calls `search_cover_songs`.
2. Agent compares demand/supply signals.
3. Agent calls `show_cover_playlist` using only IDs from that search result.
4. **AI Cover Picks** appears in the page.
5. Matching selection reasons are displayed.
6. When validated cover examples are available, the in-page **Listening Playlist** is populated.

## 3. Standalone demo

Run:

```bash
cd demo
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000/
```

The demo uses only the sample JSON files in this repository.

Suggested Live prompt:

> Find two gaming streams and show them with a short reason for each choice.

Suggested Cover prompt:

> Find low-supply Japanese cover-song opportunities, explain each choice, and create a listening shortlist.

Expected registered tools:

```text
search_live_streams
show_live_streams
search_cover_songs
show_cover_playlist
```

## 4. Browser-compatibility regression test

A WebMCP host may omit the optional execution-context argument.

The read tools must therefore work with both forms:

```js
execute(input, { signal })
execute(input)
```

Regression condition: neither search tool should throw an error such as:

```text
Cannot destructure property 'signal' of 'undefined'
```

The implementation uses a defensive default:

```js
execute: async (input = {}, { signal } = {}) => {
  // ...
}
```

## 5. Negative test — unknown Live ID

1. Run `search_live_streams`.
2. Call `show_live_streams` with a `video_id` that was **not** returned by the latest search.

Expected: the show tool rejects the request and does not render the unknown item.

## 6. Negative test — unknown Cover ID

1. Run `search_cover_songs`.
2. Call `show_cover_playlist` with a `song_id` that was **not** returned by the latest search.

Expected: the show tool rejects the request and does not render the unknown item.

## 7. Negative test — mismatched selection reason

1. Search normally.
2. Select one valid item.
3. Include a `selection_notes` entry whose ID is not one of the selected IDs.

Expected: the mismatched note is ignored and is not rendered.

## 8. Text-rendering test

Use a selection reason containing characters such as:

```text
<b>not HTML</b> & "quoted text"
```

Expected: the string is displayed literally as text. It must not create DOM markup.

## 9. Production Cover URL test

The production Cover Planner validates navigation URLs before rendering them.

Expected:

- HTTPS YouTube URL → may be rendered.
- non-HTTPS URL → rejected.
- `javascript:` URL → rejected.
- HTTPS URL on an unrelated host → rejected for YouTube navigation links.

## 10. Static checks

From the repository root:

```bash
node --check src/webmcp-live-schedule.js
node --check src/webmcp-cover-planner.js
node --check demo/demo.js
```

All commands should exit successfully.

## 11. What this test suite is intended to prove

The public implementation demonstrates more than tool registration:

```text
search → structured evidence → agent decision → validated show action → first-party UI
```

The optional selection reasons make the agent's decision visible in the same first-party UI while retaining the latest-search ID boundary.
