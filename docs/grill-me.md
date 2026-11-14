# Grill Me — Requirement and Research Challenge

This is a **review protocol**, not an approval authority or permission to implement. Orchestrator owns the dialogue; no external skill installation is required.

## Trigger and proportionality

- **Stage 1, after intake:** On nontrivial, ambiguous, or material-impact requirements, challenge the problem before committing to a technical solution. Do not interrupt a trivial Fast Path change.
- **Stage 2, after research:** Challenge the evidence-backed interpretation and proposed design before the Technical Plan is submitted for approval. If research is unnecessary, skip this stage rather than inventing findings.
- A user may explicitly invoke **"grill me"** for a deeper review at either stage.
- No fixed question quota: group the few highest-leverage questions and stop when answers would not materially alter scope, behavior, risk or acceptance criteria. No endless interrogation.

## Stage 1 — Requirement challenge

Test: Who benefits and why? Is this the underlying problem or a proposed solution? What behavior is expected, for whom, under which permissions? Which existing behavior must remain? What is intentionally out of scope? What breaks on failure, duplicate, retry or concurrency? How will completion be observed?

Classify each issue as **BLOCKER** (material decision required), **ASSUMPTION** (low-risk default, explicitly labeled), or **SUGGESTION** (optional). Use **concern → consequence → recommendation → specific question**. Explain why each blocker matters. Avoid vague questions and avoid asking for facts already supplied.

## Stage 2 — Research challenge

Challenge source reliability, the exact inspected code path, alternative implementations, compatibility, data migration, failure/rollback paths, concurrency/security and testability. Separate **verified facts**, **inferences**, **unknowns**, and **decisions**. Invite the user to challenge the proposed design; offer a clear recommendation and meaningful trade-off.

**Exit criterion:** No unresolved material blocker; risky assumptions explicitly resolved by user, or scoped out; acceptance criteria include important happy, negative and boundary behavior. Material work then proceeds to a single Technical Plan and explicit approval.

## Output

Concise **findings and challenge questions**, grouped by priority, plus **recommended default**, assumptions, and decisions required. Do not silently treat no answer as consent; do not turn a planning/research request into implementation.
