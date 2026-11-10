# Agent Handoff & Execution Architecture (v0.4)

> Status: **Draft**. This document defines proposed orchestration behavior, not an implemented runtime. See [README](../README.md).

## 1. Goal

Coordinate five portable roles (Orchestrator, Researcher, Coder, Test Writer, QA) using one approved **Technical Implementation Plan** as the source of truth. Minimize redundant documents, conflicting edits, unverified completion claims, and uncontrolled rework.

## 2. Control plane and execution plane

- **Orchestrator is the control plane.** Owns user communication, research requests, plan approval, task assignment, dependency ordering, result aggregation, tracking, triage, and final reporting.
- **Specialists are the execution plane.** Receive a bounded assignment identified by a task ID *in the Technical Plan*; report progress and evidence, but do not amend approved scope or approve their own work.
- **Researcher is read-only.** May be invoked before planning or again during triage when further codebase investigation is necessary.
- **QA is independent of implementation.** Validates running behavior and reports defects, not silent production-code fixes.
- **Human is the decision authority** for materially altered scope, major architecture changes, risky irreversible operations, and final release authorization where applicable.

## 3. Handoff protocol (no extra Task Contract document)

The Orchestrator points the agent to the **approved plan version and assigned task IDs**. The assignment also states relevant dependencies and current execution context. These are references to the plan, not a second competing specification.

Each handoff identifies:

| Field | Meaning |
| --- | --- |
| Plan reference/version | Which agreed plan to follow |
| Task IDs and owner | Exact work to perform |
| Dependencies | What must be complete or available |
| Scope boundaries | Modules/files allowed and forbidden when known |
| Acceptance criteria | Relevant requirements in the plan |
| Environment/tool access | What may actually be run |
| Expected evidence | Code diff, test output, logs, screenshots, repro, etc. |

Each agent reports back:

| Field | Meaning |
| --- | --- |
| Task ID | Link to the agreed plan |
| Work status | TODO / IN_PROGRESS / BLOCKED / DONE / SKIPPED |
| Result summary | What actually changed or was investigated |
| Evidence | File references, diffs, test commands/results, logs, screenshots, or repro steps |
| Verification status | NOT_RUN / PASS / FAIL / BLOCKED, independently of work completion |
| Blockers / limitations | Missing tools, failed steps, unknowns, decisions needed |
| Recommended follow-up | Optional next action for the Orchestrator |

**No evidence means no verified claim.** Do not report tests as passed unless they were executed and results observed.

## 4. Execution sequence

```mermaid
flowchart TD
    U[User: requirement] --> O[Orchestrator: discuss]
    O -->|when codebase context needed| R[Researcher: inspect codebase]
    R -->|grounded findings| O
    O --> P[Technical Implementation Plan]
    P --> A{Major decisions approved?}
    A -- No --> U
    A -- Yes --> S{Safe parallel execution?}
    S -- Yes --> C[Coder: scoped implementation]
    S -- Yes --> T[Test Writer: scoped tests]
    S -- No --> E[Sequential role-scoped tasks]
    C --> I[Integration gate]
    T --> I
    E --> I
    I --> Q[QA: runtime validation]
    Q --> F{Findings or blockers?}
    F -- Fix code --> C
    F -- Fix tests --> T
    F -- Investigate --> R
    F -- Scope/design decision --> U
    F -- No material issues --> X[Orchestrator: consolidated report]
    X --> U
```

The diagram is conceptual. Host CLI support dictates whether genuine subagents or isolated environments are available.

## 5. Parallel execution rules

**Parallel is allowed only if all are true:**

1. Requirements, interface boundaries, and relevant acceptance criteria are sufficiently stable.
2. Neither task depends on the unfinished output of the other, or a stable contract exists for the dependency.
3. Write ownership is isolated (disjoint files/modules, dedicated branches/worktrees, or another supported isolation mechanism).
4. The selected CLI actually supports the intended parallel delegation, with adequate permissions.
5. The Orchestrator can reconcile both outputs and run integration checks before QA.

