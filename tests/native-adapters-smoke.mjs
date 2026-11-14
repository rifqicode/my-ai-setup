#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const codex = load('.codex-plugin/plugin.json');
const anti = load('.antigravity-plugin/plugin.json');
const claude = load('.claude-plugin/plugin.json');
const hooks = load('hooks/hooks.json');
const manifest = load('integrations/manifest.json');
assert.equal(codex.name, 'qark');
assert.equal(codex.skills, './skills/');
assert.equal(anti.name, 'qark');
assert.equal(claude.name, 'qark');
assert.ok(existsSync(resolve(root, 'skills/qark/SKILL.md')));
assert.ok(existsSync(resolve(root, 'SKILL.md')));
assert.ok(existsSync(resolve(root, 'agents/orchestrator.md')));
assert.ok(existsSync(resolve(root, 'rules/AGENTS.md')));
for (const role of ['orchestrator', 'researcher', 'coder', 'test-writer', 'code-reviewer', 'qa']) {
  const content = readFileSync(resolve(root, 'agents', role + '.md'), 'utf8');
  assert.match(content, /^---
name: /);
  assert.match(content, /
subagent: (true|false)
/);
}
assert.ok(existsSync(resolve(root, 'docs/grill-me.md')));\nassert.ok(existsSync(resolve(root, 'templates/global-bootstrap.md')));\nassert.ok(existsSync(resolve(root, 'docs/auto-activation.md')));\nassert.ok(existsSync(resolve(root, 'integrations/herdr.md')));\nconst herdrRouting = readFileSync(resolve(root, 'integrations/herdr.md'), 'utf8');\nassert.match(herdrRouting, /official installed/);\nassert.doesNotMatch(herdrRouting, /herdr pane split|herdr agent start/);
const grillMe = readFileSync(resolve(root, 'docs/grill-me.md'), 'utf8');
assert.match(grillMe, /ONE question at a time/);
assert.match(grillMe, /Readiness confidence/);\nassert.match(grillMe, /recommended default and 2–4 concrete answer options/);
assert.match(grillMe, /round\(/);
assert.match(readFileSync(resolve(root, 'SKILL.md'), 'utf8'), /Code Reviewer/);
assert.match(readFileSync(resolve(root, 'SKILL.md'), 'utf8'), /Grill Me/);
assert.ok(manifest.integrations.some(x => x.id === 'systematic-debugging'));
assert.equal(hooks.hooks.SessionStart[0].matcher, 'startup|clear|compact');
const hookPath = resolve(root, 'hooks/session-start.mjs');
const syntax = spawnSync(process.execPath, ['--check', hookPath], { encoding: 'utf8' });
assert.equal(syntax.status, 0, syntax.stderr);
const out = spawnSync(process.execPath, [hookPath], { encoding: 'utf8' });
assert.equal(out.status, 0, out.stderr);
const payload = JSON.parse(out.stdout);
assert.equal(payload.hookSpecificOutput.hookEventName, 'SessionStart');
assert.match(payload.hookSpecificOutput.additionalContext, /Impact-Driven Planning/);\nassert.match(payload.hookSpecificOutput.additionalContext, /even when the user does not say qark/);
assert.match(payload.hookSpecificOutput.additionalContext, /systematic-debugging/);
assert.doesNotMatch(payload.hookSpecificOutput.additionalContext, /install.*automatically/i);
const installer = spawnSync(process.execPath, ['--check', resolve(root, 'integrations/setup.mjs')], { encoding: 'utf8' });
assert.equal(installer.status, 0, installer.stderr);
console.log('PASS: native manifests, bootstrap JSON, and setup syntax');
