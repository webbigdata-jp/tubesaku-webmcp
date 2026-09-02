# Presentation Video Script (about 2.5–3 minutes)

## 0:00–0:18 — Hook

**Narration**

YouTube has an enormous amount of useful information, but it is not an easy data source for AI agents. Search results are noisy, pages are difficult to crawl reliably, and an agent often cannot see the same context that a human sees.

TubeSaku already collects and organizes Japanese YouTube data. So we asked: what if an AI agent could use TubeSaku as its trusted data layer through WebMCP?

**On screen**
- TubeSaku top page
- Quick cuts of Live Schedule and Cover-song Ranking

## 0:18–0:55 — Demo 1: Live Schedule

**Narration**

Here is TubeSaku Live Schedule. I can simply tell the agent, "I'm free tonight. Pick three interesting streams for me."

The agent calls `search_live_streams`, receives structured live-schedule data from TubeSaku, and chooses the streams that fit my request.

Then it calls `show_live_streams`.

The important part is that the result does not stay inside the chat. The agent updates the TubeSaku page itself and creates my AI Picks in the first-party interface.

**On screen**
- Type the natural-language request
- Briefly show tool activity
- Show AI Picks appearing on TubeSaku

## 0:55–1:40 — Demo 2: Cover-song Planner

**Narration**

The same pattern becomes more powerful with our Cover-song Planner.

Suppose I am a small VTuber and I ask: "What Japanese song should I cover next? Find songs that are popular now, but are not too crowded with recent cover uploads."

TubeSaku gives the agent signals such as current YouTube Charts demand, recent cover supply, historical cover supply when available, and early performance of recent covers.

The agent compares the evidence and selects the songs for this specific user.

Then `show_cover_playlist` creates a listening shortlist directly on TubeSaku. I can play the validated cover examples, move through the selections, and keep discussing the choices with the agent while listening.

**On screen**
- Cover ranking page
- English prompt
- Agent's five picks
- AI COVER PICKS appears
- Play one video, press Next once

## 1:40–2:05 — How it works

**Narration**

Under the hood, TubeSaku keeps the architecture simple.

Our existing data pipeline collects and cleans Japanese YouTube observations. Read-only APIs expose structured data to WebMCP search tools. The agent decides what is relevant, and a second WebMCP tool returns that decision to the TubeSaku UI.

So the flow is: TubeSaku data, agent intelligence, TubeSaku experience.

**On screen**
- Simple architecture diagram

## 2:05–2:30 — Why WebMCP matters

**Narration**

This is different from putting a chatbot inside the website. The agent can bring its own context. If the user has already told the agent what games, creators, or music they like, that context can be combined with TubeSaku's proprietary data.

It also works naturally across languages. A user can ask in English, analyze Japanese trend data, and receive an English explanation while preserving the original Japanese titles.

**On screen**
- English request beside Japanese song titles

## 2:30–2:50 — Close / Future

**Narration**

Next, we want to connect more of TubeSaku: popular games, creator profiles, saved schedules, favorites, and personalized playlists.

Our goal is simple: make TubeSaku the trusted Japanese YouTube data layer for AI agents, while keeping the first-party web experience useful and interactive.

This is TubeSaku with WebMCP.

**On screen**
- Live Schedule → Games Ranking → Cover Planner → Creator Database
- TubeSaku logo / URL
