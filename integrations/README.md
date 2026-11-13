# Optional external integrations

This installer is separate from `npx skills add rifqicode/my-ai-setup -g`. Installing the core skill **does not execute** any external setup.

## Usage

Requires Node.js 18+ for the setup script.

```bash
node ~/.agents/skills/my-ai-setup/integrations/setup.mjs --dry-run
node ~/.agents/skills/my-ai-setup/integrations/setup.mjs --only caveman --yes
node ~/.agents/skills/my-ai-setup/integrations/setup.mjs --only rtk --agent codex
node ~/.agents/skills/my-ai-setup/integrations/setup.mjs --only rtk --agent all --yes
node ~/.agents/skills/my-ai-setup/integrations/setup.mjs --skip caveman
```

Relative skill paths can vary across hosts; point Node at the actual installed `integrations/setup.mjs`.

- **Caveman:** installs **only the skill** via `npx skills add JuliusBrussee/caveman -g -y`, not its proxy or model routing. To remove: `npx skills remove JuliusBrussee/caveman -g`. Source: https://github.com/JuliusBrussee/caveman
- **RTK:** uses an already installed `rtk` if present. Otherwise installs via Homebrew (macOS or Linux with brew) or WinGet (Windows); on unsupported systems it prints the official manual instructions rather than running a remote shell script. Then `rtk init -g` (Claude), `rtk init -g --codex`, and/or `rtk init -g --gemini`. Source: https://github.com/rtk-ai/rtk

## Guardrails

- All integrations are optional, selected explicitly, and confirmed individually unless `--yes` is supplied.
- `--dry-run` **does not install or modify** files. It previews intended commands and assumptions.
- No unreviewed `curl | sh` or proxy/routing setup is performed.
- RTK init may change existing agent hooks/config. Back up those files first and inspect upstream uninstall instructions; this script does not automatically undo modifications.
- `--agent all` targets Claude, Codex and Gemini regardless of which are installed; prefer `--agent codex`, etc. when only one is needed.
- For raw unfiltered output when investigating failures, use `rtk bypass <command...>` or your original CLI directly when appropriate.
- Caveman must not override my-ai-setup's acceptance criteria, critical decisions, or QA evidence. This package does not automatically apply its speaking style.

## Verification

```bash
node --check integrations/setup.mjs
node integrations/setup.mjs --only caveman,rtk --agent codex --dry-run
rtk gain
```

This installer provides orchestration, not a vendor-specific uninstall/rollback manager. Confirm upstream versions and review third-party code before opting in.
