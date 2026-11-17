import { FormEvent, useEffect, useState } from 'react';
import { Download, Lock, Search, Trash2, Upload } from 'lucide-react';
import { apiFetch, formatBytes, formatISTDateTime } from '../../lib/api';
import type { CaseRecord, ClientRecord, DocumentRecord } from '../../types';

export function DocumentsView() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Upload form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('PETITION');
  const [caseId, setCaseId] = useState('');
  const [clientId, setClientId] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<DocumentRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (categoryFilter !== 'ALL') params.set('category', categoryFilter);

      const [docsRes, casesRes, clientsRes] = await Promise.all([
        apiFetch<{ documents: DocumentRecord[] }>(`/api/documents?${params.toString()}`),
        apiFetch<{ cases: CaseRecord[] }>('/api/cases?archived=false'),
        apiFetch<{ clients: ClientRecord[] }>('/api/clients?archived=false'),
      ]);
      setDocuments(docsRes.documents);
      setCases(casesRes.cases);
      setClients(clientsRes.clients);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a file to upload.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File exceeds maximum 10 MB limit.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      if (caseId) formData.append('caseId', caseId);
      if (clientId) formData.append('clientId', clientId);
      if (notes) formData.append('notes', notes);
      formData.append('file', file);

      await apiFetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      setTitle('');
      setCaseId('');
      setClientId('');
      setNotes('');
      setFile(null);
      const fileInput = document.getElementById('doc-file-input') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/api/documents/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete document.');
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F2342]">
              Document Management Vault · दस्तावेज़ प्रबंधन
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Store petitions, orders, judgments, Khataunis, and Vakalatnamas privately for your chambers.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
            <Lock className="w-4 h-4" aria-hidden="true" />
            <span>Private Authenticated Storage</span>
          </div>
        </div>

        <form onSubmit={handleUpload} className="mt-5 pt-5 border-t border-slate-200 space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Writ Petition Draft / Khatauni Copy"
                className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="PETITION">Petition / Plaint</option>
                <option value="ORDER">Court Order</option>
                <option value="JUDGMENT">Judgment</option>
                <option value="KHATAUNI">Khatauni / Land Record</option>
                <option value="CERTIFICATE">Certificate</option>
                <option value="VAKALATNAMA">Vakalatnama</option>
                <option value="EVIDENCE">Evidence / Exhibit</option>
                <option value="CORRESPONDENCE">Correspondence</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link to Case (Optional)
              </label>
              <select
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="">-- None --</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.internalCode} · {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link to Client (Optional)
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="">-- None --</option>
                {clients.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2">
              <label htmlFor="doc-file-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Select File (PDF, DOC, DOCX, JPG, PNG, TXT — max 10 MB) *
              </label>
              <input
                id="doc-file-input"
                type="file"
                required
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="min-h-[42px] px-4 py-2 bg-[#0F2342] hover:bg-[#162D54] text-white text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              <span>{uploading ? 'Uploading...' : 'Upload Document'}</span>
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div role="alert" className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Search & List */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadData();
            }}
            className="flex-1 flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search document title or filename..."
                className="w-full min-h-[42px] pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <button
              type="submit"
              className="min-h-[42px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0F2342] text-sm font-semibold rounded-lg cursor-pointer"
            >
              Search
            </button>
          </form>

          <select
            aria-label="Filter by document category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
          >
            <option value="ALL">All Categories</option>
            <option value="PETITION">Petition</option>
            <option value="ORDER">Court Order</option>
            <option value="JUDGMENT">Judgment</option>
            <option value="KHATAUNI">Khatauni</option>
            <option value="CERTIFICATE">Certificate</option>
            <option value="VAKALATNAMA">Vakalatnama</option>
            <option value="EVIDENCE">Evidence</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading documents...</p>
        ) : documents.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No documents uploaded yet. Files uploaded here stay private to your account.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="py-3 pr-4 font-semibold">Title &amp; File</th>
                  <th className="py-3 pr-4 font-semibold">Category</th>
                  <th className="py-3 pr-4 font-semibold">Linked Case / Client</th>
                  <th className="py-3 pr-4 font-semibold">Size &amp; Date</th>
                  <th className="py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="py-3.5 pr-4">
                      <p className="font-semibold text-[#0F2342]">{doc.title}</p>
                      <p className="text-xs font-mono text-slate-500">{doc.originalFilename}</p>
                    </td>
                    <td className="py-3.5 pr-4 text-xs text-slate-700">{doc.category}</td>
                    <td className="py-3.5 pr-4 text-xs text-slate-600">
                      {doc.case ? `${doc.case.internalCode} · ${doc.case.title}` : ''}
                      {doc.case && doc.client ? ' / ' : ''}
                      {doc.client ? doc.client.fullName : !doc.case ? '—' : ''}
                    </td>
                    <td className="py-3.5 pr-4 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                      <span>{formatBytes(doc.fileSize)}</span>
                      <span aria-hidden="true" className="mx-1.5">·</span>
                      <span>{formatISTDateTime(doc.createdAt)}</span>
                    </td>
                    <td className="py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={`/api/documents/${doc.id}/download`}
                          className="min-h-[36px] px-3 py-1.5 border border-slate-200 hover:border-[#0F2342] rounded-lg text-xs font-semibold text-[#0F2342] inline-flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Download</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(doc)}
                          aria-label={`Delete ${doc.title}`}
                          className="min-h-[36px] px-2.5 py-1.5 border border-slate-200 hover:border-red-600 rounded-lg text-xs text-red-700 inline-flex items-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-[#0F2342]">Confirm Document Deletion</h2>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to permanently delete <strong>{deleteTarget.title}</strong> (
              <span className="font-mono text-xs">{deleteTarget.originalFilename}</span>)? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="min-h-[40px] px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="min-h-[40px] px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-sm font-semibold cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
