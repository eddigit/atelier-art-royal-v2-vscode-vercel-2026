'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, BookOpen, Package, X } from 'lucide-react';

interface Rite {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  abbreviation?: string;
  is_active: boolean;
  sort_order: number;
  products_count?: number;
}

export default function RitesPage() {
  const [rites, setRites] = useState<Rite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRite, setEditingRite] = useState<Rite | null>(null);
  const [formData, setFormData] = useState({ name: '', abbreviation: '', description: '', is_active: true, sort_order: 0 });

  const fetchRites = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rites');
      const data = await res.json();
      setRites(data.rites || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRites(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingRite ? `/api/admin/rites/${editingRite._id}` : '/api/admin/rites';
      const method = editingRite ? 'PATCH' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      setShowModal(false);
      setEditingRite(null);
      setFormData({ name: '', abbreviation: '', description: '', is_active: true, sort_order: 0 });
      fetchRites();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce rite ? Les produits associés perdront cette relation.')) return;
    try {
      await fetch(`/api/admin/rites/${id}`, { method: 'DELETE' });
      fetchRites();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const openEdit = (rite: Rite) => {
    setEditingRite(rite);
    setFormData({
      name: rite.name,
      abbreviation: rite.abbreviation || '',
      description: rite.description || '',
      is_active: rite.is_active,
      sort_order: rite.sort_order
    });
    setShowModal(true);
  };

  const openNew = () => {
    setEditingRite(null);
    setFormData({ name: '', abbreviation: '', description: '', is_active: true, sort_order: 0 });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rites</h1>
          <p className="text-gray-600 mt-1">Gérez les rites maçonniques associés aux produits</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Plus className="h-5 w-5" /> Nouveau rite
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-gray-500">Chargement...</div>
        ) : rites.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500">Aucun rite configuré</div>
        ) : (
          rites.map(rite => (
            <div key={rite._id} className={`bg-white border-2 rounded-lg p-5 ${rite.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{rite.name}</h3>
                    {rite.abbreviation && <p className="text-sm text-purple-600 font-mono">{rite.abbreviation}</p>}
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full ${rite.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {rite.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
              
              {rite.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{rite.description}</p>
              )}
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <Link href={`/admin/products?rite=${rite._id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600">
                  <Package className="h-4 w-4" />
                  {rite.products_count || 0} produits
                </Link>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(rite)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(rite._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
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
              <h2 className="text-lg font-semibold">{editingRite ? 'Modifier le rite' : 'Nouveau rite'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                  placeholder="Ex: Rite Écossais Ancien et Accepté" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Abréviation</label>
                <input type="text" value={formData.abbreviation} onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                  placeholder="Ex: REAA" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded" />
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
                <button type="submit" className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700">
                  {editingRite ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
