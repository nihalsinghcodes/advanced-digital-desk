import { FormEvent, useEffect, useState } from 'react';
import { Archive, ArchiveRestore, Briefcase, Edit3, Phone, Plus, Search, X } from 'lucide-react';
import { apiFetch, formatISTDate } from '../../lib/api';
import type { ClientRecord } from '../../types';

interface ClientsViewProps {
  onDataChanged: () => void;
}

export function ClientsView({ onDataChanged }: ClientsViewProps) {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClientRecord | null>(null);
  const [fullName, setFullName] = useState('');
  const [fatherOrSpouseName, setFatherOrSpouseName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Lucknow');
  const [district, setDistrict] = useState('Lucknow');
  const [privateNotes, setPrivateNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadClients = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      params.set('archived', String(showArchived));
      const res = await apiFetch<{ clients: ClientRecord[] }>(`/api/clients?${params.toString()}`);
      setClients(res.clients);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load clients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [showArchived]);

  const loadClientDetail = async (id: string) => {
    try {
      const res = await apiFetch<{ client: ClientRecord }>(`/api/clients/${id}`);
      setSelectedClient(res.client);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load client details.');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFullName('');
    setFatherOrSpouseName('');
    setPhone('');
    setAlternatePhone('');
    setEmail('');
    setAddress('');
    setCity('Lucknow');
    setDistrict('Lucknow');
    setPrivateNotes('');
    setModalOpen(true);
  };

  const openEdit = (cl: ClientRecord) => {
    setEditing(cl);
    setFullName(cl.fullName);
    setFatherOrSpouseName(cl.fatherOrSpouseName || '');
    setPhone(cl.phone);
    setAlternatePhone(cl.alternatePhone || '');
    setEmail(cl.email || '');
    setAddress(cl.address || '');
    setCity(cl.city || 'Lucknow');
    setDistrict(cl.district || 'Lucknow');
    setPrivateNotes(cl.privateNotes || '');
    setModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        fullName,
        fatherOrSpouseName,
        phone,
        alternatePhone,
        email,
        address,
        city,
        district,
        privateNotes,
      };
      if (editing) {
        await apiFetch(`/api/clients/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        if (selectedClient?.id === editing.id) await loadClientDetail(editing.id);
      } else {
        await apiFetch('/api/clients', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setModalOpen(false);
      await loadClients();
      onDataChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save client.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveToggle = async (cl: ClientRecord) => {
    await apiFetch(`/api/clients/${cl.id}/archive`, { method: 'POST' });
    if (selectedClient?.id === cl.id) setSelectedClient(null);
    await loadClients();
    onDataChanged();
  };

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F2342]">Client Management · मुवक्किल प्रबंधन</h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Confidential directory of clients, contact records, and connected cases.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="min-h-[44px] px-4 py-2.5 bg-[#0F2342] hover:bg-[#162D54] text-white text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Client · नया मुवक्किल</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadClients();
            }}
            className="flex-1 flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by client name, phone, city..."
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

          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className={`min-h-[42px] px-4 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
              showArchived
                ? 'bg-[#9A6F1F] text-white border-[#9A6F1F]'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            {showArchived ? 'Viewing Archived Clients' : 'Show Archived'}
          </button>
        </div>
      </section>

      {error && (
        <div role="alert" className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        <section className={`${selectedClient ? 'lg:col-span-6' : 'lg:col-span-12'} bg-white border border-slate-200 rounded-xl overflow-hidden`}>
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading clients...</div>
          ) : clients.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-base font-semibold text-slate-800">No client records found.</p>
              <p className="text-sm text-slate-500 mt-1">Add a client to link multiple cases and documents.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {clients.map((cl) => (
                <div key={cl.id} className="p-4 sm:p-5 hover:bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => loadClientDetail(cl.id)}
                    className="text-left flex-1 min-w-0 cursor-pointer"
                  >
                    <h3 className="text-base font-bold text-[#0F2342]">{cl.fullName}</h3>
                    {cl.fatherOrSpouseName && (
                      <p className="text-xs text-slate-500 mt-0.5">S/o, W/o: {cl.fatherOrSpouseName}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1.5 tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                        {cl.phone}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {cl.city}, {cl.district}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-[#0F2342]">
                        {cl._count?.cases ?? 0} Case(s)
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(cl)}
                      className="min-h-[38px] px-3 py-1.5 border border-slate-200 hover:border-[#0F2342] rounded-lg text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleArchiveToggle(cl)}
                      className="min-h-[38px] px-3 py-1.5 border border-slate-200 hover:border-amber-700 rounded-lg text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      {cl.isArchived ? (
                        <>
                          <ArchiveRestore className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Restore</span>
                        </>
                      ) : (
                        <>
                          <Archive className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Archive</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {selectedClient && (
          <section className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#0F2342]">{selectedClient.fullName}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Client since {formatISTDate(selectedClient.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                aria-label="Close client detail"
                className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <dl className="grid sm:grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-500">Phone</dt>
                <dd className="font-mono font-semibold text-slate-900 mt-0.5">{selectedClient.phone}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-900 mt-0.5">{selectedClient.email || '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Address</dt>
                <dd className="font-medium text-slate-900 mt-0.5">
                  {selectedClient.address || `${selectedClient.city}, ${selectedClient.district}`}
                </dd>
              </div>
            </dl>

            {selectedClient.privateNotes && (
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <p className="font-semibold text-slate-800">Private Advocate Notes</p>
                <p className="text-slate-700 mt-1 whitespace-pre-line">{selectedClient.privateNotes}</p>
              </div>
            )}

            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-sm font-bold text-[#0F2342] flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-[#9A6F1F]" aria-hidden="true" />
                <span>Connected Cases ({selectedClient.cases?.length || 0})</span>
              </h3>
              {(selectedClient.cases?.length || 0) === 0 ? (
                <p className="text-xs text-slate-500">No cases linked to this client yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100 text-xs">
                  {selectedClient.cases?.map((c) => (
                    <li key={c.id} className="py-2.5">
                      <p className="font-semibold text-[#0F2342]">
                        {c.internalCode} · {c.title}
                      </p>
                      <p className="text-slate-600 mt-0.5">
                        {c.courtName} · Status: {c.status}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-lg font-bold text-[#0F2342]">
                {editing ? 'Edit Client Information' : 'Add New Client · नया मुवक्किल जोड़ें'}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Father&apos;s / Spouse Name
                </label>
                <input
                  type="text"
                  value={fatherOrSpouseName}
                  onChange={(e) => setFatherOrSpouseName(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Private Notes</label>
                <textarea
                  rows={2}
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="min-h-[42px] px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-[42px] px-5 py-2 bg-[#0F2342] text-white rounded-lg text-sm font-semibold cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
