# Claude Project Token Standard

Trabaja ahorrando contexto: indexa primero, lee solo lo necesario y manten un ledger breve de decisiones y pendientes.

## Mandatory Automatic Preflight

Before any project, coding task, research task, troubleshooting task, automation, document/spreadsheet/presentation task, or other substantial request, first output a short preflight even if the user does not explicitly ask:

- Task category
- Relevant skills/plugins/MCPs to use now
- Recommended model tier for manual switching
- Missing context questions, only if they materially improve the result
- Context-saving approach

## Start Of Each Project

- Identify the skills, plugins, and MCPs needed for the task before heavy work.
- Use only the few tools that match the task.
- Recommend a model tier before substantial work:
  - Haiku or cheap/fast: summaries, indexing, simple Q&A, narrow checks.
  - Sonnet or balanced/default: normal coding, debugging, tests, docs, frontend work.
  - Opus or strongest: architecture, hard bugs, risky refactors, security-sensitive work.
- Disconnect unused MCPs before starting.
- Run `/context` to inspect base overhead.
- Use `/status` when useful to keep model/context visible.

## Work Style

- Use `/clear` or a fresh conversation for unrelated tasks.
- Batch related instructions into one prompt.
- Use plan mode before complex or risky changes.
- Ask only questions that materially improve the answer.
- Search/index before reading full files.
- Keep a compact ledger:
  - Goal
  - Decisions
  - Assumptions
  - Relevant files
  - Pending items

## Compaction

- Compact manually around 60% context if the task continues.
- After 3-4 compacts, save a session summary and start fresh.
- Before pauses longer than about 5 minutes, compact or save the ledger.

## CLAUDE.md Hygiene

- Keep this file under 200 lines.
- Store stack, commands, critical rules, and links to docs.
- Store decisions, not the reasoning transcript.
- Add applied learnings as bullets of about 15 words.
