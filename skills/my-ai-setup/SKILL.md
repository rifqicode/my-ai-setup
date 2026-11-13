---
name: my-ai-setup
description: Impact-aware coding orchestrator for Codex, Antigravity and Claude Code. Use for software features, bug investigation, planning, code changes, testing, and QA; choose Fast Path for low-risk changes and an approved plan for material impact.
---

# My AI Setup — Native Plugin Skill

Read the canonical [root workflow](../../SKILL.md) and [Orchestrator role](../../agents/orchestrator.md) before acting on software-development requests. They define the authoritative routing, permissions, and evidence requirements. Load only specialists that apply to the current task.

## Lightweight router

- **Intent:** An explanation or planning request grants no implementation permission.
- **Fast Path:** For explicitly requested, isolated, reversible, well-understood low-impact wording or UI changes, implement directly and verify proportionately; no duplicate approval or plan.
- **Impact Gate:** If the change may materially affect business flows, security, data integrity, contracts, or architecture, perform targeted research and prepare an approved Technical Plan before implementing that impact.
- **Debugging:** For bugs, regressions, failed tests/builds and unexpected behavior, check whether `systematic-debugging` is installed. Read and use it if available, otherwise follow the Researcher evidence-first process. Do not auto-install it.
- **Delegation:** Only claim native subagents/parallelism if the host actually supports and launches them. Otherwise perform scoped stages sequentially.
- **Evidence:** Never mark QA or tests as passed without observed execution.

This plugin skill is a native discovery entrypoint; the root `SKILL.md` remains the single canonical specification.
