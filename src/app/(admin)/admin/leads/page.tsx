'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Plus, Filter, Eye, Edit, Trash2, ChevronLeft, ChevronRight,
  User, Mail, Phone, Calendar, MessageSquare, UserPlus, CheckCircle,
  XCircle, Clock, TrendingUp, ArrowRight, Globe, Store, Megaphone, Users
} from 'lucide-react';

interface Lead {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  source: 'website' | 'salon' | 'referral' | 'social' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  estimated_value?: number;
  notes?: string;
  assigned_to?: { name: string };
  obedience?: string;
  rite?: string;
  created_at: string;
  updated_at: string;
}

interface Pagination { page: number; limit: number; total: number; totalPages: number; }

const statusConfig: Record<string, { label: string; color: string; step: number }> = {
  new: { label: 'Nouveau', color: 'blue', step: 1 },
  contacted: { label: 'Contacté', color: 'cyan', step: 2 },
  qualified: { label: 'Qualifié', color: 'indigo', step: 3 },
  proposal: { label: 'Proposition', color: 'purple', step: 4 },
  negotiation: { label: 'Négociation', color: 'amber', step: 5 },
  won: { label: 'Gagné', color: 'green', step: 6 },
  lost: { label: 'Perdu', color: 'red', step: 0 },
};

const sourceConfig: Record<string, { label: string; icon: React.ElementType }> = {
  website: { label: 'Site web', icon: Globe },
  salon: { label: 'Salon', icon: Store },
  referral: { label: 'Parrainage', icon: Users },
  social: { label: 'Réseaux sociaux', icon: Megaphone },
  other: { label: 'Autre', icon: MessageSquare },
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, new: 0, qualified: 0, won: 0, totalValue: 0, conversionRate: 0 });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pagination.page.toString(), limit: '20' });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/admin/leads?${params}`);
      const data = await res.json();
      setLeads(data.leads || []);
      setPagination(data.pagination || pagination);

      // Stats
      const all = data.leads || [];
      const wonLeads = all.filter((l: Lead) => l.status === 'won');
      const lostLeads = all.filter((l: Lead) => l.status === 'lost');
      const closedLeads = wonLeads.length + lostLeads.length;

      setStats({
        total: data.pagination?.total || 0,
        new: all.filter((l: Lead) => l.status === 'new').length,
        qualified: all.filter((l: Lead) => l.status === 'qualified').length,
        won: wonLeads.length,
        totalValue: all.reduce((sum: number, l: Lead) => sum + (l.estimated_value || 0), 0),
        conversionRate: closedLeads > 0 ? Math.round((wonLeads.length / closedLeads) * 100) : 0
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [pagination.page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLeads();
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchLeads();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const convertToCustomer = async (lead: Lead) => {
    if (!confirm(`Convertir ${lead.first_name} ${lead.last_name} en client ?`)) return;
    await updateLeadStatus(lead._id, 'won');
    // TODO: Créer un utilisateur/client à partir du lead
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads / Prospects</h1>
          <p className="text-gray-600 mt-1">Pipeline de prospection commerciale</p>
        </div>
        <button disabled className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-400 rounded-lg cursor-not-allowed" title="Fonctionnalité en cours de développement">
          <Plus className="h-5 w-5" /> Nouveau lead
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { icon: UserPlus, label: 'Total leads', value: stats.total, color: 'blue' },
          { icon: Clock, label: 'Nouveaux', value: stats.new, color: 'cyan' },
          { icon: CheckCircle, label: 'Qualifiés', value: stats.qualified, color: 'purple' },
          { icon: TrendingUp, label: 'Gagnés', value: stats.won, color: 'green' },
          { icon: TrendingUp, label: 'Taux conversion', value: `${stats.conversionRate}%`, color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline visuel */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Pipeline</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Object.entries(statusConfig).filter(([key]) => key !== 'lost').map(([key, config], i, arr) => {
            const count = leads.filter(l => l.status === key).length;
            return (
              <button key={key} onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
                className={`flex-1 min-w-[120px] p-3 rounded-lg border-2 transition-all ${statusFilter === key ? `border-${config.color}-500 bg-${config.color}-50` : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium text-${config.color}-600`}>{config.label}</span>
                  {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-gray-300" />}
                </div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Rechercher nom, email, entreprise..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
            <option value="">Tous statuts</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 inline-flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filtrer
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucun lead trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Entreprise</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Affiliation</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Valeur</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leads.map((lead) => {
                  const status = statusConfig[lead.status] || statusConfig.new;
                  const source = sourceConfig[lead.source] || sourceConfig.other;
                  const SourceIcon = source.icon;

                  return (
                    <tr key={lead._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">{lead.first_name?.charAt(0)}{lead.last_name?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{lead.first_name} {lead.last_name}</p>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>
                              {lead.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{lead.company || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          <SourceIcon className="h-4 w-4" />{source.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {lead.obedience || lead.rite ? (
                          <div>
                            {lead.obedience && <p className="text-gray-600">{lead.obedience}</p>}
                            {lead.rite && <p className="text-gray-500 text-xs">{lead.rite}</p>}
                          </div>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{lead.estimated_value ? formatCurrency(lead.estimated_value) : '-'}</td>
                      <td className="px-6 py-4">
                        <select value={lead.status} onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                          className={`px-2.5 py-1 bg-${status.color}-100 text-${status.color}-700 border-0 rounded-full text-sm font-medium focus:ring-2`}>
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(lead.created_at)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/leads/${lead._id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="h-4 w-4" /></Link>
                          <Link href={`/admin/leads/${lead._id}/edit`} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Edit className="h-4 w-4" /></Link>
                          {lead.status !== 'won' && lead.status !== 'lost' && (
                            <button onClick={() => convertToCustomer(lead)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Convertir en client">
                              <UserPlus className="h-4 w-4" />
                            </button>
                          )}
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button>
              <span className="px-4 py-2 text-sm font-medium">{pagination.page} / {pagination.totalPages}</span>
              <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.totalPages}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
