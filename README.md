# My AI Setup

> Status: Architecture Draft — not yet installable.

Portable AI development workflow intended for Codex CLI, Gemini CLI, and Claude Code. The goal is one GitHub-hosted source of truth that can be installed on a new computer with a simple command.

## Team architecture

| Role | Responsibility |
| --- | --- |
| Orchestrator / Technical Lead | Discuss requirements, develop technical plans, delegate work, collect agent outputs, coordinate fixes, and report results. |
| Coding Agent | Implement scoped code changes according to the agreed technical plan. |
| Test Writer Agent | Write automated tests, covering happy paths, negative scenarios, boundaries, and relevant edge cases. |
| QA Agent | Independently validate the running application using available Playwright, browser, or CLI tools; report reproducible findings. |

## Workflow

1. User discusses requirements and scope with the Orchestrator.
2. Orchestrator prepares a plan; user approves major decisions.
3. Coding Agent implements; Test Writer develops tests (in parallel when safe).
4. QA Agent validates actual application behavior.
5. Findings return to Orchestrator for follow-up delegation.
6. Orchestrator consolidates evidence, unresolved risks, and final status for user.

## Portability decision: Hybrid

Maintain one shared specification of roles and workflow. Use native subagents where supported by the host CLI. Where subagent delegation is unavailable, run role-scoped stages sequentially with explicit handoffs. Do not claim parallel execution or real QA checks unless actually performed.

## Proposed repository structure (not implemented)

```text
my-ai-setup/
├── README.md
├── SKILL.md
├── agents/
│   ├── orchestrator.md
│   ├── coder.md
│   ├── test-writer.md
│   └── qa.md
├── workflows/
│   └── development.md
└── adapters/
    ├── codex/
    ├── gemini/
    └── claude/
```

## Next design topics

- Define handoff contracts and communication between Orchestrator and specialist agents.
- Determine approval boundaries, feedback loops, and parallel vs sequential execution rules.
- Validate one-command install packaging and host-specific adapter behavior.
- Build a cross-CLI proof of concept before treating this architecture as implemented.
