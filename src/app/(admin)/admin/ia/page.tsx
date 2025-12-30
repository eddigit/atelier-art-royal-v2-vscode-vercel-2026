'use client';

import { useState, useEffect } from 'react';
import { Bot, Save, RotateCcw, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function IAPage() {
  const [instructions, setInstructions] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/chat-settings');
      const data = await res.json();
      if (data.settings) {
        setInstructions(data.settings.instructions);
        setIsActive(data.settings.is_active);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/chat-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructions, is_active: isActive })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Instructions sauvegardées avec succès' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchSettings();
    setMessage({ type: 'success', text: 'Instructions réinitialisées' });
    setTimeout(() => setMessage(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Intelligence Artificielle</h1>
          <p className="text-gray-600 mt-2">Configuration du chat commercial IA (Groq)</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Chat activé</span>
          </label>
        </div>
      </div>

      {/* Message de feedback */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Éditeur d'instructions */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Bot className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Instructions système</h2>
          </div>
          <p className="text-sm text-gray-600">
            Ces instructions définissent le comportement et les connaissances de l'assistant commercial IA.
            Utilisez Markdown pour la mise en forme.
          </p>
        </div>

        <div className="p-6">
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Entrez les instructions pour l'assistant IA..."
            className="w-full h-[600px] px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {instructions.length} caractères • Dernière modification : {new Date().toLocaleDateString('fr-FR')}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">🎯 Fonctionnalités du chat IA</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• <strong>Assistance commerciale</strong> : Conseils produits personnalisés</li>
            <li>• <strong>Contextuel</strong> : Connaissance catalogue, rites, obédiences</li>
            <li>• <strong>Qualification</strong> : Collecte infos pour leads</li>
            <li>• <strong>Support</strong> : FAQ, suivi commandes</li>
          </ul>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="font-semibold text-purple-900 mb-3">⚙️ Configuration API</h3>
          <ul className="text-sm text-purple-800 space-y-2">
            <li>• <strong>Provider</strong> : Groq (ultra-rapide)</li>
            <li>• <strong>Modèle</strong> : mixtral-8x7b-32768</li>
            <li>• <strong>Widget</strong> : En bas à droite sur toutes les pages</li>
            <li>• <strong>API publique</strong> : /api/chat/groq</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
