# Qark

Portable, impact-aware AI development workflow for **Codex, Antigravity, and Claude Code**.

## Architecture & flow

```mermaid
flowchart TD
    U[User request] --> N[Native skill discovery / Claude startup bootstrap]
    N --> O[Shared Orchestrator: intent and impact]
    O -->|Isolated low risk| F[Fast Path: direct change]
    O -->|Uncertain or bug| R[Researcher: evidence-first investigation]
    R -->|Optional skill available| S[Systematic Debugging]
    S --> G{Material impact?}
    R -->|Other / unavailable| GR[Grill Me: research challenge]\n    GR --> G
    O -->|Material impact| GI[Grill Me: intake]\n    GI --> P[Technical Plan + approval]
    G -->|No| F
    G -->|Yes| P
    P --> C[Coder + Test Writer]
    C --> V[Automated verification]
    F --> V
    V --> CR[Code Reviewer gate for nontrivial changes]\n    CR -->|Critical/high: fix and re-review| C\n    CR -->|PASS| Q[QA where appropriate]
    Q --> X[Orchestrator report with evidence]
```

One shared core in [SKILL.md](SKILL.md), six role specs in [agents/](agents/), and native adapter metadata for the three hosts. Subagent execution is host-dependent; the skill never claims unavailable parallelism. Optional skills load on demand, never silently install.

## Setup

**Codex — stable skill installation**

```bash
npx skills add rifqicode/qark --skill qark -g -a codex -y
```

The repo also has `.codex-plugin/plugin.json` and a plugin skill entrypoint for future marketplace packaging; it is **not** claimed to be published in a Codex marketplace. This skill-install path uses Codex's native skill discovery, not a guaranteed session-start hook.

**Antigravity — native plugin**

```bash
agy plugin install https://github.com/rifqicode/qark
agy plugin list
```

Antigravity loads a lightweight always-on rule and discovers task-specific skills on demand. Validate a local checkout with `agy plugin validate --strict ./qark` before distribution; native role files in `agents/` expose specialist agents subject to host permissions.

**Claude Code — local plugin testing**

```bash
git clone https://github.com/rifqicode/qark.git
claude --plugin-dir ./qark
```

This loads the local plugin and its `SessionStart` routing bootstrap for the session. It is not a published marketplace entry.

**Optional integrations** (Caveman, RTK, Systematic Debugging), when installed from the core skill folder:

```bash
node ~/.agents/skills/qark/integrations/setup.mjs --dry-run
node ~/.agents/skills/qark/integrations/setup.mjs --only systematic-debugging
```

The optional installer is not automatically run; actual installed paths vary by host. See [integration setup](integrations/README.md).

**Check adapter files locally**

```bash
node tests/native-adapters-smoke.mjs
```

Native activation in all three tools still requires an end-to-end fresh-session test; static tests cannot prove that a host invoked the right skill.

## Quality gates

- [Grill Me](docs/grill-me.md): question the requirement at intake and challenge research findings before approving a material-impact plan, using **one question per interaction**, a transparent weighted **readiness confidence % (heuristic)**, and updates after each answer. Skip for routine low-risk Fast Path tasks.
- [Code Reviewer](agents/code-reviewer.md): read-only static pre-QA review after integrated automated checks. Critical/high findings require fixes and re-review; runtime QA remains independent.

These are workflow instructions, not proof of native subagent execution. Host capabilities determine whether review is independently delegated or sequential.
