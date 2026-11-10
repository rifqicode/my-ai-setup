import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverPath = path.join(skillRoot, 'reader', 'server.mjs');
const args = process.argv.slice(2);
const projectIndex = args.indexOf('--project');
const root = path.resolve(projectIndex >= 0 ? (args[projectIndex + 1] || '') : process.cwd());
const noOpen = args.includes('--no-open');
const stateDir = path.join(os.tmpdir(), 'my-ai-setup-reader', crypto.createHash('sha256').update(root).digest('hex').slice(0, 24));
const stateFile = path.join(stateDir, 'state.json');

function installDependencies() {
  const needed = ['marked', 'sanitize-html'].every(dep => fs.existsSync(path.join(skillRoot, 'node_modules', dep, 'package.json')));
  if (needed) return;
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  console.log('Installing local reader dependencies (first use only)...');
  const result = spawnSync(npm, ['install', '--omit=dev', '--ignore-scripts', '--no-audit', '--no-fund'], {
    cwd:skillRoot, stdio:'inherit', windowsHide:true
  });
  if (result.error || result.status !== 0) throw new Error('npm install failed. Ensure Node.js and npm are installed.');
}

async function readState() {
  try { return JSON.parse(await fsp.readFile(stateFile, 'utf8')); } catch { return null; }
}
async function liveUrl() {
  const state = await readState();
  if (!state || state.projectRoot !== root || !/^http:\/\/127\.0\.0\.1:\d+\/\?token=[a-f0-9]+$/.test(state.url)) return null;
  try {
    const response = await fetch('http://127.0.0.1:' + state.port + '/api/health', {
      headers:{'x-workspace-token':state.token},
      signal:AbortSignal.timeout(800)
    });
    const result = await response.json();
    return response.ok && result.projectHash === crypto.createHash('sha256').update(root).digest('hex') ? state.url : null;
  } catch { return null; }
}
function openBrowser(url) {
  if (noOpen) return;
  const platform = process.platform;
  const cmd = platform === 'win32' ? 'cmd.exe' : platform === 'darwin' ? 'open' : 'xdg-open';
  const a = platform === 'win32' ? ['/d','/s','/c','start','""',url] : [url];
  try {
    const child = spawn(cmd,a,{stdio:'ignore',detached:true,windowsHide:true});
    child.on('error', () => {}); // Headless systems might have no browser launcher.
    child.unref();
  } catch { /* User can open printed URL manually. */ }
}

async function main() {
  if (projectIndex >= 0 && !args[projectIndex + 1]) throw new Error('Missing --project path');
  const existing = await liveUrl();
  if (existing) {
    console.log('Local reader already running for ' + root);
    console.log('Open: ' + existing);
    openBrowser(existing);
    return;
  }
  installDependencies();
  await fsp.mkdir(stateDir,{recursive:true,mode:0o700});
  const child = spawn(process.execPath,[serverPath],{
    cwd:root, env:{...process.env,AI_PROJECT_ROOT:root,AI_READER_STATE_FILE:stateFile},
    detached:true,stdio:'ignore',windowsHide:true
  });
  child.unref();
  for (let i=0;i<40;i++) {
    await new Promise(resolve=>setTimeout(resolve,200));
    const url=await liveUrl();
    if(url) {
      console.log('Local reader ready: ' + url);
      openBrowser(url);
      return;
    }
  }
  throw new Error('Reader did not start. Try: node ' + serverPath + ' (from your project root) to view startup errors.');
}
main().catch(e=>{ console.error(e.message);process.exitCode=1;});
