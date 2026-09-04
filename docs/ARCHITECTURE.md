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
          ├─ selected IDs
          └─ optional selection_notes
          │
          ▼
TubeSaku first-party page UI
```

## Why two tools per workflow?

The search tool exposes structured evidence without forcing TubeSaku to decide what the user should choose. The agent can combine that evidence with the user's request and conversational context.

The show tool then brings the decision back into the first-party TubeSaku experience.

This creates a deliberate split:

- **website = domain expert**
- **agent = user-context expert**
- **WebMCP = decision bridge**

The page can therefore stay useful as a normal website while also becoming agent-operable when a WebMCP-capable browser is present.

## Selection reasons as part of the experience

Both show tools support optional `selection_notes`.

Live example:

```json
{
  "video_ids": ["..."],
  "selection_notes": [
    {
      "video_id": "...",
      "reason": "Matches the requested time window and gaming category."
    }
  ]
}
```

Cover example:

```json
{
  "song_ids": ["..."],
  "selection_notes": [
    {
      "song_id": "...",
      "reason": "High demand with relatively low recent cover supply."
    }
  ]
}
```

Reasons are not trusted as HTML. They are normalized, length-limited, associated only with IDs that were actually selected, and rendered via `textContent`/text nodes.

## Trust boundary

The browser integration treats data in three categories:

1. **First-party tool code** — trusted application code.
2. **TubeSaku/API results containing third-party YouTube metadata** — useful data, but titles/channel names are marked untrusted for the agent.
3. **Agent-authored presentation text** — accepted only through bounded schema fields and rendered as text.

The search tools use:

```js
annotations: {
  readOnlyHint: true,
  untrustedContentHint: true,
}
```

The show tools do not accept arbitrary objects from the agent. They accept IDs and resolve those IDs against the **most recent search result stored in the page session**.

## Latest-search capability pattern

The show tools cannot display arbitrary video/song IDs.

```text
search_* returns IDs
        ↓
latest result stored in sessionStorage
        ↓
show_* receives requested IDs
        ↓
IDs are checked against latest result
        ↓
unknown IDs are rejected
```

This keeps the mutation surface narrow and makes the show operation a capability derived from a preceding read.

## URL handling

The production Live Schedule and Cover Planner sanitize URLs before writing them to DOM link/image attributes.

For the Cover Planner in particular:

- URLs must be HTTPS.
- YouTube navigation links must match approved YouTube hosts.
- invalid/unapproved URLs are not rendered as links.

This is intentionally separate from text escaping: `textContent` protects text rendering, while URL allowlisting protects navigation attributes.

## Browser interoperability

Some WebMCP hosts invoke tools with an execution context:

```js
execute(input, { signal })
```

Others may invoke the same tool without the second argument:

```js
execute(input)
```

The tool implementations therefore use defensive defaults:

```js
execute: async (input = {}, { signal } = {}) => {
  // ...
}
```

Show tools likewise default their argument object so a malformed host invocation produces an application-level validation error rather than an immediate JavaScript destructuring exception.

## Session behavior

Production pages use `sessionStorage` for the latest search result and current AI Picks/playlist state.

This provides two useful properties:

- show tools can validate IDs against the immediately preceding search;
- an AI-generated result can be restored during the same browser session without storing it server-side.

No long-term user preference store is required for the WebMCP flow itself.

## Production safety notes

- Search tools are read-only.
- UI actions accept only IDs returned by the latest search result.
- Third-party titles are rendered as text, not injected HTML.
- Agent-authored selection reasons are text-only and length-limited.
- Cover navigation URLs are HTTPS/host-validated before rendering.
- Cover listening examples are filtered before being exposed to the agent/player.
- WebMCP execution-context arguments are optional for host interoperability.
- Production data collectors and proprietary ranking logic are intentionally not included in this public repository.
