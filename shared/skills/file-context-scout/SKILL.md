---
name: file-context-scout
description: Use for file-heavy or codebase-heavy tasks where the user wants to save tokens or avoid reading too much: finding relevant files, understanding a repo, editing large projects, auditing configs, comparing generated artifacts, or working with large logs, docs, PDFs, spreadsheets, or source trees.
---

# File Context Scout

Use this skill to find the smallest useful file context before editing or explaining.

## Search Order

1. Inspect repo status and top-level layout.
2. Search names with `rg --files` or native directory listing.
3. Search content with `rg` or `git grep`.
4. Read manifests and entry points before deep modules.
5. Open only the line ranges or sections needed.
6. Expand outward from imports, tests, routes, or call sites.

## File Handling Rules

- Never read dependency folders, caches, logs, or generated files unless the task is about them.
- Prefer `git diff` for changed files.
- Prefer AST, language server, or semantic tools when available. For Claude, use Serena when installed for symbol navigation and references.
- For huge logs, sample head/tail and search error signatures first.
- For PDFs/docs/spreadsheets, use available document tools or parsers before dumping raw text.

## Editing Pattern

Before edits, record:

- files likely involved
- why each file matters
- exact behavior being changed
- tests or validation commands to run

After edits, summarize only changed behavior and validation results. Avoid restating whole files.

