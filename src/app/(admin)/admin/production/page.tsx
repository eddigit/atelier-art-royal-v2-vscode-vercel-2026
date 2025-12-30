'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Plus, Filter, Eye, Edit, ChevronLeft, ChevronRight,
  Package, Clock, Scissors, CheckCircle, Truck, AlertCircle, Calendar,
  User, RefreshCw
} from 'lucide-react';

interface ProductionOrder {
  _id: string;
  order_id?: { _id: string; order_number: string };
  product_id?: { _id: string; name: string; sku: string };
  quantity: number;
  status: 'pending' | 'cutting' | 'embroidery' | 'finishing' | 'quality_check' | 'ready' | 'shipped';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigned_to?: { name: string };
  customizations?: {
    embroidery_text?: string;
    embroidery_color?: string;
    embroidery_position?: string;
    special_instructions?: string;
  };
  estimated_completion?: string;
  actual_completion?: string;
  notes?: string;
  created_at: string;
}

interface Pagination { page: number; limit: number; total: number; totalPages: number; }

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType; step: number }> = {
  pending: { label: 'En attente', color: 'gray', icon: Clock, step: 0 },
  cutting: { label: 'Découpe', color: 'blue', icon: Scissors, step: 1 },
  embroidery: { label: 'Broderie', color: 'purple', icon: Package, step: 2 },
  finishing: { label: 'Finitions', color: 'indigo', icon: Package, step: 3 },
  quality_check: { label: 'Contrôle', color: 'amber', icon: AlertCircle, step: 4 },
  ready: { label: 'Prêt', color: 'green', icon: CheckCircle, step: 5 },
  shipped: { label: 'Expédié', color: 'cyan', icon: Truck, step: 6 },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Basse', color: 'gray' },
  normal: { label: 'Normale', color: 'blue' },
  high: { label: 'Haute', color: 'orange' },
  urgent: { label: 'Urgent', color: 'red' },
};