**Run sequentially if:**
- Both agents need to edit the same file or shared generated artifacts.
- Tests require a changing API/interface without an agreed contract.
- There is no safe isolation mechanism.
- An earlier task must finish to unblock the next task.
- Parallelism would cost more coordination than it saves.

**Default ownership:** Coder owns production code; Test Writer owns test code and fixtures. Shared config, snapshots, schemas, migrations, and lockfiles are coordinated by Orchestrator. Neither role silently rewrites the other's work. In a shared working tree, never concurrently edit overlapping areas.

Parallel work is not considered integrated until combined changes are checked for conflicts, test results are revalidated on the combined state, and the Orchestrator records the outcome.

## 6. Progress and verification

**Work statuses:** TODO, IN_PROGRESS, BLOCKED, DONE, SKIPPED.

**Verification statuses:** NOT_RUN, PASS, FAIL, BLOCKED.

- Agent updates on meaningful transitions: started, completed, blocked, and retest.
- Orchestrator alone consolidates task statuses into the Technical Plan to avoid write races.
- A Coder task may be DONE with verification NOT_RUN; it does **not** mean the feature is QA-approved.
- QA may finish its assigned validation task (DONE) while reporting verification FAIL and defects.
- A BLOCKED item includes reason and an owner/action to unblock.
- SKIPPED includes explicit justification.

Example (illustrative only):

| Task | Owner | Work | Verification | Evidence |
| --- | --- | --- | --- | --- |
| IMP-01 | Coder | DONE | PASS | Commit/diff + unit-test log |
| TEST-01 | Test Writer | DONE | PASS | Test files + run output |
| QA-01 | QA | DONE | FAIL | Reproduction steps + screenshot |
| IMP-02 | Coder | BLOCKED | NOT_RUN | Waiting for approved API decision |

## 7. Integration and QA gates

Before QA, Orchestrator confirms a testable combined state and reports:
- Which changes are present and whether merge/file conflicts were resolved.
- Checks actually run (e.g., lint, typecheck, unit/integration tests, build).
- Known failures, missing checks, tool limitations, and the exact test target/environment.

QA validates against the **approved plan**, not just assertions made by Coder or Test Writer. Where supported, QA uses Playwright/browser/CLI and captures enough evidence to reproduce a defect. When the required environment or tool is unavailable, report verification BLOCKED or NOT_RUN rather than PASS.

## 8. Finding and rework routing

A QA finding includes scenario, expected result, actual result, steps to reproduce, evidence, severity, and affected plan task/criterion when identifiable.

Orchestrator triages:

| Finding | Route |
| --- | --- |
| Production behavior defect | Coder, then regression test and QA retest |
| Missing/incorrect automated test | Test Writer |
| Unknown current behavior or root cause | Researcher |
| Environment/tool unavailable | Unblock environment or report limitation |
| Requirement conflict or material design change | Discuss with user; update/re-approve Technical Plan |

Avoid endless retry loops. **After two failed fix/retest attempts on the same finding, require a root-cause review** rather than another unexamined patch. This is a review trigger, not a hard ban on further work.

## 9. Orchestrator final report

For each scoped deliverable, communicate:
- Implemented work and its linked plan task IDs.
- Agent progress with work status and verification status separately.
- Actually executed checks and QA evidence.
- Remaining defects, risks, skipped work, and blockers.
- Decisions requiring user attention.
- Whether the result is ready for review, or why it is not.

Do not equate all tasks DONE with production-ready. Deployment/release requires its own permission and checks where appropriate.

## 10. Portability rules

- Maintain these **logical contracts** independent of CLI vendor.
- Use host-native subagents when offered, otherwise sequential role-scoped execution.
- Do not imply real isolation, independent review, or parallel execution where unavailable.
- The installer/adapters (future work) map common roles and workflow to Codex, Gemini, and Claude capabilities.
- Keep credentials, local paths, or device-specific runtime details outside shared specifications.

## 11. Open design questions

1. Exact Technical Plan Markdown status layout and versioning policy.
2. How to store run evidence and screenshots without bloating the repository.
3. Which CLI isolation models can safely execute parallel tasks.
4. How much automatic rework is permitted before user involvement.
