'use client';

import { useState, useEffect, useRef } from 'react';
import { Notebook, Note } from '@/lib/types';

// Icons
const IconPlus = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const IconTrash = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const IconNotebook = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);
const IconCopy = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

export default function Home() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Load Initial Data
  useEffect(() => {
    async function init() {
      try {
        const nbRes = await fetch('/api/notebooks');
        if (!nbRes.ok) throw new Error(`Notebooks API Error: ${nbRes.statusText}`);
        const nbs = await nbRes.json();
        setNotebooks(nbs);
        if (nbs.length > 0) setSelectedNotebookId(nbs[0].id);

        const nRes = await fetch('/api/notes');
        if (!nRes.ok) throw new Error(`Notes API Error: ${nRes.statusText}`);
        const ns = await nRes.json();
        setNotes(ns);

      } catch (e) {
        console.error("Original Load Failed", e);
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Filtered Notes
  const filteredNotes = notes.filter(n => {
    // Only show notes for selected notebook unless searching globally (optional)
    const matchesNotebook = selectedNotebookId ? n.notebookId === selectedNotebookId : true;
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesNotebook && matchesSearch;
  });

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  // Handlers
  const handleCreateNotebook = async () => {
    const name = prompt("请输入新笔记本名称：");
    if (!name) return;
    try {
      const res = await fetch('/api/notebooks', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      const newNb = await res.json();
      setNotebooks([...notebooks, newNb]);
      setSelectedNotebookId(newNb.id);
    } catch (e) { alert("创建失败"); }
  };

  const handleCreateNote = async () => {
    if (!selectedNotebookId) return;
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        body: JSON.stringify({ notebookId: selectedNotebookId, title: '新笔记', content: '' }),
      });
      const newNote = await res.json();
      setNotes([newNote, ...notes]);
      setSelectedNoteId(newNote.id);
    } catch (e) { alert("创建失败"); }
  };

  const handleDeleteNote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("确定删除此笔记吗？")) return;
    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      setNotes(notes.filter(n => n.id !== id));
      if (selectedNoteId === id) setSelectedNoteId(null);
    } catch (e) { alert("删除失败"); }
  };

  const handleCopy = () => {
    if (!selectedNote) return;
    navigator.clipboard.writeText(selectedNote.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Debounced Save
  const debouncedSave = useRef<NodeJS.Timeout | null>(null);

  const handleUpdateNote = (field: keyof Note, value: string) => {
    if (!selectedNoteId) return;

    // Optimistic Update
    setNotes(notes.map(n => n.id === selectedNoteId ? { ...n, [field]: value, updatedAt: new Date().toISOString() } : n));

    // Server Sync
    setSaving(true);
    if (debouncedSave.current) clearTimeout(debouncedSave.current);
    debouncedSave.current = setTimeout(async () => {
      try {
        await fetch(`/api/notes/${selectedNoteId}`, {
          method: 'PUT',
          body: JSON.stringify({ [field]: value }),
        });
        setSaving(false);
      } catch (e) {
        console.error("Save failed");
        setSaving(false);
      }
    }, 1000);
  };

  if (loading) return <div className="flex-center h-full w-full">Loading...</div>;
  if (error) return (
    <div className="flex-center h-full w-full flex-col" style={{ gap: '20px' }}>
      <div style={{ color: 'red', fontSize: '18px' }}>⚠️ 加载失败</div>
      <pre style={{ background: '#333', padding: '10px', borderRadius: '4px' }}>{error}</pre>
      <p style={{ color: 'var(--text-muted)' }}>请检查 Vercel 环境变量 DATABASE_URL 是否配置正确</p>
    </div>
  );

  return (
    <div className="flex-row h-full w-full">
      {/* Sidebar: Notebooks */}
      <div className="flex-col glass-panel" style={{ width: '260px', borderRight: '1px solid var(--border-color)', zIndex: 10 }}>
        <div className="flex-row flex-center" style={{ padding: '20px', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent-color)' }}>✦</span> 云笔记本
          </h2>
          <button onClick={handleCreateNotebook} className="btn" style={{ padding: '4px', opacity: 0.7 }} title="新建笔记本">
            <IconPlus />
          </button>
        </div>

        <div className="flex-col flex-1" style={{ overflowY: 'auto', padding: '10px' }}>
          {notebooks.map(nb => (
            <div
              key={nb.id}
              onClick={() => { setSelectedNotebookId(nb.id); setSelectedNoteId(null); }}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '4px',
                cursor: 'pointer',
                backgroundColor: selectedNotebookId === nb.id ? 'var(--bg-input)' : 'transparent',
                color: selectedNotebookId === nb.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}
            >
              <IconNotebook />
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{nb.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Middle: Note List */}
      <div className="flex-col" style={{ width: '320px', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-color)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input
              placeholder="搜索笔记..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full"
              style={{ background: 'rgba(0,0,0,0.2)', border: 'none' }}
            />
          </div>
          <button
            onClick={handleCreateNote}
            className="w-full"
            style={{
              background: 'var(--accent-color)',
              color: '#1a1a1a',
              padding: '8px',
              borderRadius: '8px',
              fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <IconPlus /> 新建笔记
          </button>
        </div>

        <div className="flex-1 flex-col" style={{ overflowY: 'auto', padding: '10px' }}>
          {filteredNotes.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>没有笔记</div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                style={{
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  background: selectedNoteId === note.id ? 'var(--bg-card)' : 'transparent',
                  border: selectedNoteId === note.id ? '1px solid var(--accent-glow)' : '1px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                    {note.title || 'Untitled'}
                  </span>
                  {selectedNoteId === note.id && (
                    <span onClick={(e) => handleDeleteNote(e, note.id)} style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <IconTrash />
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {note.content || '无内容'}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: Editor */}
      <div className="flex-1 flex-col" style={{ background: 'var(--bg-main)' }}>
        {selectedNote ? (
          <div className="flex-col h-full">
            <div style={{ padding: '30px 40px 10px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '12px', alignItems: 'center' }}>
                <div className="flex-row" style={{ gap: '15px', alignItems: 'center' }}>
                  <div className="flex-center" style={{ gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px' }}>
                    <span>📂 移动到:</span>
                    <select
                      value={selectedNote.notebookId}
                      onChange={(e) => handleUpdateNote('notebookId', e.target.value)}
                      style={{
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        border: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                    >
                      {notebooks.map(nb => <option key={nb.id} value={nb.id} style={{ color: 'black' }}>{nb.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex-row" style={{ gap: '12px', alignItems: 'center' }}>
                  <span>{new Date(selectedNote.updatedAt).toLocaleString()}</span>
                  <span>{saving ? '☁️ 保存中...' : '✓ 已保存'}</span>
                  <button
                    onClick={handleCopy}
                    title="复制内容"
                    style={{
                      background: copied ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                      color: copied ? '#000' : 'var(--text-primary)',
                      border: 'none',
                      padding: '6px',
                      borderRadius: '6px',
                      display: 'flex',
                      cursor: 'pointer'
                    }}
                  >
                    {copied ? (
                      <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '0 4px' }}>已复制</span>
                    ) : (
                      <IconCopy />
                    )}
                  </button>
                </div>
              </div>
              <input
                value={selectedNote.title}
                onChange={e => handleUpdateNote('title', e.target.value)}
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  outline: 'none',
                  color: 'var(--text-primary)',
                  boxShadow: 'none'
                }}
                placeholder="无标题"
              />
            </div>
            <div className="flex-1" style={{ padding: '0 40px 40px' }}>
              <textarea
                value={selectedNote.content}
                onChange={e => handleUpdateNote('content', e.target.value)}
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'transparent',
                  border: 'none',
                  resize: 'none',
                  outline: 'none',
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: 'var(--text-secondary)',
                  boxShadow: 'none',
                  padding: 0
                }}
                placeholder="开始写作..."
              />
            </div>
          </div>
        ) : (
          <div className="flex-center h-full flex-col" style={{ color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.2 }}>✎</div>
            <p>选择或创建一个笔记开始</p>
          </div>
        )}
      </div>
    </div>
  );
}
