---
name: project-tool-advisor
description: Use at the beginning of a new chat, project, repository setup, automation request, research task, codebase task, or whenever the user asks what skill/plugin/tool should be used. Recommends relevant installed or missing skills/plugins before heavy work starts and checks the sync workflow first.
---

# Project Tool Advisor

Use this skill as a lightweight preflight before starting substantial work.

## Preflight

1. Check whether the current directory is the sync repo or a project repo.
2. If working in the sync repo, prefer `git pull --ff-only`, then inspect `git status`.
3. If installing or changing skills/plugins, run the inventory script after changes and commit the manifest updates.
4. Do not load every skill. Recommend only the few that match the task.

## Recommendation Map

- Broad research: `research-source-sweeper`; consider Exa, Tavily, or Brave Search MCP if high-volume search is required.
- Current software docs: Context7 plugin or OpenAI docs skill for OpenAI-specific work.
- Token saving: `token-budget-manager`.
- Large repos or many files: `file-context-scout`; use Serena in Claude when available.
- GitHub work: GitHub MCP/plugin or GitHub CLI.
- Browser/localhost testing: browser-use in Codex or Playwright where installed.
- Claude long-term memory: claude-mem and its `mem-search` skill.
- Documents/spreadsheets/slides: Codex documents, spreadsheets, presentations skills.

## Output Pattern

When advising, be brief:

1. Best tool/skill now.
2. Why it fits.
3. Missing plugin or API key if any.
4. Exact next command when installation or sync is needed.

