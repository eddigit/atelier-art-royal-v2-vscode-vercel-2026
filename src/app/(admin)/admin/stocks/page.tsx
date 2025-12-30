'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, AlertTriangle, Package, TrendingUp, TrendingDown,
  ChevronLeft, ChevronRight, Edit, Plus, Minus, Check, X, RefreshCw, Archive
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  stock_alert_threshold: number;
  price: number;
  category_id?: { name: string };
  rite_id?: { name: string };
  obedience_id?: { name: string };
  is_active: boolean;
  images?: string[];
}

interface Pagination { page: number; limit: number; total: number; totalPages: number; }

export default function StocksPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 30, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [stats, setStats] = useState({ total: 0, low: 0, out: 0, totalValue: 0 });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pagination.page.toString(), limit: '30' });
      if (search) params.append('search', search);

      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      let prods = data.products || [];

      // Filtrer par stock
      if (stockFilter === 'low') {
        prods = prods.filter((p: Product) => p.stock_quantity > 0 && p.stock_quantity <= p.stock_alert_threshold);
      } else if (stockFilter === 'out') {
        prods = prods.filter((p: Product) => p.stock_quantity === 0);
      }

      setProducts(prods);
      setPagination(data.pagination || pagination);

      // Stats
      const all = data.products || [];
      setStats({
        total: all.length,
        low: all.filter((p: Product) => p.stock_quantity > 0 && p.stock_quantity <= p.stock_alert_threshold).length,
        out: all.filter((p: Product) => p.stock_quantity === 0).length,
        totalValue: all.reduce((sum: number, p: Product) => sum + (p.stock_quantity * p.price), 0)
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [pagination.page, stockFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchProducts();
  };

  const updateStock = async (productId: string, quantity: number) => {
    try {
      await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_quantity: quantity })
      });
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const quickAdjust = async (productId: string, currentStock: number, delta: number) => {
    const newQty = Math.max(0, currentStock + delta);
    await updateStock(productId, newQty);
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) return { label: 'Rupture', color: 'red', icon: X };
    if (product.stock_quantity <= product.stock_alert_threshold) return { label: 'Stock bas', color: 'yellow', icon: AlertTriangle };
    return { label: 'OK', color: 'green', icon: Check };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Stocks</h1>
          <p className="text-gray-600 mt-1">Suivi et ajustement des quantités en temps réel</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchProducts} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <RefreshCw className="h-5 w-5" /> Actualiser
          </button>
          <Link href="/admin/inventory/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Archive className="h-5 w-5" /> Inventaire
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Package, label: 'Produits actifs', value: stats.total, color: 'blue', onClick: () => setStockFilter('all') },
          { icon: AlertTriangle, label: 'Stock faible', value: stats.low, color: 'yellow', onClick: () => setStockFilter('low') },
          { icon: X, label: 'En rupture', value: stats.out, color: 'red', onClick: () => setStockFilter('out') },
          { icon: TrendingUp, label: 'Valeur stock', value: formatCurrency(stats.totalValue), color: 'green' },
        ].map((stat, i) => (
          <button key={i} onClick={stat.onClick} 
            className={`bg-white border-2 ${stockFilter === (i === 0 ? 'all' : i === 1 ? 'low' : i === 2 ? 'out' : '') ? 'border-blue-500' : 'border-gray-200'} rounded-lg p-4 text-left transition-all hover:border-blue-300`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Rechercher produit, SKU..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 inline-flex items-center gap-2">
            <Filter className="h-4 w-4" /> Rechercher
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucun produit trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Produit</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Rite/Obédience</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Seuil alerte</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Valeur</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ajustement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => {
                  const status = getStockStatus(product);
                  const StatusIcon = status.icon;

                  return (
                    <tr key={product._id} className={`hover:bg-gray-50 ${product.stock_quantity === 0 ? 'bg-red-50' : product.stock_quantity <= product.stock_alert_threshold ? 'bg-yellow-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <Link href={`/admin/products/${product._id}`} className="font-medium text-gray-900 hover:text-blue-600">
                            {product.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-600">{product.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.category_id?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="space-y-1">
                          {product.rite_id && <p className="text-gray-600">{product.rite_id.name}</p>}
                          {product.obedience_id && <p className="text-gray-500 text-xs">{product.obedience_id.name}</p>}
                          {!product.rite_id && !product.obedience_id && <span className="text-gray-400">-</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">{product.stock_alert_threshold}</td>
                      <td className="px-6 py-4 text-center">
                        {editingId === product._id ? (
                          <div className="flex items-center justify-center gap-2">
                            <input type="number" value={editValue} onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border rounded text-center" min="0" />
                            <button onClick={() => updateStock(product._id, editValue)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                              <Check className="h-4 w-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-50 rounded">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingId(product._id); setEditValue(product.stock_quantity); }}
                            className="font-bold text-lg text-gray-900 hover:text-blue-600">
                            {product.stock_quantity}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 bg-${status.color}-100 text-${status.color}-700 rounded-full text-xs font-medium`}>
                          <StatusIcon className="h-3 w-3" />{status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                        {formatCurrency(product.stock_quantity * product.price)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => quickAdjust(product._id, product.stock_quantity, -1)} 
                            className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200" disabled={product.stock_quantity === 0}>
                            <Minus className="h-4 w-4" />
                          </button>
                          <button onClick={() => quickAdjust(product._id, product.stock_quantity, 1)}
                            className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200">
                            <Plus className="h-4 w-4" />
                          </button>
                          <button onClick={() => { setEditingId(product._id); setEditValue(product.stock_quantity); }}
                            className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                            <Edit className="h-4 w-4" />
                          </button>
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
