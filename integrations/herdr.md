# Herdr — official skill routing for Qark Orchestrator

Qark does **not** implement its own Herdr adapter or duplicate Herdr CLI instructions. The official installed **Herdr skill** is the sole authority on Herdr terminal/pane/agent automation. Source: https://github.com/herdrdev/herdr/tree/master/skills/herdr

## Orchestrator decision
1. Before delegating substantial specialist work, check whether the host exposes an installed, readable `herdr` skill **and** whether its activation/environment requirements are met. Do not equate a Herdr binary with a loaded skill.
2. When both are true, **read the official Herdr skill instructions** and use its supported workflow to launch or manage *separate CLI agent processes* so they can be seen in Herdr. Follow its actual current commands, capabilities, limitations, and safety boundaries; never invent flags or claim a pane was launched without observing it.
3. When the skill is missing or cannot be activated, continue Qark's native subagent delegation or sequential fallback without installing anything. Mention visibility limitations only when relevant. Do not attempt to reimplement Herdr CLI automation from memory.
4. Native internal subagents **cannot be presumed visible in separate Herdr panes**. Only claim visual pane-level tracking when genuinely supported and verified.
5. Qark remains authoritative over role/task assignment, approved plans, read/write ownership, code review gates, QA evidence, and final status. The Herdr skill controls only its own terminal/process operations. Pane separation is not filesystem isolation, and agent/process status is not test verification.
6. Do not trigger Herdr for every trivial Fast Path operation merely because the skill is present. For meaningful spawn/delegation work, prefer the official skill when it is available and applicable; use other methods if explicitly requested or technically necessary.

No Herdr-specific commands, local paths, manual pane management scripts or installer behavior belong in Qark.
