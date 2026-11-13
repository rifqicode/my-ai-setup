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
for (const role of ['orchestrator', 'researcher', 'coder', 'test-writer', 'qa']) {
  const content = readFileSync(resolve(root, 'agents', role + '.md'), 'utf8');
  assert.match(content, /^---\nname: /);
  assert.match(content, /\nsubagent: (true|false)\n/);
}
assert.ok(manifest.integrations.some(x => x.id === 'systematic-debugging'));
assert.equal(hooks.hooks.SessionStart[0].matcher, 'startup|clear|compact');
const hookPath = resolve(root, 'hooks/session-start.mjs');
const syntax = spawnSync(process.execPath, ['--check', hookPath], { encoding: 'utf8' });
assert.equal(syntax.status, 0, syntax.stderr);
const out = spawnSync(process.execPath, [hookPath], { encoding: 'utf8' });
assert.equal(out.status, 0, out.stderr);
const payload = JSON.parse(out.stdout);
assert.equal(payload.hookSpecificOutput.hookEventName, 'SessionStart');
assert.match(payload.hookSpecificOutput.additionalContext, /Impact-Driven Planning/);
assert.match(payload.hookSpecificOutput.additionalContext, /systematic-debugging/);
assert.doesNotMatch(payload.hookSpecificOutput.additionalContext, /install.*automatically/i);
const installer = spawnSync(process.execPath, ['--check', resolve(root, 'integrations/setup.mjs')], { encoding: 'utf8' });
assert.equal(installer.status, 0, installer.stderr);
console.log('PASS: native manifests, bootstrap JSON, and setup syntax');
