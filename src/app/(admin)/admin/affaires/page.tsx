'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Plus, Filter, Eye, Edit, Trash2, ChevronLeft, ChevronRight,
  DollarSign, User, Building2, Calendar, ArrowRight, TrendingUp, Target
} from 'lucide-react';

interface Deal {
  _id: string;
  title: string;
  client_name: string;
  company?: string;
  contact_email?: string;
  contact_phone?: string;
  value: number;
  probability: number;
  stage: 'discovery' | 'proposal' | 'negotiation' | 'closing' | 'won' | 'lost';
  source: 'inbound' | 'outbound' | 'referral' | 'event';
  assigned_to?: { name: string };
  expected_close_date?: string;
  notes?: string;
  products?: Array<{ product_id: { name: string }; quantity: number }>;
  created_at: string;
}

interface Pagination { page: number; limit: number; total: number; totalPages: number; }

const stageConfig: Record<string, { label: string; color: string; step: number }> = {
  discovery: { label: 'Découverte', color: 'blue', step: 1 },
  proposal: { label: 'Proposition', color: 'purple', step: 2 },
  negotiation: { label: 'Négociation', color: 'amber', step: 3 },
  closing: { label: 'Closing', color: 'indigo', step: 4 },
  won: { label: 'Gagné', color: 'green', step: 5 },
  lost: { label: 'Perdu', color: 'red', step: 0 },
};

