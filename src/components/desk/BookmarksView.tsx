import { FormEvent, useEffect, useState } from 'react';
import { Edit3, ExternalLink, Plus, ShieldCheck, Trash2, X } from 'lucide-react';
import { apiFetch, openAndTrackOfficialPortal } from '../../lib/api';
import type { BookmarkRecord } from '../../types';

const CATEGORY_LABELS: Record<string, string> = {
  HIGH_COURT: 'High Court',
  CIVIL_COURT: 'Civil / District Court',
  LAND_RECORDS: 'UP Land Records',
  E_DISTRICT: 'e-District UP',
  REVENUE: 'Revenue Courts',
  OTHER: 'Other Legal Links',
};

export function BookmarksView() {
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BookmarkRecord | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [notes, setNotes] = useState('');

  const loadBookmarks = async () => {
    setLoading(true);
    setError('');
    try {
      const params = categoryFilter !== 'ALL' ? `?category=${categoryFilter}` : '';
      const res = await apiFetch<{ bookmarks: BookmarkRecord[] }>(`/api/bookmarks${params}`);
      setBookmarks(res.bookmarks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load bookmarks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, [categoryFilter]);

  const openCreate = () => {
    setEditing(null);
    setTitle('');
    setUrl('https://');
    setCategory('OTHER');
    setNotes('');
    setModalOpen(true);
  };

  const openEdit = (b: BookmarkRecord) => {
    setEditing(b);
    setTitle(b.title);
    setUrl(b.url);
    setCategory(b.category);
    setNotes(b.notes || '');
    setModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await apiFetch(`/api/bookmarks/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ title, url, category, notes }),
        });
      } else {
        await apiFetch('/api/bookmarks', {
          method: 'POST',
          body: JSON.stringify({ title, url, category, notes }),
        });
      }
      setModalOpen(false);
      await loadBookmarks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save bookmark.');
    }
  };

  const handleDelete = async (id: string) => {
    await apiFetch(`/api/bookmarks/${id}`, { method: 'DELETE' });
    await loadBookmarks();
  };

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2342]">
            Important Websites &amp; Bookmarks · महत्वपूर्ण वेबसाइट्स
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Verified official portals and your own custom chamber bookmarks. Custom links are clearly marked as user-saved.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="min-h-[44px] px-4 py-2.5 bg-[#0F2342] hover:bg-[#162D54] text-white text-sm font-semibold rounded-lg inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Custom Link</span>
        </button>
      </section>

      <div className="flex flex-wrap items-center gap-1.5">
        {['ALL', ...Object.keys(CATEGORY_LABELS)].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
              categoryFilter === cat
                ? 'bg-[#0F2342] text-white border-[#0F2342]'
                : 'bg-white text-slate-700 border-slate-200 hover:border-[#0F2342]'
            }`}
          >
            {cat === 'ALL' ? 'All Categories' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
          Loading bookmarks...
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
          No bookmarks in this category yet.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map((b) => (
            <article key={b.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 text-xs mb-2">
                  {b.isOfficial ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                      Verified Official Portal
                    </span>
                  ) : (
                    <span className="font-semibold text-slate-500">Custom User Bookmark</span>
                  )}
                  <span className="text-[11px] text-slate-500">{CATEGORY_LABELS[b.category] || b.category}</span>
                </div>

                <h2 className="text-base font-bold text-[#0F2342]">{b.title}</h2>
                <p className="text-xs font-mono text-slate-500 mt-1 truncate">{b.url}</p>
                {b.notes && <p className="text-xs text-slate-600 mt-2">{b.notes}</p>}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => openAndTrackOfficialPortal(b.title, b.url, b.portalLinkId || undefined, true)}
                  className="flex-1 min-h-[40px] px-3 py-1.5 bg-[#0F2342] hover:bg-[#162D54] text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open Website</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(b)}
                  aria-label={`Edit ${b.title}`}
                  className="p-2 border border-slate-200 hover:border-[#0F2342] rounded-lg text-slate-600 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(b.id)}
                  aria-label={`Delete ${b.title}`}
                  className="p-2 border border-slate-200 hover:border-red-600 rounded-lg text-red-700 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-lg font-bold text-[#0F2342]">
                {editing ? 'Edit Bookmark' : 'Add Custom Bookmark'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL *</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="min-h-[40px] px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] px-4 py-2 bg-[#0F2342] text-white rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Save Bookmark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
