'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Building2, Package, X, Globe, MapPin } from 'lucide-react';

interface Obedience {
  _id: string;
  name: string;
  slug: string;
  abbreviation?: string;
  description?: string;
  country?: string;
  website?: string;
  is_active: boolean;
  sort_order: number;
  products_count?: number;
}

export default function ObediencesPage() {
  const [obediences, setObediences] = useState<Obedience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingObedience, setEditingObedience] = useState<Obedience | null>(null);
  const [formData, setFormData] = useState({ name: '', abbreviation: '', description: '', country: 'France', website: '', is_active: true, sort_order: 0 });

  const fetchObediences = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/obediences');
      const data = await res.json();
      setObediences(data.obediences || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchObediences(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingObedience ? `/api/admin/obediences/${editingObedience._id}` : '/api/admin/obediences';
      const method = editingObedience ? 'PATCH' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      setShowModal(false);
      setEditingObedience(null);
      setFormData({ name: '', abbreviation: '', description: '', country: 'France', website: '', is_active: true, sort_order: 0 });
      fetchObediences();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette obédience ? Les produits associés perdront cette relation.')) return;
    try {
      await fetch(`/api/admin/obediences/${id}`, { method: 'DELETE' });
      fetchObediences();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const openEdit = (obedience: Obedience) => {
    setEditingObedience(obedience);
    setFormData({
      name: obedience.name,
      abbreviation: obedience.abbreviation || '',
      description: obedience.description || '',
      country: obedience.country || 'France',
      website: obedience.website || '',
      is_active: obedience.is_active,
      sort_order: obedience.sort_order
    });
    setShowModal(true);
  };

  const openNew = () => {
    setEditingObedience(null);
    setFormData({ name: '', abbreviation: '', description: '', country: 'France', website: '', is_active: true, sort_order: 0 });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Obédiences</h1>
          <p className="text-gray-600 mt-1">Gérez les obédiences maçonniques associées aux produits</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus className="h-5 w-5" /> Nouvelle obédience
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-gray-500">Chargement...</div>
        ) : obediences.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500">Aucune obédience configurée</div>
        ) : (
          obediences.map(obedience => (
            <div key={obedience._id} className={`bg-white border-2 rounded-lg p-5 ${obedience.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{obedience.name}</h3>
                    {obedience.abbreviation && <p className="text-sm text-indigo-600 font-mono">{obedience.abbreviation}</p>}
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full ${obedience.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {obedience.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                {obedience.country && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />{obedience.country}
                  </p>
                )}
                {obedience.website && (
                  <a href={obedience.website} target="_blank" rel="noopener" className="text-sm text-indigo-600 flex items-center gap-1 hover:underline">
                    <Globe className="h-3.5 w-3.5" />Site web
                  </a>
                )}
                {obedience.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{obedience.description}</p>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <Link href={`/admin/products?obedience=${obedience._id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
                  <Package className="h-4 w-4" />
                  {obedience.products_count || 0} produits
                </Link>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(obedience)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(obedience._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">{editingObedience ? 'Modifier l\'obédience' : 'Nouvelle obédience'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                  placeholder="Ex: Grand Orient de France" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Abréviation</label>
                  <input type="text" value={formData.abbreviation} onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                    placeholder="GODF" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                  <input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="France" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
                <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-sm text-gray-700">Actif</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Ordre:</label>
                  <input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-20 px-2 py-1 border border-gray-300 rounded" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Annuler</button>
                <button type="submit" className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                  {editingObedience ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
