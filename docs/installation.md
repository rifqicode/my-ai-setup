# Install Qark

The repository now contains a root [SKILL.md](../SKILL.md), so it can be discovered by installers that support the Agent Skills format. The skill includes role instructions and references to the Technical Plan template, architecture and plan-storage policy.

## Requirements

- Node.js **22.20+** and npm/npx for the current `skills` CLI.
- At least one installed and authenticated AI CLI (Codex, Antigravity, Claude Code).
- Git accessible from the terminal; authentication is required if this repository becomes private.

## Install globally (recommended)

Run from **any directory**:

```bash
npx skills add rifqicode/qark --skill qark -g -a codex -y
```

- `-g`: install user-wide so the workflow is available in different projects.
- `-a`: select the target coding CLI integrations.
- `-y`: skip the installer's prompts.

For one tool only:

```bash
npx skills add rifqicode/qark --skill qark -g -a codex -y
```

**Project-local instead:** omit `-g` while inside the project root. This installs skill files into that project's agent skill paths.

## Confirm installation

```bash
npx skills ls -g
```

Look for `qark`. Start/restart the corresponding CLI if the skill isn't recognized immediately. In Codex use its skill selector (`/skills` or `$qark` where supported). In Antigravity use the native plugin manager. Claude Code discovers installed skills from its skill directories.

Example request:

> Use qark to research the existing order flow, discuss the risks with me, and prepare a Technical Implementation Plan. Do not implement anything until I approve the plan.

## Project plan location

The installed skill is global; **your project's plan is not**. For example:

```text
your-project/
├── .ai/
│   └── plans/
│       └── PLAN-20261110-order-flow.md
└── src/
```

The Orchestrator creates and maintains the canonical plan in `.ai/plans/`. Codex, Antigravity, and Claude should all target that one file. CLI-specific copies are not automatically synchronized by this skill version.

## Update

```bash
npx skills check
npx skills update -g
```

If updating by name is needed, use `npx skills update qark -g`.

## Important limitation

This is an **installable orchestration skill**, not a turnkey host-native multi-agent runtime. The five `agents/*.md` files describe roles. Whether they run as truly separate native subagents depends on the CLI features, available tools, and permissions. When native delegation isn't present, the workflow falls back to sequential role-scoped execution, with no false claims of parallel work or independent QA.

No Playwright, browser, test runner, MCP server, or extra dependency is automatically installed by this skill. QA reports tools unavailable as BLOCKED/NOT_RUN.

## Official references

- Agent Skills CLI: https://github.com/vercel-labs/skills/blob/main/docs/commands.md
- Codex Agent Skills: https://learn.chatgpt.com/docs/build-skills
- Antigravity: https://github.com/obra/superpowers#antigravity
- Claude skills: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
