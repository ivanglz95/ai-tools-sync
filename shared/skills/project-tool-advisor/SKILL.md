---
name: project-tool-advisor
description: ALWAYS use at the beginning of every new chat, project, coding task, repository setup, automation request, research task, codebase task, troubleshooting task, document/spreadsheet/presentation task, or whenever the user asks what skill/plugin/tool/model should be used. Performs a mandatory preflight that recommends relevant installed or missing skills/plugins/MCPs and a model tier before heavy work starts, while checking the sync workflow first.
---

# Project Tool Advisor

Use this skill as the mandatory preflight before starting substantial work.

Standard for every project: first identify the skills and plugins needed for the task, then use only the few that match.

## Preflight

Always do this before substantial work, even if the user does not explicitly ask:

1. Check whether the current directory is the sync repo or a project repo.
2. Classify the task before heavy work starts.
3. Recommend 1-4 relevant installed skills/plugins/MCPs, plus any missing candidates that are worth verifying.
4. Recommend a model tier for the task so the user can switch manually when automatic routing is unavailable.
5. Ask only missing-context questions that materially change the result.
6. State the context-saving approach: index first, read narrow, keep a short ledger.
7. If working in the sync repo, prefer `git pull --ff-only`, then inspect `git status`.
8. If installing or changing skills/plugins, run the inventory script after changes and commit the manifest updates.
9. Do not load every skill. Recommend only the few that match the task.

## Recommendation Map

- Frontend/UI: Codex frontend guidance plus browser-use for local testing. Candidate to verify before install: frontend-design or web-artifacts-builder.
- Large apps: `context-clarifier`, `token-budget-manager`, plan mode, and task decomposition. Candidate to verify: Taskmaster AI or Superpowers-style planning.
- Current software docs: Context7 plugin; use OpenAI docs skill for OpenAI-specific work.
- Browser/testing: browser-use in Codex or Playwright where installed.
- Scraping/extraction: prefer existing browser/search tools first. Candidate to verify: Firecrawl MCP or similar extraction service.
- Memory/knowledge: `file-context-scout`, Serena in Claude, and claude-mem/mem-search for persistent memory.
- PDFs: Codex documents skill if PDF/document workflow is available. Candidate to verify: dedicated PDF skill.
- Excel/Sheets: Codex spreadsheets skill.
- PowerPoint/slides: Codex presentations skill.
- Word/DOCX: Codex documents skill.
- Marketing/branding/audit: no default install. Candidate backlog: marketing skills, brand guide, company audit.
- Research: `research-source-sweeper`; consider Exa, Tavily, or Brave Search MCP for high-volume source discovery.
- Prompt testing: use local tests first. Candidate to verify: Promptfoo/Prompt Fu.
- Video/animation: candidate to verify only when needed: Remotion.
- Notes/Obsidian: candidate to verify only for active Obsidian users.
- Skill creation: `skill-creator` for new Codex skills; keep new skills small and task-specific.
- GitHub work: GitHub MCP/plugin or GitHub CLI.
- Token saving: `token-budget-manager`.

## Model Routing

Recommend by tier, not exact version, unless the user asks for a specific provider.

- Cheap/fast: Claude Haiku or Codex mini. Use for summaries, file indexing, simple Q&A, grep/search review, formatting suggestions, and low-risk edits.
- Balanced/default: Claude Sonnet or Codex default. Use for normal coding, debugging, frontend implementation, documentation, tests, data cleanup, and most project work.
- Strongest/deep reasoning: Claude Opus or Codex frontier/high-reasoning. Use for architecture, large refactors, hard bugs, security-sensitive changes, complex planning, and final review before risky changes.
- Research/document work: start balanced; upgrade to strongest only when synthesis is complex or source conflicts matter.
- Browser/testing/checks: cheap/fast for repetitive exploration; balanced for diagnosing failures; strongest only for stubborn multi-system bugs.
- Subagents: prefer cheap/fast for bounded exploration and verification; use balanced for implementation workers; reserve strongest for tasks that require judgment.

## Availability Labels

- Installed: already available in this environment or synced skill set.
- Candidate: useful idea from external lists, but verify repo quality, maintenance, auth, and token overhead before install.
- Avoid by default: do not install or connect just in case.

## Output Pattern

When advising, be brief:

1. Task category.
2. Installed tools/skills to use now.
3. Recommended model tier.
4. Missing context questions, if any.
5. Candidate tools to verify only if needed.
6. Exact next command when installation or sync is needed.

