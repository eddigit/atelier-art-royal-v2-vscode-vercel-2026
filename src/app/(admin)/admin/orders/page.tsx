'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Plus, Filter, Eye, Edit, Trash2, ChevronLeft, ChevronRight,
  ShoppingBag, Globe, Store, FileText, Package, Truck, CheckCircle, XCircle,
  Clock, DollarSign
} from 'lucide-react';

interface Order {
  _id: string;
  order_number: string;
  user_id?: { _id: string; name: string; email: string };
  items: Array<{ product_id: { name: string; sku: string }; quantity: number; price: number }>;
  subtotal: number;
  total: number;
  status: string;
  payment_status: string;
  source: 'web' | 'pos' | 'quote';
  created_at: string;
}

interface Pagination { page: number; limit: number; total: number; totalPages: number; }

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'En attente', color: 'yellow', icon: Clock },
  processing: { label: 'En traitement', color: 'blue', icon: Package },
  shipped: { label: 'Expédiée', color: 'purple', icon: Truck },
  delivered: { label: 'Livrée', color: 'green', icon: CheckCircle },
  cancelled: { label: 'Annulée', color: 'red', icon: XCircle },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'yellow' },
  paid: { label: 'Payée', color: 'green' },
  failed: { label: 'Échoué', color: 'red' },
  refunded: { label: 'Remboursée', color: 'purple' },
};

const sourceConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  web: { label: 'Web', color: 'blue', icon: Globe },
  pos: { label: 'Atelier', color: 'green', icon: Store },
  quote: { label: 'Devis', color: 'purple', icon: FileText },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, revenue: 0 });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pagination.page.toString(), limit: '20' });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (sourceFilter) params.append('source', sourceFilter);

      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setPagination(data.pagination || pagination);
      
      const all = data.orders || [];
      setStats({
        total: data.pagination?.total || 0,
        pending: all.filter((o: Order) => o.status === 'pending').length,
        processing: all.filter((o: Order) => o.status === 'processing').length,
        revenue: all.reduce((sum: number, o: Order) => sum + (o.total || 0), 0)
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [pagination.page, statusFilter, sourceFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchOrders();
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commandes</h1>
          <p className="text-gray-600 mt-1">Toutes sources : Web, Atelier POS, Devis</p>
        </div>
        <Link href="/admin/orders/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-5 w-5" /> Nouvelle commande
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: ShoppingBag, label: 'Total commandes', value: stats.total, color: 'blue' },
          { icon: Clock, label: 'En attente', value: stats.pending, color: 'yellow' },
          { icon: Package, label: 'En traitement', value: stats.processing, color: 'purple' },
          { icon: DollarSign, label: 'Revenu affiché', value: formatCurrency(stats.revenue), color: 'green' },
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

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Rechercher n° commande, client..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
            <option value="">Toutes sources</option>
            <option value="web">🌐 Web</option>
            <option value="pos">🏪 Atelier POS</option>
            <option value="quote">📄 Devis</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
            <option value="">Tous statuts</option>
            <option value="pending">En attente</option>
            <option value="processing">En traitement</option>
            <option value="shipped">Expédiée</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 inline-flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filtrer
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucune commande trouvée</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Commande</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Articles</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Paiement</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => {
                    const source = sourceConfig[order.source] || sourceConfig.web;
                    const status = statusConfig[order.status] || statusConfig.pending;
                    const payStatus = paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending;
                    const StatusIcon = status.icon;
                    const SourceIcon = source.icon;

                    return (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4"><p className="font-mono font-medium text-gray-900">#{order.order_number}</p></td>
                        <td className="px-6 py-4">
                          {order.user_id ? (
                            <Link href={`/admin/customers/${order.user_id._id}`} className="text-blue-600 hover:underline">
                              <p className="font-medium">{order.user_id.name}</p>
                              <p className="text-sm text-gray-500">{order.user_id.email}</p>
                            </Link>
                          ) : <span className="text-gray-400">-</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-${source.color}-100 text-${source.color}-700 rounded-full text-sm font-medium`}>
                            <SourceIcon className="h-3.5 w-3.5" />{source.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.items?.length || 0} article(s)</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-${status.color}-100 text-${status.color}-700 rounded-full text-sm font-medium`}>
                            <StatusIcon className="h-3.5 w-3.5" />{status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 bg-${payStatus.color}-100 text-${payStatus.color}-700 rounded-full text-sm font-medium`}>
                            {payStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(order.total)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.created_at)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/orders/${order._id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="h-4 w-4" /></Link>
                            <Link href={`/admin/orders/${order._id}/edit`} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Edit className="h-4 w-4" /></Link>
                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

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
          </>
        )}
      </div>
    </div>
  );
}
