---
name: token-budget-manager
description: Use when a task may consume a large context window or many tokens: long chats, large codebases, repeated file reads, big research tasks, multi-step debugging, migrations, refactors, or when the user asks to save tokens, work cheaply, compact context, summarize progress, or avoid unnecessary reading.
---

# Token Budget Manager

Use this skill to keep work accurate while reducing context bloat.

## Default Policy

- Start with an index, not full content.
- Prefer command output summaries over pasted files.
- Read narrow ranges after locating exact symbols or lines.
- Keep a running scratch summary for long tasks.
- Reuse prior findings instead of rediscovering them.
- Distinguish "need now" from "nice to know".

## Workflow

1. State the current objective in one sentence.
2. Identify the minimum context needed for the next decision.
3. Search/index first, then read only targeted files or sections.
4. After each meaningful phase, compress findings into a short ledger:
   - decisions made
   - files touched
   - assumptions
   - unresolved questions
5. Before broad exploration, estimate cost and narrow scope.
6. When a user asks for exhaustive work, use layered passes: index, sample, shortlist, deep read.

## Token-Saving Tactics

- Use `rg`, `git grep`, `git diff`, `git log --stat`, and directory listings before opening files.
- For generated or vendored folders, read manifests and docs before implementation files.
- Prefer structured parsers for JSON, TOML, YAML, CSV, docs, and PDFs.
- Ask for missing inputs only when guessing would waste more work.
- Write durable summaries to repo docs when the same context will be needed across sessions.

## When Not To Optimize

Do not save tokens at the cost of correctness for security, legal, medical, financial, or destructive operations. In those cases, read the necessary source material and say why.

