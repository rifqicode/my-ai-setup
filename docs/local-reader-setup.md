# Local Planning Workspace — Run Guide (MVP)

> Status: **Implemented beta; installation and browser E2E not yet verified on a user machine.**
> This is a local interactive reader for *project plans*, distinct from the static Docsify site for this repository.

## Start

Requirements: Node.js 20+ and npm; existing Codex/Claude/Gemini is optional for viewing plans.

First install the workflow skill using the [installation guide](installation.md). The Agent Skills installer **does not install the reader CLI**. To run the companion reader, clone this repository once:

```bash
git clone https://github.com/rifqicode/my-ai-setup.git
cd my-ai-setup
npm install
```

From the **target project root** (e.g. Ekatra), start the reader with the script from the cloned setup repository:

**PowerShell (Windows):**

```powershell
cd C:\path\to\ekatra
$env:AI_PROJECT_ROOT = (Get-Location).Path
node C:\path\to\my-ai-setup\reader\server.mjs
```

**bash (Linux/macOS/WSL):**

```bash
cd /path/to/ekatra
AI_PROJECT_ROOT="$PWD" node /path/to/my-ai-setup/reader/server.mjs
```

The server prints a URL similar to `http://127.0.0.1:4177/?token=...`. Open **the exact URL printed in your terminal** (required for review writes). It binds only to loopback; it does not expose plans to GitHub Pages.

Alternative when working in the *my-ai-setup repository* itself: `npm run docs` (reads that repo's own `.ai/plans/`, not Ekatra's).

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
- This package requires a separate repository clone and npm install; the one-command Agent Skills install alone provides workflow instructions.
- Browser end-to-end testing has not yet been executed here due to unavailable package/network access. Do not treat it as production-hardened.
- If the project contains confidential plans, do not expose the local server outside loopback, and review what belongs in source control.

## Troubleshooting

- **Blank list:** Check `AI_PROJECT_ROOT` and that `.ai/plans/*.md` files exist.
- **403 on commenting:** Use the full URL printed by the server, including its token; avoid opening `127.0.0.1` without the token.
- **Port in use:** Set `AI_DOCS_PORT=4178` (or another free local port) before launching.
- **Plan not refreshing:** Restart the reader after moving or deleting the entire `.ai` directory.
