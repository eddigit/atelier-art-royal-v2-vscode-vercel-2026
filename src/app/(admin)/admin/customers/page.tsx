'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Plus, Filter, Mail, Phone, ShoppingBag, Calendar,
  ChevronLeft, ChevronRight, Eye, Edit, Trash2, Users, UserCheck, TrendingUp
} from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  obedience?: string;
  rite?: string;
  degree?: string;
  created_at: string;
  orders_count?: number;
  total_spent?: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pagination.page.toString(), limit: '20' });
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);

      const res = await fetch(`/api/admin/customers?${params}`);
      const data = await res.json();
      setCustomers(data.customers || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, [pagination.page, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCustomers();
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

  const stats = {
    total: pagination.total,
    active: customers.filter(c => c.orders_count && c.orders_count > 0).length,
    newThisMonth: customers.filter(c => {
      const d = new Date(c.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
    totalOrders: customers.reduce((sum, c) => sum + (c.orders_count || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Gestion de la base clients</p>
        </div>
        <button disabled className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-400 rounded-lg cursor-not-allowed" title="Fonctionnalité en cours de développement">
          <Plus className="h-5 w-5" /> Nouveau client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total clients', value: stats.total, color: 'blue' },
          { icon: UserCheck, label: 'Clients actifs', value: stats.active, color: 'green' },
          { icon: TrendingUp, label: 'Nouveaux ce mois', value: stats.newThisMonth, color: 'purple' },
          { icon: ShoppingBag, label: 'Commandes totales', value: stats.totalOrders, color: 'amber' },
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
            <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">Tous les rôles</option>
            <option value="customer">Client</option>
            <option value="admin">Admin</option>
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
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucun client trouvé</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Affiliation</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Commandes</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Inscrit</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">{customer.name?.charAt(0).toUpperCase() || 'C'}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2"><Mail className="h-4 w-4" />{customer.email}</div>
                          {customer.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4" />{customer.phone}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {customer.obedience || customer.rite ? (
                          <div className="space-y-1">
                            {customer.obedience && <p className="text-gray-600">{customer.obedience}</p>}
                            {customer.rite && <p className="text-gray-500">{customer.rite}</p>}
                            {customer.degree && <p className="text-gray-400">{customer.degree}°</p>}
                          </div>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          <ShoppingBag className="h-3.5 w-3.5" />{customer.orders_count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(customer.total_spent || 0)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(customer.created_at)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/customers/${customer._id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="h-4 w-4" /></Link>
                          <Link href={`/admin/customers/${customer._id}/edit`} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Edit className="h-4 w-4" /></Link>
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
