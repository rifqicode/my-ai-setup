# Plan Storage & Cross-CLI Portability (v0.1)

> Status: Proposed architecture. Host adapters and synchronization tooling are **not yet implemented**.

## Goal

Every project must have a persistent, browsable Technical Implementation Plan file. Switching between Codex, Gemini, and Claude must not create divergent task status or architecture decisions.

## Canonical location (recommended)

Use the **target project root**:

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

- `my-ai-setup` is the **global/shared workflow specification**; it is not the home for project-specific plans.
- One plan, one canonical path. Do **not** allow three agents to separately write three different copies.
- Each CLI adapter receives the same absolute resolved project path at runtime (derived from workspace; **not** hardcoded into Git).
- If the host insists on writing under its own plans directory, the adapter must reconcile/merge to canonical through Orchestrator before the plan is considered current. Prefer links over copies when practical.
- A plan is project state and **should be committed to the target repository** (unless sensitive information makes a private location more appropriate).
- Orchestrator is the single writer of status/decision updates; specialists only return findings.
- Plan ID/version identifies all handoffs. Do not overwrite approved decisions silently.

## If per-CLI root storage is mandatory

A future adapter can expose:
- `.claude/plans/<id>.md`
- `.gemini/plans/<id>.md`
- `.codex/plans/<id>.md`

These must be views of the same canonical document (symlinks when supported, generated copies with conflict detection otherwise), **not independent editable sources**.

## Browser reader

Markdown remains the source of truth. A static docs reader can render the repository's architecture, role specifications, and template. For project-specific plans, point the reader at the project's canonical `.ai/plans` directory or include them in that project's docs build. Do not send private plans or secrets to public static hosting.

## Open implementation checks

1. Host-specific native plan locations/permissions for installed CLI versions.
2. Windows / Unix link behavior and non-link fallback.
3. Version/conflict detection for generated mirrors.
4. Browser rendering of local or private project plans without leaking them.
