# Grill Me — Interactive Requirement and Research Challenge

This is an **Orchestrator-led conversation protocol**, not a separate runtime, objective probability estimator, approval authority, or permission to implement.

## When to run
- **Intake:** For ambiguous/nontrivial or material-impact requirements, before committing to a solution.
- **Post-research:** After evidence-backed investigation, challenge conclusions, alternatives and risks before submitting the Technical Plan.
- Explicit **"grill me"** requests invoke deeper challenge even during a discussion.
- Skip unnecessary ceremony for clearly scoped, reversible Fast Path tasks. Do not trigger endless questions.

## Mandatory conversational behavior — ONE question at a time
1. **Assess first** using information already in the current conversation and the code/research actually inspected. Do not ask what is already known.
2. Show current stage, **Readiness confidence NN%**, the highest-leverage uncertainty, *why it matters* (one short sentence), then ask **exactly ONE** clear question. **MANDATORY: include a recommended default and 2–4 concrete answer options for EVERY question**, with a short trade-off/consequence for each. Clearly mark one as **Recommended** and explain why. Options must all answer the SAME single question; they are not separate follow-up questions. Include **Other / custom answer** when applicable. Even for open-ended questions, offer realistic example directions and allow the user to answer freely. Do not quietly choose the recommended option for a material decision.
3. **STOP and wait for the user's answer.** Do not ask the next question in the same message, even as a numbered list or a preview. Never auto-answer questions that require a material business/design decision.
4. After each answer, record the decision, refresh the evidence/rubric and **recalculate confidence**. If another material issue remains, ask only the next highest-leverage question. If an answer creates a contradiction, surface it as the next single question.
5. Let the user **skip** a question or request a summary. A skipped material blocker remains OPEN; explain consequences and do not silently deem it approved. Mark low-risk assumptions explicitly.
6. Conclude the stage when thresholds and exit rules are met, with a brief confirmed-decisions/assumptions summary. Never force a fixed quota of questions.

## Readiness confidence — transparent heuristic, not model certainty
Compute a **requirement readiness score from 0–100%**. This is *coverage of explicitly supported decision dimensions*, not the chance the design is correct or a calibrated AI confidence measure. Display it as **"Readiness confidence: NN% (heuristic)"**, never as a precision/accuracy guarantee.

Use five dimensions, each scored **0, 1, 2, 3, or 4** from available evidence:

| Dimension | Weight | Score 0 | Score 2 | Score 4 |
| --- | ---: | --- | --- | --- |
| Goal & user value | 20% | No clear problem | Goal partly specified | Observable problem, beneficiary and desired outcome |
| Behavior & acceptance | 25% | No expected behavior | Partial happy path | Key positive/negative/boundary behavior and testable criteria |
| Boundaries & contracts | 20% | Scope unknown | Some scope/permissions | In/out scope, roles and impacted interfaces clear |
| Evidence & feasibility | 20% | Unsupported assumptions | Partial evidence, gaps labeled | Research evidence for affected system, compatibility and alternatives |
| Risks & decisions | 15% | Material unknowns hidden | Some risks surfaced | Material failure/operational/security risks and ownership resolved |

Score 1 or 3 for intermediate quality. When research has not yet been performed, **do not manufacture evidence**: score Evidence & feasibility only for substantiated context, known constraints and explicitly labeled unknowns; after research, rescore from inspected artifacts.

Formula: **round(Σ(weight × dimension score / 4))**. Show whole-number percentages and preferably the dimension scores when asked why the number moved. Changes in score are justified by newly resolved or discovered evidence, not optimism or number of questions answered. Never claim a statistical probability.

**Threshold guidance:** below 60% = discovery; 60–79% = refine; >=80% = potentially ready for plan. **80% is not automatic approval.** Stage may exit only when (a) readiness >=80%, (b) **no OPEN material blocker**, and (c) essential scope and acceptance criteria are sufficiently defined. If confidence >=80% but a blocker remains, keep challenging. If the user explicitly stops, summarize the unresolved blockers and do not imply approval.

## Issue classification and challenge tactics
- **BLOCKER:** Without the answer, design could materially change, violate business rules or harm data/users. Requires user decision or explicit removal from scope.
- **ASSUMPTION:** Low-impact reversible default, disclosed and reviewable.
- **SUGGESTION:** Nonessential improvement, optional.
- Prioritize by impact × uncertainty, not ease of asking.
- **Intake:** Distinguish problem from proposed solution; ask about target user, expected outcome, who can act, states, exceptional cases, intentional non-goals and success signals.
- **Post-research:** Question provenance of code findings, alternative designs, compatibility/migration, retries, idempotency, races, rollback and testability. Separate verified, inferred, unknown and decision.
- Use **concern → consequence → recommended option → one question**. Challenge respectfully; avoid agreeable rubber-stamping or speculative interrogations.

## Response template (only one pending question)

**Grill Me · [Requirement / Research]**

**Readiness confidence: 65% (heuristic)** — Needs refinement

**Uncertainty:** [One highest-leverage blocker and its impact.]

**Recommendation:** [Short default, if appropriate.]

**Question 1:** [One concrete question?]\n\n- **A — [Option] (Recommended):** [why + trade-off]\n- **B — [Option]:** [why + trade-off]\n- **C — [Option]:** [why + trade-off]\n- **Other:** [User-defined option, when applicable]

Stop here. On the next turn, update confidence, briefly acknowledge the answer, then ask *Question 2* only if needed. Every question must have choices and a suggested best option; do not display an entire backlog of future questions.

## Handoff to planning
Summarize readiness by stage, dimension ratings, evidence references, decisions, labeled low-risk assumptions, unresolved items, and acceptance criteria. Record in the **single canonical Technical Plan**, not an extra approval document. User approval for material-impact implementation remains separate.
