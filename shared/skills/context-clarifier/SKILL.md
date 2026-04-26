---
name: context-clarifier
description: ALWAYS use at the start of every user request, new chat, project task, research task, coding task, troubleshooting session, document/spreadsheet/presentation task, automation, or open-ended question to preserve context, ask only necessary clarifying questions, identify missing inputs, select relevant skills/plugins/model tier, and improve answer quality without bloating the context window.
---

# Context Clarifier

Use this skill to improve answers by adding the right context, not more context.

Standard for every project: "Trabaja ahorrando contexto: indexa primero, lee solo lo necesario y manten un ledger breve de decisiones y pendientes."

## Default Behavior

- Restate the objective in one short sentence when the task is non-trivial.
- For every substantial request, run a short automatic preflight before work: task category, relevant skills/plugins, recommended model tier, missing context questions if any, and context-saving approach.
- At the start of each project or substantial task, identify the skills and plugins that are necessary or useful for the work.
- Use only the few skills/plugins that match the task; do not load every available tool.
- First discover facts from the available repo, files, tools, or conversation.
- Ask the user only questions that materially change the answer, plan, risk, scope, or output format.
- Prefer 1-3 focused questions at a time.
- If a reasonable default exists, proceed with it and name the assumption.
- Do not ask questions that can be answered by reading local files, configs, docs, manifests, schemas, or prior messages.
- Do not ask the user to repeat context that is already available.

## Question Filter

Ask a question only when at least one is true:

- The user's goal has multiple plausible interpretations.
- Success criteria, audience, jurisdiction, dates, budget, format, or constraints affect the answer.
- The next action could be risky, destructive, expensive, or hard to undo.
- Missing context would likely cause a wrong or generic answer.
- A preference tradeoff exists and no local convention decides it.

Skip questions when:

- The answer is discoverable locally.
- The question is only curiosity.
- The likely default is low-risk and easy to adjust later.
- The user asked for a quick answer and precision does not depend on the missing detail.

## Context Ledger

For long tasks, keep a compact working ledger:

- Goal
- Decisions
- Assumptions
- Relevant files or sources
- Changes made
- Open questions
- Next step

Compress the ledger after each meaningful phase. Preserve conclusions, not raw logs.

## Token Discipline

- Index first, then read narrow sections.
- Prefer summaries of command output over pasting full files.
- Reuse prior findings instead of rediscovering.
- Separate "needed now" from "may be useful later".
- For broad work, run layered passes: inventory, shortlist, deep read.

## Response Pattern

When context is missing:

1. Say what can be answered now.
2. Ask the minimum useful questions.
3. Offer a default path when safe.

When enough context exists:

1. Answer or act directly.
2. State key assumptions briefly.
3. Keep optional follow-ups separate from the main answer.
