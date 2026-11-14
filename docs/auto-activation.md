# Make Qark discoverable automatically

**Problem:** Installing a skill makes it available; it does not force every model turn to load it. Use a *small global bootstrap* that points the host to Qark's canonical skill. This is routing, not guaranteed invocation or authorization to edit.

## Codex

Codex reads `~/.codex/AGENTS.md` globally and repository-scoped `AGENTS.md` files. Merge the content of [global-bootstrap.md](../templates/global-bootstrap.md) into your **existing** global file (create it only if absent). Do not overwrite existing user rules. Then restart Codex and try a development request without naming Qark.

Verify: Ask Codex which skill it selected and to identify the actual Qark SKILL.md path it read. A plausible answer without a file read is not proof. The skill must be installed within Codex's discovered skill paths.

## Claude Code

If Qark is loaded as a **Claude plugin**, its `SessionStart` hook emits a lightweight Qark routing reminder. Confirm the plugin is enabled/loaded and the hook actually fires; installing the standalone skill with `npx skills add` is **not the same as loading a Claude plugin** and may not register those hooks.

For installations that only expose Qark as a skill, merge [global-bootstrap.md](../templates/global-bootstrap.md) into `~/.claude/CLAUDE.md` (create if absent). Keep any existing instructions. This offers a global always-read routing reminder without custom hooks; you can also use the Claude plugin hook route. Avoid stacking multiple heavy, conflicting bootstraps.

Verify via a fresh Claude session and an ordinary software feature request that does not mention Qark. Use Claude's `/doctor` / plugin configuration inspection if the hook seems inactive. Ask for concrete evidence of which skill file was read.

## Antigravity (AGY)

Qark already ships `rules/AGENTS.md` as a **plugin always-on rule**. Official Antigravity plugin discovery loads this rule on every session **when the Qark plugin is installed and enabled**, even when the user does not name Qark. Do not confuse this with installing only a standalone Qark skill.

```bash
agy plugin list
agy plugin validate --strict ./qark
agy plugin install https://github.com/rifqicode/qark
```

The validation command assumes a local `./qark` checkout; run it only when that checkout exists. For global routing without a plugin, merge [global-bootstrap.md](../templates/global-bootstrap.md) into `~/.gemini/AGENTS.md`, preserving existing instructions. AGY also recognizes personal customizations under `~/.gemini/config/`, but do not create duplicate bootstraps when an enabled Qark plugin already supplies its always-on rule.

After installing/enabling, restart AGY and send an ordinary development request without mentioning Qark. Verify the plugin is enabled, that its `rules/AGENTS.md` is discovered, and that the canonical Qark skill was actually read. Neither a listed installation nor model claims alone prove activation.

## Safeguards

- A global bootstrap only routes *relevant* development work to Qark; regular conversation and nondevelopment tasks need not load it.
- Qark Fast Path remains fast; Grill Me and technical approval apply only when their conditions are met.
- If Qark isn't installed, no auto-installation, error loop, or imaginary successful invocation.
- A strong but brief skill `description` also improves implicit matching; it does not make invocation guaranteed.
- Keep one authoritative Qark SKILL.md, not copies under many projects.
- Do not edit personal/global config without user authorization, do not overwrite existing AGENTS.md or CLAUDE.md.
