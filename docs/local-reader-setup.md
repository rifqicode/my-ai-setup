# Local Planning Workspace — Run Guide (MVP)

> **Status: Beta; first-use bootstrap added, not yet browser E2E verified.** This is the project-local interactive reader, not the public Docsify site.

## Preferred setup: install skill once

Requirements: Node.js 20+ with npm, and a CLI that supports Agent Skills (Codex, Gemini CLI or Claude Code).

```bash
npx skills add rifqicode/my-ai-setup --skill my-ai-setup -g -a codex -a gemini-cli -a claude-code -y
```

Open your **target project**, start the supported AI CLI, invoke `my-ai-setup`, and ask it to brainstorm or prepare a plan. The skill now instructs Orchestrator to:

1. Detect the current project root and execute its bundled `reader/start.mjs`.
2. Reuse a running reader for the same project, or install reader npm dependencies on first use and launch it in the background.
3. Open a browser best-effort and print the actual loopback URL.
4. Save plans under `.ai/plans/`. The reader updates as those files change.

**Important:** `npx skills add` only installs files. Lazy auto-start occurs **on first skill use** and only when AI CLI is permitted to run terminal commands. Initial dependency download requires a working npm connection. The browser is local-only and does not invoke AI automatically when comments are written.

## Fallback: start manually

If the AI host cannot execute the bootstrap automatically, locate the installed skill directory containing `SKILL.md` and run:

```bash
node "<installed-skill-directory>/reader/start.mjs" --project "<path-to-ekatra>"
```

The bootstrap prints the live local URL; opening it manually is always supported. Use `--no-open` to avoid automatically launching a browser.

To debug startup failures interactively, start the server directly from the installed skill location (with dependencies installed), setting `AI_PROJECT_ROOT` to your target project. The default port is dynamically selected; `AI_DOCS_PORT` overrides it.

## Create a plan

Your active project must contain a Markdown file such as:

```text
ekatra/.ai/plans/PLAN-20261110-partial-refund.md
```

The Orchestrator skill is instructed to save plans there. For a quick manual smoke test:

```bash
mkdir -p .ai/plans
printf '# Ekatra Partial Refund\n\n## Overview\nInvestigate existing payment flow.\n' > .ai/plans/PLAN-20261110-partial-refund.md
```

On Windows PowerShell, create `.ai/plans` manually and use `Set-Content` to write the sample Markdown instead.

## Using the browser

1. Select a plan in the left sidebar; the document renders in the middle.
2. Highlight text in the plan. The review editor opens on the right.
3. Write a comment and press **Add comment**.
4. The server saves it in `.ai/reviews/<plan-id>.json` and broadcasts refresh events.
5. Return to Codex/Claude/Gemini and ask: **"Read .ai/reviews/<plan-id>.json and address OPEN comments against .ai/plans/<plan-id>.md. Discuss architecture changes before editing the approved scope."**
6. When satisfied, resolve comments and press **Approve revision**. An edited plan invalidates its earlier revision approval.
7. Agent status tables in the plan are displayed as readable Markdown; no separate runtime tracker is needed.

The reader deliberately does **not** automatically wake or invoke an AI CLI. Comment storage + manual CLI review is the MVP handoff.

## What is implemented

- Local browser UI with plan sidebar and server-rendered, sanitized Markdown.
- File-change notifications through Server-Sent Events.
- Text selection → inline review comment stored in project-local JSON.
- Open/resolved comments and revision-aware approval.
- Markdown task-status tables visible in the document.
- Loopback-only server, randomized write token, origin validation, limited routes, and no arbitrary shell execution.

## Current limitations

- Mermaid **is not rendered as an interactive diagram** in this MVP; fenced Mermaid source is shown as code. Diagram rendering is planned.
- Text comments use exact selected quotes; anchors may become unmatched after substantial edits. Unmatched quotes are flagged instead of silently reattached.
- No embedded AI chat, auto-dispatch, native subagent registration, or automatic Playwright installation.
- The skill invokes its bundled reader bootstrap on first project-planning use when terminal execution is allowed. First run downloads npm dependencies; offline first use requires dependencies to already exist.
- Browser end-to-end testing has not yet been executed here due to unavailable package/network access. Do not treat it as production-hardened.
- If the project contains confidential plans, do not expose the local server outside loopback, and review what belongs in source control.

## Troubleshooting

- **Blank list:** Check `AI_PROJECT_ROOT` and that `.ai/plans/*.md` files exist.
- **403 on commenting:** Use the full URL printed by the server, including its token; avoid opening `127.0.0.1` without the token.
- **Port in use:** Set `AI_DOCS_PORT=4178` (or another free local port) before launching.
- **Plan not refreshing:** Restart the reader after moving or deleting the entire `.ai` directory.
