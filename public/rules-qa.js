const $ = (id) => document.getElementById(id);

async function lexSearch(q) {
  const box = $('lex-results');
  if (!q || q.trim().length < 2) { box.innerHTML = ''; return; }
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) { box.textContent = 'Search error.'; return; }
    const data = await res.json();
    let rows = [];
    if (Array.isArray(data)) {
      rows = data;
    } else if (data && Array.isArray(data.results)) {
      // Fallback for alternate server shape
      rows = data.results.map(doc => ({
        title: doc.title || 'Result',
        section: doc.section || '',
        snippet: (doc.snippet || doc.content || '').toString().slice(0, 240) + '…',
        href: doc.href || '#'
      }));
    }
    if (!rows.length) {
      box.innerHTML = `
        <div class="text-xs text-neutral-500">
          No matches found in the rule PDFs.<br>
          Try terms like <span class="font-medium">LOTO</span>, <span class="font-medium">permit</span>, <span class="font-medium">isolation</span>, <span class="font-medium">verification</span>, <span class="font-medium">PTW</span>, <span class="font-medium">PCEI</span>.
        </div>`;
      return;
    }
    
    // Sort results: prioritize title matches first
    const qLower = q.toLowerCase();
    rows.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(qLower);
      const bTitleMatch = b.title.toLowerCase().includes(qLower);
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;
      return 0;
    });
    
    // Show ALL results (no limit)
    box.innerHTML = rows.map(r => `
    <a class="block rounded-lg border border-neutral-200 p-2 hover:bg-neutral-50"
       href="${r.href}" target="_blank" rel="noopener">
      <div class="font-medium">${r.title}${r.section ? ` — ${r.section}` : ''}</div>
      <div class="text-xs text-neutral-600 line-clamp-2">${r.snippet}</div>
    </a>
  `).join('');
  } catch (err) {
    box.textContent = 'Server not running or API unreachable. Start the server and open the site at http://localhost.';
  }
}

function addMsg(role, html) {
  const el = document.createElement('div');
  el.className = role === 'user' ? 'p-2 rounded-lg bg-sky-50 border border-sky-100' : 'p-2 rounded-lg bg-white border';
  el.innerHTML = html;
  $('qa-thread').appendChild(el);
  $('qa-thread').scrollTop = $('qa-thread').scrollHeight;
}

async function askLLM(q) {
  addMsg('user', `<strong>You:</strong> ${q}`);
  let res = await fetch('/api/ask', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ question: q })
  });
  // Fallback for alternate server (server.js uses GET /api/ask?q=...)
  if (!res.ok && (res.status === 404 || res.status === 405)) {
    try {
      res = await fetch(`/api/ask?q=${encodeURIComponent(q)}`);
    } catch {}
  }
  if (!res || !res.ok) {
    let detail = '';
    try { const t = await res.text(); detail = t?.slice(0,200); } catch {}
    let msg = 'Error from API.';
    try {
      const j = JSON.parse(detail);
      if (j?.error === 'insufficient_quota') msg = 'Ask temporarily unavailable: OpenAI quota exceeded on this key. You can still browse and search the lexicon.';
      if (j?.error === 'no-index') msg = 'Search index not built yet. Please run the indexer or use the Downloads PDFs.';
    } catch {}
    addMsg('assistant', `<strong>Assistant:</strong> ${msg}`);
    return;
  }
  const data = await res.json().catch(() => ({}));
  if (!data.answerHtml && data.answer) {
    // Adapt to server.js shape
    data.answerHtml = data.answer;
  }
  const cites = (data.citations||[]).map(c => `<a class="text-sky-700 hover:text-sky-900" href="${c.href}" target="_blank">${c.label||c.title}</a>`).join(' • ');
  addMsg('assistant', `<strong>Assistant:</strong> ${data.answerHtml}${cites ? `<div class="mt-1 text-xs text-neutral-500">Sources: ${cites}</div>`:''}`);
}

window.addEventListener('DOMContentLoaded', () => {
  const s = $('lex-search');
  if (s) s.addEventListener('input', (e) => lexSearch(e.target.value));
  const send = $('qa-send');
  const input = $('qa-input');
  if (send && input) {
    const submit = () => {
      const q = input.value.trim();
      if (!q) return;
      input.value = '';
      askLLM(q);
    };
    send.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  }
});