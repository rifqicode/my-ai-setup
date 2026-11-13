# Plan Storage & Cross-CLI Portability (v0.1)

> Status: Proposed architecture. Host adapters and synchronization tooling are **not yet implemented**.

## Goal

Materially impactful implementation requires one persistent Technical Implementation Plan Markdown file in the target project. Fast Path changes and read-only requests do not require one. Switching between Codex, Gemini, and Claude must not create divergent task status or architecture decisions.

## Canonical location (recommended)

When the Impact Gate requires a plan, use the **target project root**:

```text
example-project/
├── .ai/
│   └── plans/
│       └── PLAN-20261110-feature.md   # canonical, writable
├── .claude/
│   └── plans/                         # optional generated link/read-only mirror
├── .gemini/
│   └── plans/                         # optional generated link/read-only mirror
├── .codex/
│   └── plans/                         # optional generated link/read-only mirror
└── src/
```

- `qark` is the **global/shared workflow specification**; it is not the home for project-specific plans.
- One plan, one canonical path. Do **not** allow three agents to separately write three different copies.
- Each CLI adapter receives the same absolute resolved project path at runtime (derived from workspace; **not** hardcoded into Git).
- If the host insists on writing under its own plans directory, the adapter must reconcile/merge to canonical through Orchestrator before the plan is considered current. Prefer links over copies when practical.
- A required plan is project state and **should be committed to the target repository** (unless sensitive information makes a private location more appropriate). Do not create placeholder plans for Fast Path.
- Orchestrator is the single writer of plan status/decision updates when a plan exists. Fast Path progress and evidence may be reported directly; specialists only return findings.
- Plan ID/version identifies all handoffs. Do not overwrite approved decisions silently.

## If per-CLI root storage is mandatory

A future adapter can expose:
- `.claude/plans/<id>.md`
- `.gemini/plans/<id>.md`
- `.codex/plans/<id>.md`

These must be views of the same canonical document (symlinks when supported, generated copies with conflict detection otherwise), **not independent editable sources**.

## Open implementation checks

1. Host-specific native plan locations/permissions for installed CLI versions.
2. Windows / Unix link behavior and non-link fallback.
3. Version/conflict detection for generated mirrors.
