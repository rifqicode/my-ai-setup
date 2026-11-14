# Herdr integration — visible Qark specialist agents

**Status:** Opt-in, host-dependent. Herdr is a terminal multiplexer, not a native Codex/Claude subagent observer. Qark's ordinary native subagents do not become visible as separate panes automatically. Only **separately launched interactive CLI processes** are shown as individual agents.

Upstream references: https://herdr.dev/tui/docs/agent-automation/ and https://github.com/herdrdev/herdr/blob/master/skills/herdr/SKILL.md . Read the **installed** CLI help before automation; versions can vary.

## Activation
- Trigger when the user explicitly requests Herdr-visible agents or opts into visible mode. Otherwise prefer Qark's normal native delegation or sequential fallback.
- Require an active Herdr environment (e.g. `HERDR_ENV=1`), a working `herdr` binary, an authorized coding agent CLI, and user approval for separate processes. Do **not** automatically install Herdr or alter its configuration.
- For introspection run `herdr --help`, `herdr pane`, and `herdr agent`. Never run bare `herdr` for discovery (it attaches the TUI). Check the real command syntax before modifying panes.
- Preserve working directory and avoid stealing focus. Capture returned JSON pane IDs. Respect session/workspace boundaries and do not operate on unrelated panes.

## Execution model and guarantees
1. Orchestrator stays in the original pane. For independently launchable specialist work (Researcher, Coder, Test Writer, Code Reviewer, QA), create a new pane only when needed and spawn the selected supported CLI agent there.
2. Pass the **approved** plan version/task IDs (or Fast Path scoped instruction), specialist role path, explicit read/write scope, available tools and evidence contract. Keep Grill Me as a one-question-at-a-time conversation in the main pane.
3. Do not run Coder and Test Writer concurrently on the same files. **Pane separation is not filesystem isolation.** Use sequential ownership or user-authorized isolated worktrees/branches before concurrent edits.
4. Read outputs and statuses through Herdr's agent commands. `working`, `blocked`, `done`, `idle`, `unknown` are **terminal UI states**, not Qark verification results. Confirm actual commits, diffs, test output, findings, and handoffs separately.
5. Never pretend an embedded/native subagent is visible as its own pane. If the hosting tool only offers an internal subagent, either use it invisibly or explicitly spawn a separate CLI role process when authorized and supported.
6. Check for an agent already running before retries. Timeout or uncertain UI state does not prove the last prompt failed. Avoid duplicate prompts, edits or agents. Don't close panes or terminate processes without explicit cleanup intent.
7. If Herdr cannot be used, fall back to the standard Qark execution model and clearly report the limitation.

## Illustrative CLI sequence

These commands are **examples**, not automatically executed by this skill. Run only in a real active Herdr pane after validating CLI support:

```bash
test "${HERDR_ENV:-}" = 1 || { echo "Not inside a Herdr pane"; exit 1; }
herdr --help
herdr agent
herdr pane

split=$(herdr pane split --current --direction right --no-focus)
pane_id=$(printf '%s\n' "$split" | jq -r '.result.pane.pane_id')
test -n "$pane_id" && test "$pane_id" != null || exit 1

herdr agent start qark_reviewer --kind codex --pane "$pane_id"
herdr agent prompt qark_reviewer "Read Qark agents/code-reviewer.md and review only the integrated, approved diff. Return evidence-backed findings without writing files." --wait --timeout 120000
herdr agent read qark_reviewer --source recent-unwrapped --lines 120
```

Use unique live-agent names (e.g. `qark_reviewer_2`); the supported `--kind` depends on the locally installed agent. The role prompt above is illustrative and must be augmented with the actual plan/commit reference and path. Herdr CLI variants may have different flags; local `--help` wins over these examples.

## Acceptance test to perform locally
- [ ] Real Herdr session detected without starting another server.
- [ ] A new non-focused pane appears and the actual selected agent CLI starts.
- [ ] A read-only Qark role task arrives and its work/output is visible.
- [ ] Qark Orchestrator collects evidence and distinguishes process state from PASS/FAIL.
- [ ] An unavailable Herdr CLI cleanly falls back without false visibility claims.
- [ ] Concurrent writable roles do not touch overlapping files; no surprise process termination.
