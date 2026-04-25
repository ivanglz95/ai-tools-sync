# Recommended Shared Skills And Plugins

## Installed Now

Shared skills installed into both Codex and Claude:

- `research-source-sweeper`: broad research, source indexing, and 100-200 candidate source workflows.
- `token-budget-manager`: general context/token saving.
- `file-context-scout`: file and codebase exploration with minimal reads.
- `project-tool-advisor`: recommends relevant tools before starting bigger work.

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

