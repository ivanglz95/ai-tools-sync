# Recommended Shared Skills And Plugins

## Installed Now

Shared skills installed into both Codex and Claude:

- `argi-consultor-impositivo-contable-laboral`: asesor fiscal, contable y laboral argentino con verificacion obligatoria de fuentes primarias.
- `research-source-sweeper`: broad research, source indexing, and 100-200 candidate source workflows.
- `token-budget-manager`: general context/token saving.
- `file-context-scout`: file and codebase exploration with minimal reads.
- `project-tool-advisor`: recommends relevant tools before starting bigger work.
- `context-clarifier`: asks only necessary questions, selects relevant tools, and keeps context compact.

Claude plugins installed:

- `context7`: current, version-specific software documentation lookup.
- `serena`: semantic code analysis and codebase navigation.
- `github`: GitHub repo, issue, PR, and search integration.
- `claude-mem`: already installed; persistent memory and memory search.

## Optional For 100-200 Source Research

There is no local built-in plugin here that simply "turns every search into 200 sources" without external search infrastructure.

Good MCP candidates:

- Exa MCP: broad web search, code search, company research.
- Tavily MCP: real-time search, extraction, map, crawl.
- Brave Search MCP: web, local, image, video, news, and summarizer tools.

These usually require API keys. Keep keys in each machine's local environment or tool config, never in this repo.

## Token Saving Strategy

- General: use `token-budget-manager` and `claude-mem`.
- Files/codebases: use `file-context-scout`; in Claude, prefer Serena for symbol-level navigation.
- Research: use `research-source-sweeper`; collect URL metadata first, deep-read only the shortlist.
- Start of project: use `project-tool-advisor` to pick only the tools needed for the task.
- Model choice: recommend a model tier at the start. Use cheap/fast for indexing and simple checks, balanced/default for normal work, strongest/deep reasoning for architecture, hard bugs, risky refactors, and final review.

## Compact Routing Matrix

Use this as a decision map, not an install list. Start with installed tools; verify candidates only when a project actually needs them.

| Task | Use Now | Candidate To Verify |
| --- | --- | --- |
| Frontend/UI | Codex frontend guidance, browser-use | frontend-design, web-artifacts-builder |
| Large app/build | project-tool-advisor, context-clarifier, token-budget-manager, plan mode | Taskmaster AI, Superpowers-style planner |
| Current docs | Context7; OpenAI docs for OpenAI work | none |
| Browser testing | browser-use; Playwright if present | none |
| Scraping/extraction | browser/search tools first | Firecrawl MCP |
| Memory/large knowledge | file-context-scout, Serena, claude-mem | graph/RAG memory MCPs |
| PDF/Word | Codex documents skill | dedicated PDF skill |
| Excel/Sheets | Codex spreadsheets skill | none |
| PowerPoint/slides | Codex presentations skill | none |
| Marketing/brand/audit | no default install | marketing skills, brand guide, company audit |
| Research | research-source-sweeper | Exa, Tavily, Brave Search |
| Prompt testing | local tests and eval scripts | Promptfoo/Prompt Fu |
| Video/animation | no default install | Remotion |
| Notes/Obsidian | no default install | Obsidian skill/MCP |
| Skill creation | skill-creator | none |

Rule: do not connect MCPs or install skills "just in case"; each enabled tool adds overhead and maintenance cost.

## Sync Rule Before Installing More

Run:

```powershell
.\scripts\sync-preflight.ps1
```

Then install, regenerate inventory, commit, and push:

```powershell
.\scripts\collect-inventory.ps1
git add .
git commit -m "Update shared AI tools"
git push
```
