const $ = id => document.getElementById(id);
const token = new URL(location.href).searchParams.get('token') || '';
const state = { id:null, plan:null, selection:null, refresh:null };
const toast = (msg) => { $('toast').textContent=msg; $('toast').style.display='block'; clearTimeout(toast.t); toast.t=setTimeout(()=>$('toast').style.display='none',3400); };
async function api(path, options={}) {
  const res=await fetch('/api'+path,{ ...options, headers:{ 'content-type':'application/json',...(options.method && options.method!=='GET'?{'x-workspace-token':token}:{}),...(options.headers||{}) } });
  let body; try { body=await res.json(); } catch { throw new Error('Invalid server response'); }
  if (!res.ok) throw new Error(body.error || 'Request failed');
  return body;
}
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalized = s => String(s??'').replace(/\s+/g,' ').trim();
async function listPlans() {
  const data=await api('/plans');
  $('project').textContent=data.project;
  $('plans').innerHTML=data.plans.length?data.plans.map(p=>'<button class="plan-item '+(p.id===state.id?'active':'')+'" data-id="'+esc(p.id)+'">'+esc(p.title)+'<small>'+esc(p.status)+' · '+p.openComments+' open comments</small></button>').join(''):'<p class="muted">No plans found yet.</p>';
  $('plans').querySelectorAll('[data-id]').forEach(el=>el.addEventListener('click',()=>select(el.dataset.id)));
  if (!state.id && data.plans.length) await select(data.plans[0].id);
  else if (state.id && !data.plans.some(p=>p.id===state.id)) { state.id=null;state.plan=null;$('content').innerHTML='<div class="empty"><h2>Plan not found</h2></div>'; }
}
async function select(id) { state.id=id; state.selection=null; $('editor').hidden=true; await refresh(); await listPlansOnly(); }
async function listPlansOnly() {
  const data=await api('/plans');
  $('plans').innerHTML=data.plans.map(p=>'<button class="plan-item '+(p.id===state.id?'active':'')+'" data-id="'+esc(p.id)+'">'+esc(p.title)+'<small>'+esc(p.status)+' · '+p.openComments+' open comments</small></button>').join('');
  $('plans').querySelectorAll('[data-id]').forEach(el=>el.addEventListener('click',()=>select(el.dataset.id)));
}
function locateQuote(quote) {
  const body=$('document');
  if (!body) return null;
  const text=normalized(body.textContent), q=normalized(quote);
  if (!q || text.split(q).length!==2) return null;
  const walker=document.createTreeWalker(body,NodeFilter.SHOW_TEXT);
  let node, first=null, last=null, offset=0;
  const chars=[];
  while ((node=walker.nextNode())) {
    for (let i=0;i<node.textContent.length;i++) chars.push({node,index:i});
  }
  const raw=chars.map(c=>c.node.textContent[c.index]).join('');
  let start=raw.indexOf(quote);
  if (start<0 || raw.indexOf(quote,start+1)>=0) return null;
  first=chars[start];last=chars[start+quote.length-1];
  if (!first||!last)return null;
  const range=document.createRange();range.setStart(first.node,first.index);range.setEnd(last.node,last.index+1);
  return range;
}
function drawComments(review) {
  const comments=review.comments || [];
  $('comment-count').textContent=comments.filter(c=>c.status==='OPEN').length+' open · '+comments.length+' total';
  $('comments').innerHTML=comments.length?comments.map(c=>{
    const matched=locateQuote(c.quote)!==null;
    return '<article class="comment"><div class="quote">'+esc(c.quote)+(matched?'':' <em>(anchor needs review)</em>')+'</div><p>'+esc(c.body)+'</p><div class="meta"><span>'+esc(c.status)+' · '+new Date(c.createdAt).toLocaleString()+'</span><button class="secondary" data-comment="'+esc(c.id)+'" data-status="'+(c.status==='OPEN'?'RESOLVED':'OPEN')+'">'+(c.status==='OPEN'?'Resolve':'Reopen')+'</button></div></article>';
  }).join(''):'<p class="muted">Highlight part of the document to add a review comment.</p>';
  $('comments').querySelectorAll('[data-comment]').forEach(btn=>btn.addEventListener('click',async()=>{
    try {
      await api('/plans/'+encodeURIComponent(state.id)+'/comments/'+encodeURIComponent(btn.dataset.comment),{method:'PATCH',body:JSON.stringify({status:btn.dataset.status})});
      await refresh();toast('Comment updated');
    } catch(e){toast(e.message);}
  }));
}
async function refresh() {
  if (!state.id) return;
  const id=state.id;
  try {
    const plan=await api('/plans/'+encodeURIComponent(id));
    if (state.id!==id) return;
    const oldRev=state.plan?.revision;state.plan=plan;
    $('plan-name').textContent=id;
    const current=plan.approvalCurrent;
    $('plan-status').textContent=current?'APPROVED':plan.review.approval?.status==='APPROVED'?'NEEDS REVIEW':plan.review.approval?.status||'DRAFT';
    $('plan-status').classList.toggle('approved',current);
    $('approve').disabled=current || plan.review.comments.some(c=>c.status==='OPEN');
    $('approve').title=plan.review.comments.some(c=>c.status==='OPEN')?'Resolve open comments first':'Approve current document revision';
    if (oldRev!==plan.revision || !$('document')) {
      $('content').innerHTML='<div class="revision">Revision '+esc(plan.revision.slice(0,12))+'</div><div class="inline-help">Select text in the document to attach a review comment. Changes made by your AI CLI appear here automatically.</div><article class="document" id="document">'+plan.html+'</article>';
      // Untrusted markdown has already been sanitized server-side. No script execution.
      $('editor').hidden=true;state.selection=null;
    }
    drawComments(plan.review);
  } catch(e){toast('Unable to load plan: '+e.message);}
}
$('content').addEventListener('mouseup',()=>{
  if (!state.plan) return;
  const selection=window.getSelection();
  if (!selection || selection.isCollapsed) return;
  const anchor=selection.anchorNode, focus=selection.focusNode, doc=$('document');
  if (!doc || !doc.contains(anchor) || !doc.contains(focus))return;
  const quote=selection.toString().trim();
  if (!quote || quote.length>1200)return;
  const el=anchor.nodeType===Node.ELEMENT_NODE?anchor:anchor.parentElement;
  const heading=el.closest('h1,h2,h3,h4,h5,h6')||null;
  state.selection={quote,revision:state.plan.revision,section:heading?.id||''};
  $('selection').textContent=quote;
  $('editor').hidden=false;
  $('comment-body').focus();
});
$('cancel').addEventListener('click',()=>{state.selection=null;$('editor').hidden=true;});
$('save').addEventListener('click',async()=>{
  if (!state.selection || !state.id)return;
  const body=$('comment-body').value.trim();
  if (!body) return toast('Write a comment first');
  try {
    await api('/plans/'+encodeURIComponent(state.id)+'/comments',{method:'POST',body:JSON.stringify({...state.selection,body})});
    $('comment-body').value='';state.selection=null;$('editor').hidden=true;window.getSelection()?.removeAllRanges();
    await refresh();await listPlansOnly();toast('Review comment saved locally');
  } catch(e){toast(e.message);}
});
$('approve').addEventListener('click',async()=>{
  if (!state.plan)return;
  if (!confirm('Approve this exact plan revision?'))return;
  try {
    await api('/plans/'+encodeURIComponent(state.id)+'/approval',{method:'POST',body:JSON.stringify({revision:state.plan.revision})});
    await refresh();await listPlansOnly();toast('Revision approved');
  } catch(e){toast(e.message);}
});
function connectEvents() {
  const es=new EventSource('/api/events');
  es.onopen=()=>{$('connection').textContent='Live connected';};
  es.onerror=()=>{$('connection').textContent='Reconnecting…';};
  es.onmessage=e=>{
    let data;try{data=JSON.parse(e.data)}catch{return;}
    if(data.kind==='connected')return;
    clearTimeout(state.refresh);
    state.refresh=setTimeout(()=>{ listPlansOnly().catch(console.error);if(!data.id||data.id===state.id)refresh();},350);
  };
}
listPlans().catch(e=>toast(e.message));connectEvents();
