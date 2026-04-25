---
name: research-source-sweeper
description: Use for broad web or literature research where the user asks for many sources, source diversity, market scans, competitive research, "200 sources", evidence maps, or exhaustive discovery before synthesis. Helps plan multi-query search, deduplicate sources, preserve citations, and keep large research runs token-efficient.
---

# Research Source Sweeper

Use this skill to turn broad research into a controlled evidence sweep.

## Workflow

1. Define the research question, date sensitivity, geography, languages, and source types.
2. Split into focused queries. Prefer 10-20 precise queries over one vague query.
3. Use the best available source tools:
   - Built-in web search for current facts and general discovery.
   - Exa, Tavily, Brave Search, or similar MCP tools when installed and API keys are configured.
   - Context7 for current software documentation, not general web search.
   - GitHub/search APIs for repositories and issues.
4. Collect only compact metadata first: title, URL, date, publisher, snippet, relevance, and query that found it.
5. Deduplicate by canonical URL, normalized title, and near-identical snippet.
6. Rank sources by relevance, authority, recency, and independence.
7. Fetch full pages only for the shortlist needed to answer.
8. Return a synthesis with citations and a brief "coverage notes" section naming what was searched and what was not.

## High-Volume Targets

For requests like "use 200 sources", do not paste 200 source excerpts into context. Build a source index first, then summarize in layers:

- Discovery target: up to 200 candidate URLs.
- Evidence shortlist: 20-40 high-quality sources.
- Deep-read set: 5-15 sources unless the user asks for a formal bibliography.

When a tool has low per-query result limits, page or batch queries. If the installed search tools cannot reach the requested volume, say exactly what limit was hit and recommend a provider such as Exa, Tavily, or Brave Search MCP.

## Output Pattern

For normal answers:

- Direct answer.
- Key evidence with citations.
- Source coverage summary.
- Gaps or uncertainty.

For research handoffs, create a compact table with:

`id | title | url | date | source_type | relevance | notes`

Keep notes short. Avoid large quotations unless the user asks.

