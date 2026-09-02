# Devpost Copy

## Elevator pitch

TubeSaku turns Japanese YouTube data into WebMCP tools, letting AI agents discover streams, pick cover songs, and build playable shortlists.

## Inspiration

AI agents are becoming a new interface for the web, but useful recommendations still depend on data that agents can reliably access and understand. YouTube is especially difficult: search results are noisy, important context is buried in pages, and agents cannot simply crawl everything a human can browse.

TubeSaku already collects and organizes Japanese YouTube data for creators and viewers. We wanted to test a different future for that data: instead of adding another chatbot that tries to replace the website, could an external AI agent use TubeSaku as a trusted data source and then return its decisions back into the TubeSaku experience?

That became our WebMCP project.

## What it does

TubeSaku exposes two WebMCP workflows.

The first is Live Schedule. An agent can search upcoming Japanese YouTube streams by date, time, keyword, category, or debut status. After comparing the results with the user's request, the agent can call a second tool that renders its selected streams directly on the TubeSaku page as AI Picks.

The second is a Cover-song Planner for VTubers, YouTubers, and singers. TubeSaku combines Japanese YouTube Charts with its own observations of recent cover uploads, historical cover supply when available, and early view spread. The agent can use those signals to answer questions such as "What should I cover next?" and then create a playable listening shortlist on TubeSaku using validated YouTube cover examples.

The key idea is that TubeSaku does not hard-code the final recommendation. TubeSaku supplies the evidence; the agent decides what fits the user's goal. This also makes cross-language use natural: an English-speaking user can ask in English, the agent can interpret Japanese TubeSaku data, explain the choice in English, and keep the original song titles intact.

## How we built it

TubeSaku already had a production data pipeline. Local collectors and GCP jobs gather and clean Japanese YouTube observations, including live schedules, YouTube Charts, recent cover uploads, and selected historical cover-supply checks. The results are published to TubeSaku's production service.

For WebMCP, we added small read-only API surfaces and browser-side tools. Each workflow follows the same pattern:

1. a search tool returns structured TubeSaku data;
2. the AI agent compares that data using the user's request and context;
3. a show tool accepts only IDs from the latest search result;
4. TubeSaku renders the agent's choices in the existing first-party page.

For the Cover Planner, the listening UI uses standard YouTube embeds controlled by TubeSaku. Candidate videos are filtered for duration, obvious dance/clip false positives, public availability, and embeddability before they are exposed as listening examples.

## Challenges we ran into

The biggest challenge was data quality. A search for "歌ってみた" ("I tried singing" / cover song) can also return dance Shorts, clips, tutorials, instrumental videos, or unrelated songs with similar English titles. We added multiple validation layers instead of trusting search results directly.

We also learned that the browser lifecycle matters. TubeSaku serves some pages as generated static HTML, so changing a template did not always regenerate the deployed page immediately. During playlist development we also discovered that YouTube's embed playlist parameter does not treat the leading `/embed/VIDEO_ID` as a normal member of the playlist. We ultimately simplified the production player: TubeSaku keeps the selected video IDs itself and changes a normal YouTube iframe when the user presses Previous or Next.

These issues were useful because they pushed the prototype from a demo into something closer to a reliable product workflow.

## Accomplishments that we're proud of

We achieved a complete end-to-end WebMCP interaction on the live TubeSaku site: natural-language request → WebMCP search → agent selection → WebMCP UI action → first-party TubeSaku page update.

The Cover Planner is especially exciting because the user can immediately listen to the evidence behind the recommendation while continuing the conversation with the agent. It turns a dense ranking page into an interactive decision-support experience without hiding or replacing the underlying site.

We also kept the integration small and additive. The normal TubeSaku pages continue to work without WebMCP, while WebMCP-capable agents get a richer structured interface.

## What we learned

WebMCP is most valuable when it is not just an API exposed in the browser. A search-only tool can look very similar to a backend MCP or REST API. The experience becomes distinctly WebMCP when the agent can act inside the current first-party page and give the result back to the user there.

We also learned to separate "data evidence" from "recommendation logic." TubeSaku can provide demand, supply, timing, and performance signals without claiming there is one universal best choice. An agent can combine those signals with the user's language, constraints, and—when available—previously provided preferences or memory to create a much more personal answer.

## What's next for Tubesaku Live Schedule

The current implementation is the first step toward a personalized streaming guide built jointly by TubeSaku and AI agents.

Next we want to connect more of TubeSaku's existing datasets: popular live-streamed games, the creator/streamer database, cover-song trends, and creator profiles. Users should be able to say things like "Build my weekend streaming schedule," "Find smaller creators playing games I like," or "Give me five Japanese songs that fit my past preferences and are not overcrowded with covers," then save and refine those choices directly on TubeSaku.

Longer term, WebMCP can also take advantage of the user's existing first-party TubeSaku session for favorites, saved schedules, premium data, and other personalized actions. Our goal is for TubeSaku to become a high-quality Japanese YouTube data layer for agents while keeping the website itself useful, visible, and interactive.
