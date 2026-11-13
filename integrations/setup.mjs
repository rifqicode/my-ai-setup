#!/usr/bin/env node
// Optional installer: explicit opt-in only; never run downloaded shell scripts.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const manifest = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'manifest.json'), 'utf8'));
const args = process.argv.slice(2);
const value = (name, fallback) => {
  const index = args.indexOf(name);
  if (index < 0) return fallback;
  if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error('Missing value for ' + name);
  return args[index + 1];
};
const help = args.includes('--help') || args.includes('-h');
if (help) {
  console.log('Usage: node integrations/setup.mjs [--only caveman,rtk,systematic-debugging] [--agent claude|codex|gemini|all] [--dry-run] [--yes] [--skip caveman,rtk]');
  process.exit(0);
}
const choices = new Set(manifest.integrations.map(entry => entry.id));
const parseNames = (flag, fallback) => {
  const items = value(flag, fallback).split(',').filter(Boolean);
  for (const item of items) if (!choices.has(item)) throw new Error('Unknown integration: ' + item);
  return new Set(items);
};
const only = parseNames('--only', manifest.integrations.map(entry => entry.id).join(','));
const skip = parseNames('--skip', '');
const selected = [...only].filter(x => !skip.has(x));
const agent = value('--agent', 'all');
if (!['claude', 'codex', 'gemini', 'all'].includes(agent)) throw new Error('Invalid --agent');
const dry = args.includes('--dry-run');
const yes = args.includes('--yes');
const os = process.platform;
const commandExists = cmd => {
  const result = spawnSync(os === 'win32' ? 'where' : 'which', [cmd], { stdio: 'ignore' });
  return result.status === 0;
};
const show = (cmd, argv) => [cmd, ...argv].join(' ');
const run = (cmd, argv) => {
  console.log((dry ? '[dry-run] ' : '> ') + show(cmd, argv));
  if (dry) return true;
  const result = spawnSync(cmd, argv, { stdio: 'inherit', shell: os === 'win32' });
  if (result.error || result.status !== 0) {
    console.error('Failed: ' + show(cmd, argv) + (result.error ? ' (' + result.error.message + ')' : ''));
    return false;
  }
  return true;
};
const confirm = async label => {
  if (dry) return true;
  if (yes) return true;
  if (!stdin.isTTY) {
    console.error('Noninteractive terminal: use --yes to explicitly authorize changes or --dry-run to inspect.');
    return false;
  }
  const rl = createInterface({ input: stdin, output: stdout });
  try { return /^y(es)?$/i.test((await rl.question(label + ' [y/N] ')).trim()); }
  finally { rl.close(); }
};
console.log('my-ai-setup optional integrations | platform=' + os + ' | agent=' + agent);
console.log('Selected: ' + (selected.join(', ') || 'none') + ' | dry-run=' + dry);
if (!selected.length) process.exit(0);
if (!dry && !yes && !stdin.isTTY) {
  console.error('Nothing changed: interactive confirmation unavailable. Use --yes to opt in.');
  process.exit(2);
}
let failures = 0;
for (const id of selected) {
  const entry = manifest.integrations.find(x => x.id === id);
  console.log('\n' + entry.name + ' — ' + entry.upstream);
  if (!(await confirm('Enable ' + id + '?'))) { console.log('Skipped.'); continue; }
  if (entry.kind === 'agent-skill') {
    if (!commandExists('npx') && !dry) { console.error('npx missing: install Node.js/npm first.'); failures++; continue; }
    if (!run(entry.install.command, entry.install.args)) failures++;
    continue;
  }
  if (!commandExists('rtk')) {
    let install;
    if (os === 'win32') install = entry.install.windows;
    else if (commandExists('brew')) install = os === 'darwin' ? entry.install.macos : entry.install.linuxHomebrew;
    if (!install) {
      console.log('RTK not detected and no supported package manager found. Install manually from https://www.rtk-ai.app/docs/getting-started/installation/ then rerun.');
      if (!dry) { failures++; continue; }
    } else {
      console.log('RTK may change PATH and agent configuration.');
      if (!(await confirm('Install RTK binary?'))) { console.log('Skipped RTK.'); continue; }
      if (!run(install[0], install.slice(1))) { failures++; continue; }
    }
  } else console.log('RTK binary detected; skipping binary install.');
  if (dry && !commandExists('rtk')) console.log('[dry-run] assuming rtk available after install');
  if (!dry && !commandExists('rtk')) {
    console.error('rtk not found on PATH after installation. Restart terminal and rerun.');
    failures++; continue;
  }
  const agents = agent === 'all' ? ['claude', 'codex', 'gemini'] : [agent];
  for (const target of agents) {
    const initArgs = entry.init[target];
    console.log('Hook initialization modifies local ' + target + ' settings. Back up existing agent config first.');
    if (!(await confirm('Initialize RTK for ' + target + '?'))) { console.log('Skipped ' + target); continue; }
    if (!run('rtk', initArgs)) failures++;
  }
}
console.log('\nFinished' + (failures ? ' with ' + failures + ' failure(s).' : '. Restart affected AI CLI sessions.'));
process.exitCode = failures ? 1 : 0;
