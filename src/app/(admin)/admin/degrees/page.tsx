'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Award, Package, X } from 'lucide-react';

interface Degree {
  _id: string;
  name: string;
  level: number;
  loge_type: 'Loge Symbolique' | 'Loge Hauts Grades';
  description?: string;
  is_active: boolean;
  product_count?: number;
}

type LogeType = 'Loge Symbolique' | 'Loge Hauts Grades';

export default function DegreesPage() {
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDegree, setEditingDegree] = useState<Degree | null>(null);
  const [formData, setFormData] = useState({ name: '', level: 1, loge_type: 'Loge Symbolique' as LogeType, description: '', is_active: true });
  const [filterType, setFilterType] = useState<LogeType | ''>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const degreesRes = await fetch('/api/admin/degrees');
      const degreesData = await degreesRes.json();
      setDegrees(degreesData.degrees || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingDegree ? `/api/admin/degrees/${editingDegree._id}` : '/api/admin/degrees';
      const method = editingDegree ? 'PATCH' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      setShowModal(false);
      setEditingDegree(null);
      setFormData({ name: '', level: 1, loge_type: 'Loge Symbolique', description: '', is_active: true });
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce degré ?')) return;
    try {
      await fetch(`/api/admin/degrees/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const openEdit = (degree: Degree) => {
    setEditingDegree(degree);
    setFormData({
      name: degree.name,
      level: degree.level,
      loge_type: degree.loge_type,
      description: degree.description || '',
      is_active: degree.is_active
    });
    setShowModal(true);
  };

  const openNew = () => {
    setEditingDegree(null);
    setFormData({ name: '', level: 1, loge_type: filterType || 'Loge Symbolique', description: '', is_active: true });
    setShowModal(true);
  };

  // Grouper par type de loge
  const symboliqueDegrees = degrees.filter(d => d.loge_type === 'Loge Symbolique').sort((a, b) => a.level - b.level);
  const hautsGradesDegrees = degrees.filter(d => d.loge_type === 'Loge Hauts Grades').sort((a, b) => a.level - b.level);

  const filteredDegrees = filterType 
    ? (filterType === 'Loge Symbolique' ? symboliqueDegrees : hautsGradesDegrees)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Degrés</h1>
          <p className="text-gray-600 mt-1">Gérez les degrés maçonniques par type de loge</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
          <Plus className="h-5 w-5" /> Nouveau degré
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filtrer par type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value as LogeType | '')} 
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
            <option value="">Tous les types</option>
            <option value="Loge Symbolique">Loge Symbolique</option>
            <option value="Loge Hauts Grades">Loge Hauts Grades</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Chargement...</div>
      ) : (
        <div className="space-y-6">
          {(filteredDegrees ? [{ type: filterType, degrees: filteredDegrees }] : [
            { type: 'Loge Symbolique', degrees: symboliqueDegrees },
            { type: 'Loge Hauts Grades', degrees: hautsGradesDegrees }
          ]).map(group => (
            <div key={group.type} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className={`px-6 py-4 border-b ${group.type === 'Loge Symbolique' ? 'bg-blue-50 border-blue-100' : 'bg-purple-50 border-purple-100'}`}>
                <h2 className={`font-semibold ${group.type === 'Loge Symbolique' ? 'text-blue-900' : 'text-purple-900'}`}>{group.type}</h2>
                <p className={`text-sm ${group.type === 'Loge Symbolique' ? 'text-blue-600' : 'text-purple-600'}`}>{group.degrees.length} degré(s) configuré(s)</p>
              </div>
              
              {group.degrees.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Aucun degré configuré
                  <button onClick={() => { setFilterType(group.type as LogeType); openNew(); }} className="block mx-auto mt-2 text-blue-600 hover:underline">
                    + Ajouter un degré
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {group.degrees.map((degree) => (
                    <div key={degree._id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${group.type === 'Loge Symbolique' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                          <span className={`text-lg font-bold ${group.type === 'Loge Symbolique' ? 'text-blue-700' : 'text-purple-700'}`}>{degree.level}°</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{degree.name}</h3>
                          {degree.description && <p className="text-sm text-gray-500 truncate max-w-md">{degree.description}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${degree.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {degree.is_active ? 'Actif' : 'Inactif'}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Package className="h-4 w-4" />{degree.product_count || 0}
                        </span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(degree)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(degree._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">{editingDegree ? 'Modifier le degré' : 'Nouveau degré'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                  <input type="number" value={formData.level} onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })} required min="1" max="99"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-center text-lg font-bold" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                    placeholder="Ex: Apprenti" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de loge</label>
                <select value={formData.loge_type} onChange={(e) => setFormData({ ...formData, loge_type: e.target.value as LogeType })} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                  <option value="Loge Symbolique">Loge Symbolique</option>
                  <option value="Loge Hauts Grades">Loge Hauts Grades</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded" />
                  <span className="text-sm text-gray-700">Actif</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Annuler</button>
                <button type="submit" className="px-4 py-2 text-white bg-amber-600 rounded-lg hover:bg-amber-700">
                  {editingDegree ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