export default function AffairesPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [stats, setStats] = useState({ total: 0, pipeline: 0, won: 0, weighted: 0 });

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pagination.page.toString(), limit: '50', view: 'kanban' });
      if (search) params.append('search', search);
      if (stageFilter) params.append('stage', stageFilter);

      const res = await fetch(`/api/admin/deals?${params}`);
      const data = await res.json();
      setDeals(data.deals || []);
      setPagination(data.pagination || pagination);

      // Stats
      const all = data.deals || [];
      const active = all.filter((d: Deal) => !['won', 'lost'].includes(d.stage));
      setStats({
        total: all.length,
        pipeline: active.reduce((sum: number, d: Deal) => sum + d.value, 0),
        won: all.filter((d: Deal) => d.stage === 'won').reduce((sum: number, d: Deal) => sum + d.value, 0),
        weighted: active.reduce((sum: number, d: Deal) => sum + (d.value * d.probability / 100), 0)
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeals(); }, [pagination.page, stageFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchDeals();
  };

  const updateDealStage = async (dealId: string, newStage: string) => {
    try {
      await fetch(`/api/admin/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
      fetchDeals();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

  // Vue Kanban CRM
  const KanbanView = () => {
    const columns = Object.entries(stageConfig).filter(([key]) => !['won', 'lost'].includes(key));
    
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(([stage, config]) => {
          const columnDeals = deals.filter(d => d.stage === stage);
          const columnValue = columnDeals.reduce((sum, d) => sum + d.value, 0);
          
          return (
            <div key={stage} className="flex-shrink-0 w-80">
              <div className={`bg-${config.color}-50 rounded-t-lg px-4 py-3 border border-${config.color}-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{config.label}</span>
                    <span className={`px-2 py-0.5 bg-${config.color}-200 text-${config.color}-700 rounded-full text-sm font-medium`}>
                      {columnDeals.length}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{formatCurrency(columnValue)}</p>
              </div>
              
              <div className="bg-gray-50 rounded-b-lg border border-t-0 border-gray-200 p-2 min-h-[500px] space-y-2">
                {columnDeals.map(deal => (
                  <div key={deal._id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <Link href={`/admin/affaires/${deal._id}`} className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2">
                        {deal.title}
                      </Link>
                      <span className="text-xs text-gray-400">{deal.probability}%</span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{deal.client_name}</span>
                      </div>
                      {deal.company && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Building2 className="h-4 w-4" />
                          <span>{deal.company}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        {formatCurrency(deal.value)}
                      </div>
                    </div>
                    
                    {deal.expected_close_date && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        Échéance: {formatDate(deal.expected_close_date)}
                      </div>
                    )}
                    
                    {/* Progress bar probabilité */}
                    <div className="mt-3">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-${config.color}-500 rounded-full`} style={{ width: `${deal.probability}%` }} />
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-1 mt-3 pt-2 border-t border-gray-100">
                      {config.step > 1 && (
                        <button onClick={() => updateDealStage(deal._id, Object.keys(stageConfig)[config.step - 2])}
                          className="flex-1 px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200">
                          ←
                        </button>
                      )}
                      <button onClick={() => updateDealStage(deal._id, 'won')}
                        className="flex-1 px-2 py-1 text-xs text-green-700 bg-green-100 rounded hover:bg-green-200">
                        Gagné ✓
                      </button>
                      <button onClick={() => updateDealStage(deal._id, 'lost')}
                        className="flex-1 px-2 py-1 text-xs text-red-700 bg-red-100 rounded hover:bg-red-200">
                        Perdu ✗
                      </button>
                      {config.step < 4 && (
                        <button onClick={() => updateDealStage(deal._id, Object.keys(stageConfig)[config.step])}
                          className="flex-1 px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700">
                          →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {columnDeals.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-8">Aucune affaire</p>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Colonnes Won/Lost */}
        <div className="flex-shrink-0 w-64">
          <div className="bg-green-50 rounded-t-lg px-4 py-3 border border-green-200">
            <span className="font-medium text-green-700">Gagnées</span>
            <p className="text-sm text-green-600">{deals.filter(d => d.stage === 'won').length} affaires</p>
          </div>
          <div className="bg-green-50/50 rounded-b-lg border border-t-0 border-green-200 p-2 min-h-[200px]">
            {deals.filter(d => d.stage === 'won').slice(0, 5).map(deal => (
              <div key={deal._id} className="bg-white rounded p-2 mb-1 text-sm border border-green-100">
                <p className="font-medium text-gray-900 truncate">{deal.title}</p>
                <p className="text-green-600 font-bold">{formatCurrency(deal.value)}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-shrink-0 w-64">
          <div className="bg-red-50 rounded-t-lg px-4 py-3 border border-red-200">
            <span className="font-medium text-red-700">Perdues</span>
            <p className="text-sm text-red-600">{deals.filter(d => d.stage === 'lost').length} affaires</p>
          </div>
          <div className="bg-red-50/50 rounded-b-lg border border-t-0 border-red-200 p-2 min-h-[200px]">
            {deals.filter(d => d.stage === 'lost').slice(0, 5).map(deal => (
              <div key={deal._id} className="bg-white rounded p-2 mb-1 text-sm border border-red-100">
                <p className="font-medium text-gray-900 truncate">{deal.title}</p>
                <p className="text-red-600">{formatCurrency(deal.value)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Affaires CRM</h1>
          <p className="text-gray-600 mt-1">Pipeline commercial et suivi des opportunités</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setViewMode('kanban')} 
              className={`px-3 py-1.5 rounded text-sm font-medium ${viewMode === 'kanban' ? 'bg-white shadow' : 'text-gray-600'}`}>
              Kanban
            </button>
            <button onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded text-sm font-medium ${viewMode === 'table' ? 'bg-white shadow' : 'text-gray-600'}`}>
              Liste
            </button>
          </div>
          <button disabled className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-400 rounded-lg cursor-not-allowed" title="Fonctionnalité en cours de développement">
            <Plus className="h-5 w-5" /> Nouvelle affaire
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Target, label: 'Affaires actives', value: stats.total, color: 'blue' },
          { icon: DollarSign, label: 'Pipeline total', value: formatCurrency(stats.pipeline), color: 'purple' },
          { icon: TrendingUp, label: 'Valeur pondérée', value: formatCurrency(stats.weighted), color: 'amber' },
          { icon: DollarSign, label: 'Gagné ce mois', value: formatCurrency(stats.won), color: 'green' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Rechercher affaire, client..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
            <option value="">Tous stades</option>
            {Object.entries(stageConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 inline-flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filtrer
          </button>
        </form>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">Chargement...</div>
      ) : viewMode === 'kanban' ? (
        <KanbanView />
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Affaire</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Valeur</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Proba.</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Stade</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Échéance</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {deals.map((deal) => {
                  const stage = stageConfig[deal.stage] || stageConfig.discovery;

                  return (
                    <tr key={deal._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link href={`/admin/affaires/${deal._id}`} className="font-medium text-gray-900 hover:text-blue-600">
                          {deal.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{deal.client_name}</p>
                        {deal.company && <p className="text-sm text-gray-500">{deal.company}</p>}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(deal.value)}</td>
                      <td className="px-6 py-4">{deal.probability}%</td>
                      <td className="px-6 py-4">
                        <select value={deal.stage} onChange={(e) => updateDealStage(deal._id, e.target.value)}
                          className={`px-2.5 py-1 bg-${stage.color}-100 text-${stage.color}-700 border-0 rounded-full text-sm font-medium focus:ring-2`}>
                          {Object.entries(stageConfig).map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {deal.expected_close_date ? formatDate(deal.expected_close_date) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/affaires/${deal._id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="h-4 w-4" /></Link>
                          <Link href={`/admin/affaires/${deal._id}/edit`} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Edit className="h-4 w-4" /></Link>
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
