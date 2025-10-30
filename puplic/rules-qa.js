const $ = (id) => document.getElementById(id);

async function lexSearch(q) {
  if (!q || q.trim().length < 2) { $('lex-results').innerHTML = ''; return; }
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) { $('lex-results').textContent = 'Search error.'; return; }
  const data = await res.json();
  $('lex-results').innerHTML = data.slice(0,8).map(r => `
    <a class="block rounded-lg border border-neutral-200 p-2 hover:bg-neutral-50"
       href="${r.href}" target="_blank" rel="noopener">
      <div class="font-medium">${r.title}${r.section ? ` — ${r.section}` : ''}</div>
      <div class="text-xs text-neutral-600 line-clamp-2">${r.snippet}</div>
    </a>
  `).join('');
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
  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ question: q })
  });
  if (!res.ok) { addMsg('assistant', `<strong>Assistant:</strong> Error from API.`); return; }
  const data = await res.json();
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