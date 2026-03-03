import React, { useState, useEffect, useRef } from 'react';
import { setRole, getRole, chat, overlap, fetchStock, fetchNews } from './api';

// ────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────
const S = {
  body: { margin: 0, fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", background: '#f5f6fa', color: '#1a1a2e', minHeight: '100vh' },
  header: { background: '#1a1a2e', color: '#fff', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brand: { fontSize: 18, fontWeight: 700, letterSpacing: 0.5 },
  roleSelect: { padding: '6px 12px', borderRadius: 6, border: 'none', fontSize: 14, background: '#16213e', color: '#fff', cursor: 'pointer' },
  tabs: { display: 'flex', gap: 0, background: '#e8e8ee', borderBottom: '1px solid #d0d0d8' },
  tab: (active) => ({ padding: '10px 24px', cursor: 'pointer', fontWeight: active ? 600 : 400, background: active ? '#fff' : 'transparent', borderBottom: active ? '2px solid #4361ee' : '2px solid transparent', color: active ? '#4361ee' : '#555', fontSize: 14 }),
  main: { maxWidth: 960, margin: '0 auto', padding: '20px 16px' },
  card: { background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,.08)', padding: 20, marginBottom: 16 },
  input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d0d0d8', fontSize: 14, boxSizing: 'border-box' },
  btn: { padding: '10px 20px', borderRadius: 8, border: 'none', background: '#4361ee', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  msg: (isUser) => ({ padding: '10px 14px', borderRadius: 10, marginBottom: 8, maxWidth: '85%', alignSelf: isUser ? 'flex-end' : 'flex-start', background: isUser ? '#4361ee' : '#eef0f7', color: isUser ? '#fff' : '#1a1a2e', whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.5 }),
  citation: { fontSize: 12, color: '#4361ee', background: '#eef0f7', borderRadius: 4, padding: '2px 6px', display: 'inline-block', margin: '2px 4px 2px 0' },
  badge: (level) => {
    const colors = { GENERAL: '#28a745', HR: '#e67e22', FINANCE: '#3498db', EXEC: '#e74c3c' };
    return { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: colors[level] || '#888', color: '#fff', marginRight: 4 };
  },
  similarCard: { border: '1px solid #e0e0e8', borderRadius: 8, padding: 14, marginBottom: 10 },
  simBar: (pct) => ({ height: 6, borderRadius: 3, background: `linear-gradient(90deg, #4361ee ${pct}%, #e0e0e8 ${pct}%)`, marginBottom: 6 }),
  stockPrice: { fontSize: 28, fontWeight: 700 },
  newsItem: { borderBottom: '1px solid #eee', padding: '10px 0' },
};

// ────────────────────────────────────────────────────────
// Chat Panel
// ────────────────────────────────────────────────────────
function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text }]);
    setLoading(true);
    try {
      const data = await chat(text);
      setMessages((m) => [...m, { role: 'assistant', text: data.answer, citations: data.citations, levels: data.used_access_levels }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', text: `Error: ${e.message}` }]);
    }
    setLoading(false);
  }

  return (
    <div>
      <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', minHeight: 300, maxHeight: 500, overflowY: 'auto', marginBottom: 12, padding: '8px 0' }}>
        {messages.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>Ask a question about LG Electronics...</p>}
        {messages.map((m, i) => (
          <div key={i} style={S.msg(m.role === 'user')}>
            <div>{m.text}</div>
            {m.citations && m.citations.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {m.citations.map((c, j) => (
                  <span key={j} style={S.citation} title={`${c.doc_id}:${c.chunk_id}`}>{c.source_ref} – {c.title}</span>
                ))}
              </div>
            )}
            {m.levels && m.levels.length > 0 && (
              <div style={{ marginTop: 4 }}>
                {m.levels.map((l) => <span key={l} style={S.badge(l)}>{l}</span>)}
              </div>
            )}
          </div>
        ))}
        {loading && <div style={{ ...S.msg(false), fontStyle: 'italic', color: '#888' }}>Thinking...</div>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          style={S.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type your question..."
        />
        <button style={{ ...S.btn, ...(loading ? S.btnDisabled : {}) }} onClick={send} disabled={loading}>Send</button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// Overlap Panel
// ────────────────────────────────────────────────────────
function OverlapPanel() {
  const [idea, setIdea] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function search() {
    const text = idea.trim();
    if (!text || loading) return;
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const data = await overlap(text);
      setResults(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <div>
      <p style={{ color: '#555', marginBottom: 12 }}>Enter a new project idea to find similar existing projects.</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          style={S.input}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="e.g. Build a chatbot for internal knowledge search"
        />
        <button style={{ ...S.btn, ...(loading ? S.btnDisabled : {}), whiteSpace: 'nowrap' }} onClick={search} disabled={loading}>
          {loading ? 'Searching...' : 'Find Overlap'}
        </button>
      </div>
      {error && <p style={{ color: '#e74c3c' }}>{error}</p>}
      {results && results.length === 0 && <p style={{ color: '#888' }}>No similar projects found in your accessible knowledge base.</p>}
      {results && results.map((r, i) => (
        <div key={i} style={S.similarCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <strong>{r.title}</strong>
            <span style={{ fontSize: 13, color: '#4361ee', fontWeight: 600 }}>{(r.similarity * 100).toFixed(1)}% match</span>
          </div>
          <div style={S.simBar(r.similarity * 100)} />
          <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>Owner: {r.owner} | Status: <span style={{ textTransform: 'capitalize' }}>{r.status}</span></div>
          <div style={{ fontSize: 13, marginBottom: 6 }}>{r.why_similar}</div>
          <div>
            {r.citations.map((c, j) => (
              <span key={j} style={S.citation}>{c.source_ref}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────
// External Data Panel
// ────────────────────────────────────────────────────────
function ExternalPanel() {
  const [stock, setStock] = useState(null);
  const [news, setNews] = useState(null);

  useEffect(() => {
    fetchStock().then(setStock).catch(console.error);
    fetchNews().then(setNews).catch(console.error);
  }, []);

  return (
    <div>
      {/* Stock */}
      <div style={{ ...S.card, marginBottom: 20 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Stock – {stock?.ticker || '...'}</h3>
        {stock && (
          <>
            <div style={S.stockPrice}>{stock.currency === 'KRW' ? '₩' : '$'}{stock.last_price.toLocaleString()}</div>
            <div style={{ color: stock.change_90d_pct >= 0 ? '#28a745' : '#e74c3c', fontWeight: 600, marginBottom: 12 }}>
              {stock.change_90d_pct >= 0 ? '+' : ''}{stock.change_90d_pct}% (90d)
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: 80, gap: 1 }}>
              {stock.series.slice(-60).map((p, i, arr) => {
                const min = Math.min(...arr.map(x => x.price));
                const max = Math.max(...arr.map(x => x.price));
                const h = max === min ? 40 : ((p.price - min) / (max - min)) * 70 + 10;
                return <div key={i} style={{ flex: 1, background: '#4361ee', borderRadius: '2px 2px 0 0', height: h, opacity: 0.7 }} title={`${p.date}: $${p.price}`} />;
              })}
            </div>
          </>
        )}
      </div>

      {/* News */}
      <div style={S.card}>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Recent News</h3>
        {news && news.map((n) => (
          <div key={n.id} style={S.newsItem}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{n.date} – {n.source}</div>
            <div style={{ fontSize: 13, color: '#444' }}>{n.summary}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// App
// ────────────────────────────────────────────────────────
export default function App() {
  const [role, _setRole] = useState(getRole());
  const [tab, setTab] = useState('chat');

  function handleRoleChange(e) {
    const r = e.target.value;
    _setRole(r);
    setRole(r);
  }

  return (
    <div style={S.body}>
      <div style={S.header}>
        <span style={S.brand}>LG Electronics Wiki</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, opacity: 0.8 }}>Role:</span>
          <select style={S.roleSelect} value={role} onChange={handleRoleChange}>
            <option value="EMPLOYEE">Employee</option>
            <option value="HR">HR</option>
            <option value="FINANCE">Finance</option>
            <option value="PRESIDENT">President</option>
          </select>
        </div>
      </div>

      <div style={S.tabs}>
        {['chat', 'overlap', 'external'].map((t) => (
          <div key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>
            {{ chat: 'Chat', overlap: 'Project Overlap', external: 'Stock & News' }[t]}
          </div>
        ))}
      </div>

      <div style={S.main}>
        <div style={S.card}>
          {tab === 'chat' && <ChatPanel />}
          {tab === 'overlap' && <OverlapPanel />}
          {tab === 'external' && <ExternalPanel />}
        </div>
      </div>
    </div>
  );
}
