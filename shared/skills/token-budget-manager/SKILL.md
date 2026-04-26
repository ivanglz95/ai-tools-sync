---
name: token-budget-manager
description: "Use when a task may consume a large context window or many tokens: long chats, large codebases, repeated file reads, big research tasks, multi-step debugging, migrations, refactors, or when the user asks to save tokens, work cheaply, compact context, summarize progress, or avoid unnecessary reading."
---

# Token Budget Manager

Use this skill to keep work accurate while reducing context bloat.

Standard for every project: "Trabaja ahorrando contexto: indexa primero, lee solo lo necesario y manten un ledger breve de decisiones y pendientes."

## Default Policy

- Start with an index, not full content.
- Prefer command output summaries over pasted files.
- Read narrow ranges after locating exact symbols or lines.
- Keep a running scratch summary for long tasks.
- Reuse prior findings instead of rediscovering them.
- Distinguish "need now" from "nice to know".
- At the start of substantial work, identify the few skills/plugins/MCPs needed and avoid loading or connecting unused ones.
- Prefer the project-tool-advisor routing map before activating tools or MCPs.
- Do not install, connect, or keep MCPs enabled "just in case".
- Batch related instructions into one prompt instead of sending several small follow-up prompts.
- Use plan mode or explicit planning before complex or risky implementation.

## Workflow

1. State the current objective in one sentence.
2. Identify the minimum context, skills, plugins, and MCPs needed for the next decision.
3. Search/index first, then read only targeted files or sections.
4. After each meaningful phase, compress findings into a short ledger:
   - decisions made
   - files touched
   - assumptions
   - unresolved questions
5. Before broad exploration, estimate cost and narrow scope.
6. When a user asks for exhaustive work, use layered passes: index, sample, shortlist, deep read.

## Claude Code Token Rules

- Start unrelated tasks with `/clear` or a fresh conversation.
- Run `/context` near the start of a session to inspect base overhead.
- Run `/cost` during longer sessions to monitor accumulated usage.
- Use `/status` or a status line when available so context/model usage stays visible.
- Disconnect unused MCP servers before starting work; every connected tool definition can add overhead.
- Treat external tool lists as a backlog. Verify maintenance, auth needs, and token overhead before installing.
- Recommend a model tier at the start of substantial tasks so the user can switch manually if automatic model routing is unavailable.
- Keep `CLAUDE.md` concise, ideally under 200 lines, with stack, commands, critical rules, and links to detailed docs instead of pasted detail.
- Store architecture decisions and applied learnings, not the full reasoning process.
- Use bullets of about 15 words for repeated failures and fixes.
- Manually compact around 60% context when the session should continue.
- After 3-4 compacts, ask for a session summary, save the ledger, then `/clear` for a new task.
- Before pauses longer than about 5 minutes, compact or save a ledger so prompt caching expiry is less costly.
- Use cheaper/faster models or subagents for simple exploration when available; reserve expensive models for high-reasoning tasks.

## Model Economy

- Cheap/fast tier: summaries, file indexing, simple Q&A, search review, repetitive browser checks, and narrow verification.
- Balanced/default tier: normal coding, debugging, documentation, tests, frontend work, spreadsheet/document edits, and most implementation.
- Strongest/deep-reasoning tier: architecture, hard bugs, high-risk refactors, security-sensitive work, conflicting research, and final review before risky changes.
- If unsure, start balanced, downgrade repetitive side work, and upgrade only when the failure mode is reasoning quality rather than missing context.

## Token-Saving Tactics

- Use `rg`, `git grep`, `git diff`, `git log --stat`, and directory listings before opening files.
- For generated or vendored folders, read manifests and docs before implementation files.
- Prefer structured parsers for JSON, TOML, YAML, CSV, docs, and PDFs.
- Ask for missing inputs only when guessing would waste more work.
- Write durable summaries to repo docs when the same context will be needed across sessions.
- Keep long catalogs and candidate backlogs in docs, not in always-loaded global instructions.

## When Not To Optimize

Do not save tokens at the cost of correctness for security, legal, medical, financial, or destructive operations. In those cases, read the necessary source material and say why.

