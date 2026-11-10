import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const root = path.resolve(process.env.AI_PROJECT_ROOT || process.cwd());
const plansDir = path.join(root, '.ai', 'plans');
const reviewsDir = path.join(root, '.ai', 'reviews');
const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');
const port = Number(process.env.AI_DOCS_PORT || 4177);
const token = crypto.randomBytes(24).toString('hex');
const clients = new Set();
let writing = Promise.resolve();

export const digest = value => crypto.createHash('sha256').update(value).digest('hex');
export const validId = id => /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/.test(id);
const planFile = id => path.join(plansDir, id + '.md');
const reviewFile = id => path.join(reviewsDir, id + '.json');

const escapeHtml = input => String(input).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const send = (res, status, value) => {
  res.writeHead(status, { 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store' });
  res.end(JSON.stringify(value));
};
const fail = (res, code, message) => send(res, code, { error:message });
const readText = async file => { try { return await fsp.readFile(file, 'utf8'); } catch (e) { if (e.code === 'ENOENT') return null; throw e; } };
async function loadPlan(id) {
  const markdown = await readText(planFile(id));
  if (markdown === null) return null;
  const revision = digest(markdown);
  const rendered = marked.parse(markdown, { gfm:true, breaks:false });
  const html = sanitizeHtml(rendered, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'h1','h2','h3','h4','h5','h6','input'],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a:['href','title','target','rel'],
      code:['class'],
      input:['type','disabled','checked'],
      '*':['id']
    },
    allowedSchemes: ['https','http','mailto'],
    transformTags: { a: sanitizeHtml.simpleTransform('a', { rel:'noopener noreferrer', target:'_blank' }) }
  });
  return { id, markdown, html, revision };
}
async function loadReview(id) {
  const raw = await readText(reviewFile(id));
  if (raw === null) return { schemaVersion:1, planId:id, comments:[], approval:{ status:'DRAFT', approvedRevision:null, approvedAt:null } };
  try { const result = JSON.parse(raw); if (!Array.isArray(result.comments)) throw new Error('Invalid comments'); return result; }
  catch { throw new Error('Review sidecar is invalid JSON: ' + id); }
}
async function saveReview(id, review) {
  const tmp = reviewFile(id) + '.' + crypto.randomBytes(6).toString('hex') + '.tmp';
  await fsp.writeFile(tmp, JSON.stringify(review, null, 2) + '\n', { flag:'wx' });
  await fsp.rename(tmp, reviewFile(id));
  notify('review', id);
}
const withWrite = task => {
  const next = writing.then(task);
  writing = next.catch(() => {});
  return next;
};
function notify(kind, id='') {
  for (const res of clients) {
    try { res.write('data: ' + JSON.stringify({ kind, id }) + '\n\n'); }
    catch { clients.delete(res); }
  }
}
const jsonBody = async req => {
  let data = '';
  for await (const part of req) {
    data += part.toString();
    if (data.length > 32000) throw new Error('Payload too large');
  }
  return JSON.parse(data || '{}');
};
const isLocal = req => ['127.0.0.1','localhost','[::1]'].includes((req.headers.host || '').split(':')[0]);
const authorizedWrite = req => {
  if (req.headers['x-workspace-token'] !== token) return false;
  const origin = req.headers.origin;
  if (!origin) return false;
  try { return new URL(origin).hostname === '127.0.0.1' && new URL(origin).port === String(port); }
  catch { return false; }
};
async function serveStatic(res, name) {
  const types = { 'index.html':'text/html; charset=utf-8', 'app.js':'text/javascript; charset=utf-8', 'style.css':'text/css; charset=utf-8' };
  if (!types[name]) return fail(res, 404, 'Not found');
  const data = await fsp.readFile(path.join(publicDir, name));
  res.writeHead(200, { 'content-type':types[name], 'cache-control':'no-store', 'x-content-type-options':'nosniff' });
  res.end(data);
}
export async function handler(req, res) {
  try {
    if (!isLocal(req)) return fail(res, 403, 'Localhost only');
    const url = new URL(req.url, 'http://127.0.0.1:' + port);
    if (url.pathname === '/' || url.pathname === '/index.html') return serveStatic(res, 'index.html');
    if (url.pathname === '/app.js' || url.pathname === '/style.css') return serveStatic(res, url.pathname.slice(1));
    if (url.pathname === '/api/events' && req.method === 'GET') {
      res.writeHead(200, {'content-type':'text/event-stream', 'cache-control':'no-cache', 'connection':'keep-alive'});
      clients.add(res); res.write('data: {"kind":"connected"}\n\n');
      req.on('close', () => clients.delete(res)); return;
    }
    if (url.pathname === '/api/plans' && req.method === 'GET') {
      const names = (await fsp.readdir(plansDir)).filter(x => x.endsWith('.md') && validId(x.slice(0,-3)));
      const items = await Promise.all(names.map(async name => {
        const id = name.slice(0,-3), plan = await loadPlan(id), review = await loadReview(id);
        const approved = review.approval?.approvedRevision === plan.revision;
        return { id, title:plan.markdown.match(/^#\s+(.+)$/m)?.[1] || id, revision:plan.revision, status:approved?'APPROVED':review.approval?.status==='APPROVED'?'NEEDS_REVIEW':review.approval?.status || 'DRAFT', openComments:review.comments.filter(c=>c.status==='OPEN').length };
      }));
      return send(res, 200, { project:path.basename(root), plans:items });
    }
    const match = url.pathname.match(/^\/api\/plans\/([a-zA-Z0-9_-]+)(?:\/(comments|approval))?(?:\/([a-zA-Z0-9_-]+))?$/);
    if (!match || !validId(match[1])) return fail(res, 404, 'Not found');
    const [,id,action,commentId] = match;
    const plan = await loadPlan(id);
    if (!plan) return fail(res, 404, 'Plan does not exist');
    if (req.method === 'GET' && !action) {
      const review = await loadReview(id);
      return send(res, 200, { ...plan, review, approvalCurrent:review.approval?.approvedRevision===plan.revision });
    }
    if (req.method !== 'GET' && !authorizedWrite(req)) return fail(res, 403, 'Invalid local write token/origin');
    if (req.method === 'POST' && action === 'comments' && !commentId) {
      return await withWrite(async () => {
        const body = await jsonBody(req);
        const quote = String(body.quote || '').trim(), message = String(body.body || '').trim();
        if (!quote || quote.length > 1200 || !message || message.length > 4000) return fail(res, 400, 'Quote or comment invalid');
        if (body.revision !== plan.revision) return fail(res, 409, 'Plan changed; refresh before commenting');
        const review = await loadReview(id);
        const comment = { id:crypto.randomUUID(), quote, body:message, section:String(body.section || '').slice(0,150), anchorRevision:plan.revision, status:'OPEN', createdAt:new Date().toISOString(), resolvedAt:null };
        review.comments.push(comment); review.approval.status='IN_REVIEW';
        await saveReview(id, review); return send(res, 201, { comment });
      });
    }
    if (req.method === 'PATCH' && action === 'comments' && commentId) {
      return await withWrite(async () => {
        const body=await jsonBody(req);
        if (!['OPEN','RESOLVED'].includes(body.status)) return fail(res, 400, 'Invalid comment status');
        const review=await loadReview(id), comment=review.comments.find(c=>c.id===commentId);
        if (!comment) return fail(res, 404, 'Comment does not exist');
        comment.status=body.status; comment.resolvedAt=body.status==='RESOLVED'?new Date().toISOString():null;
        await saveReview(id,review);return send(res,200,{ comment });
      });
    }
    if (req.method === 'POST' && action === 'approval') {
      return await withWrite(async () => {
        const body=await jsonBody(req);
        const latest=await loadPlan(id);
        if (body.revision!==latest.revision) return fail(res,409,'Plan changed; approval rejected');
        const review=await loadReview(id);
        if (review.comments.some(c=>c.status==='OPEN')) return fail(res,409,'Resolve open comments before approval');
        review.approval={status:'APPROVED',approvedRevision:latest.revision,approvedAt:new Date().toISOString()};
        await saveReview(id,review);return send(res,200,{ approval:review.approval });
      });
    }
    return fail(res,405,'Method not allowed');
  } catch (err) { console.error(err); return fail(res,500,err.message); }
}

async function start() {
  await fsp.mkdir(plansDir,{recursive:true});
  await fsp.mkdir(reviewsDir,{recursive:true});
  for (const dir of [plansDir,reviewsDir]) {
    fs.watch(dir, (_type,name) => { if (name && /\.(md|json)$/.test(String(name))) notify('changed',String(name).replace(/\.(md|json)$/,'')); });
  }
  const server=http.createServer(handler);
  server.listen(port,'127.0.0.1',()=>{
    console.log('\nMy AI Setup — Local Planning Workspace');
    console.log('Project: ' + root);
    console.log('Browser: http://127.0.0.1:' + port + '/?token=' + token);
    console.log('Plans: ' + plansDir + '\n');
  });
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) start();
