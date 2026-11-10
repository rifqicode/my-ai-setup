# Technical Implementation Plan — [Feature Name]

> Template v1.0 · Status: DRAFT · Plan ID: PLAN-YYYYMMDD-001 · Version: 0.1 · Owner: Orchestrator

**Location convention:** Store each live plan in the **target project's** `.ai/plans/<plan-id>.md`, not in the installed `my-ai-setup` skills repository. Codex, Gemini and Claude adapters must resolve the *same canonical plan*. Where a CLI requires its own plan directory, create a link or generated read-only mirror, never a second editable source. Avoid absolute device-specific paths. See [Plan Storage](../docs/plan-storage.md).

**Adaptive:** Keep the sections relevant to the scope; expand when system risk requires it. Do not invent file paths, tests, or verification results.

## 1. Overview

**Problem:** [What is happening / missing?]

**Target outcome:** [Observable expected behavior]

**Scope:** [In scope]

**Out of scope:** [Explicit exclusions]

**Constraints:** [Security, backward compatibility, cost, deadline]

## 2. Existing system & research

> Researcher provides file/symbol references for inspected facts. If not verified, explicitly state assumptions.

| Area | Verified finding / source | Impact |
| --- | --- | --- |
| [Module / flow] | [Path, symbol, branch/ref] | [Constraint or reuse] |

## 3. Technical design & decisions

**Proposed approach:** [Solution and rationale]

**Data / control flow:** [Describe or include Mermaid diagram if useful]

**Contracts affected:** [API, schema, states, event formats or N/A]

**Trade-offs:** [Meaningful alternative and why rejected]

| Decision | Status | Rationale |
| --- | --- | --- |
| [Design choice] | PROPOSED / APPROVED | [Why] |

## 4. Acceptance criteria

| ID | Behavior | Priority |
| --- | --- | --- |
| AC-01 | Given [precondition], when [action], then [observable outcome] | MUST |
| AC-02 | Given [failure/boundary], when [action], then [safe outcome] | MUST |

## 5. Execution & progress

> The Orchestrator alone consolidates agent status changes here. The plan is the **task contract**; do not create redundant copies for specialists.

| Task ID | Owner | Deliverable | Dependencies | Criteria | Work status | Verification | Evidence / blocker |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RES-01 | Researcher | Verify existing architecture | — | — | TODO | NOT_RUN | — |
| IMP-01 | Coder | Implement scoped change | RES-01 | AC-01 | TODO | NOT_RUN | — |
| TEST-01 | Test Writer | Automated tests | Stable contract | AC-01, AC-02 | TODO | NOT_RUN | — |
| QA-01 | QA | Real-app validation | IMP-01, TEST-01 | AC-01, AC-02 | TODO | NOT_RUN | — |

**Work statuses:** TODO / IN_PROGRESS / BLOCKED / DONE / SKIPPED

**Verification statuses:** NOT_RUN / PASS / FAIL / BLOCKED

`DONE` is **not** equivalent to `PASS`. Report actually executed commands, outputs, and observed QA results.

## 6. Test strategy — Test Writer

| Test ID | Acceptance criterion | Scenario and expected result | Layer | Status |
| --- | --- | --- | --- | --- |
| T-01 | AC-01 | Happy path [expected result] | Unit / Integration | TODO |
| T-02 | AC-02 | Relevant edge/failure path [expected result] | Unit / Integration / E2E | TODO |

**Coverage gaps:** [If any]

## 7. Runtime QA — QA Agent

**Environment / tested ref:** [URL, build hash, branch or CLI target]

**Tools actually available:** [Browser, Playwright, API, CLI etc.]

| QA ID | Criterion | Action & expected behavior | Result | Evidence |
| --- | --- | --- | --- | --- |
| Q-01 | AC-01 | [End-to-end scenario] | NOT_RUN | — |
| Q-02 | AC-02 | [Failure/negative scenario] | NOT_RUN | — |

If runtime/tool access is missing, record BLOCKED/NOT_RUN. Do not claim PASS from static review.

## 8. Risks, blockers & open questions

| ID | Scenario | Impact | Mitigation / verification | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| R-01 | [Risk] | [Consequence] | [Mitigation and test] | [Agent] | OPEN |

## 9. Integration & delivery gate

- [ ] Agent work integrated without unresolved edit conflicts
- [ ] Required lint/typecheck/build/tests executed and results captured
- [ ] QA performed on the combined testable state, or gaps are explicitly BLOCKED/NOT_RUN
- [ ] High-impact defects addressed or explicitly accepted by user
- [ ] Scope changes and significant design deviations approved
- [ ] Final summary includes changed modules, evidence, open risks and decisions

**Final disposition:** NOT_READY / READY_FOR_REVIEW / APPROVED_BY_USER

**Release/deployment authorization:** Separate explicit permission when applicable.