export default function ProductionPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [stats, setStats] = useState({ total: 0, inProgress: 0, ready: 0, late: 0 });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pagination.page.toString(), limit: '50' });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/admin/production?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setPagination(data.pagination || pagination);

      // Stats
      const all = data.orders || [];
      const now = new Date();
      setStats({
        total: data.pagination?.total || 0,
        inProgress: all.filter((o: ProductionOrder) => !['ready', 'shipped', 'pending'].includes(o.status)).length,
        ready: all.filter((o: ProductionOrder) => o.status === 'ready').length,
        late: all.filter((o: ProductionOrder) => o.estimated_completion && new Date(o.estimated_completion) < now && !['ready', 'shipped'].includes(o.status)).length
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [pagination.page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchOrders();
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/production/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

  // Vue Kanban
  const KanbanView = () => {
    const columns = Object.entries(statusConfig).filter(([key]) => key !== 'shipped');
    
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(([status, config]) => {
          const columnOrders = orders.filter(o => o.status === status);
          const StatusIcon = config.icon;
          
          return (
            <div key={status} className="flex-shrink-0 w-72">
              <div className={`bg-${config.color}-50 rounded-t-lg px-4 py-3 border border-${config.color}-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-4 w-4 text-${config.color}-600`} />
                    <span className="font-medium text-gray-900">{config.label}</span>
                  </div>
                  <span className={`px-2 py-0.5 bg-${config.color}-200 text-${config.color}-700 rounded-full text-sm font-medium`}>
                    {columnOrders.length}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-b-lg border border-t-0 border-gray-200 p-2 min-h-[400px] space-y-2">
                {columnOrders.map(order => {
                  const priority = priorityConfig[order.priority] || priorityConfig.normal;
                  const isLate = order.estimated_completion && new Date(order.estimated_completion) < new Date() && !['ready', 'shipped'].includes(order.status);

                  return (
                    <div key={order._id} className={`bg-white rounded-lg border ${isLate ? 'border-red-300 bg-red-50' : 'border-gray-200'} p-3 shadow-sm hover:shadow-md transition-shadow`}>
                      <div className="flex items-start justify-between mb-2">
                        <Link href={`/admin/production/${order._id}`} className="font-medium text-gray-900 hover:text-blue-600 text-sm">
                          {order.product_id?.name || 'Produit inconnu'}
                        </Link>
                        <span className={`px-1.5 py-0.5 bg-${priority.color}-100 text-${priority.color}-700 rounded text-xs font-medium`}>
                          {priority.label}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-2 font-mono">{order.product_id?.sku}</p>
                      
                      {order.customizations?.embroidery_text && (
                        <div className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded mb-2">
                          ✨ {order.customizations.embroidery_text}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" /> x{order.quantity}
                        </span>
                        {order.order_id && (
                          <Link href={`/admin/orders/${order.order_id._id}`} className="text-blue-600 hover:underline">
                            #{order.order_id.order_number}
                          </Link>
                        )}
                      </div>
                      
                      {order.estimated_completion && (
                        <div className={`flex items-center gap-1 mt-2 text-xs ${isLate ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                          <Calendar className="h-3 w-3" />
                          {isLate ? '⚠️ ' : ''}{formatDate(order.estimated_completion)}
                        </div>
                      )}
                      
                      {/* Actions rapides */}
                      <div className="flex gap-1 mt-3 pt-2 border-t border-gray-100">
                        {config.step > 0 && (
                          <button onClick={() => updateStatus(order._id, Object.keys(statusConfig)[config.step - 1])}
                            className="flex-1 px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200">
                            ← Retour
                          </button>
                        )}
                        {config.step < 5 && (
                          <button onClick={() => updateStatus(order._id, Object.keys(statusConfig)[config.step + 1])}
                            className="flex-1 px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700">
                            Suivant →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {columnOrders.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-8">Aucun ordre</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production Atelier</h1>
          <p className="text-gray-600 mt-1">Suivi des ordres de fabrication et broderie</p>
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
          <button onClick={fetchOrders} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <RefreshCw className="h-5 w-5" />
          </button>
          <Link href="/admin/production/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-5 w-5" /> Nouvel ordre
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Package, label: 'Total ordres', value: stats.total, color: 'blue' },
          { icon: Scissors, label: 'En production', value: stats.inProgress, color: 'purple' },
          { icon: CheckCircle, label: 'Prêts', value: stats.ready, color: 'green' },
          { icon: AlertCircle, label: 'En retard', value: stats.late, color: 'red' },
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

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Rechercher produit, commande..." value={search} onChange={(e) => setSearch(e.target.value)}
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
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Produit</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Commande</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Qté</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Broderie</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Priorité</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Échéance</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.pending;
                  const priority = priorityConfig[order.priority] || priorityConfig.normal;
                  const StatusIcon = status.icon;
                  const isLate = order.estimated_completion && new Date(order.estimated_completion) < new Date() && !['ready', 'shipped'].includes(order.status);

                  return (
                    <tr key={order._id} className={`hover:bg-gray-50 ${isLate ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4">
                        <Link href={`/admin/products/${order.product_id?._id}`} className="font-medium text-gray-900 hover:text-blue-600">
                          {order.product_id?.name}
                        </Link>
                        <p className="text-xs text-gray-500 font-mono">{order.product_id?.sku}</p>
                      </td>
                      <td className="px-6 py-4">
                        {order.order_id ? (
                          <Link href={`/admin/orders/${order.order_id._id}`} className="text-blue-600 hover:underline font-mono">
                            #{order.order_id.order_number}
                          </Link>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">{order.quantity}</td>
                      <td className="px-6 py-4 text-sm">
                        {order.customizations?.embroidery_text ? (
                          <div className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs max-w-[150px] truncate">
                            {order.customizations.embroidery_text}
                          </div>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 bg-${priority.color}-100 text-${priority.color}-700 rounded-full text-sm font-medium`}>
                          {priority.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-${status.color}-100 text-${status.color}-700 rounded-full text-sm font-medium`}>
                          <StatusIcon className="h-3.5 w-3.5" />{status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {order.estimated_completion ? (
                          <span className={isLate ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            {isLate && '⚠️ '}{formatDate(order.estimated_completion)}
                          </span>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/production/${order._id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="h-4 w-4" /></Link>
                          <Link href={`/admin/production/${order._id}/edit`} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Edit className="h-4 w-4" /></Link>
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
