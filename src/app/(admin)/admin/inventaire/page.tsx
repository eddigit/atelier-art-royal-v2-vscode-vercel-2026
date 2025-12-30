import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function InventoryPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventaires</h1>
        <p className="text-gray-600 mt-2">Inventaires physiques et contrôles qualité</p>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <p className="text-gray-600">Page gestion inventaires - À implémenter avec l'API</p>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-500"><strong>API disponible :</strong></p>
          <p className="text-sm font-mono text-blue-600">GET /api/admin/inventory - Liste inventaires</p>
          <p className="text-sm font-mono text-blue-600">POST /api/admin/inventory - Créer inventaire</p>
          <p className="text-sm text-gray-500 mt-4"><strong>Fonctionnalités :</strong></p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li>Créer campagne d'inventaire</li>
            <li>Comptage produit par produit</li>
            <li>Comparaison stock théorique vs réel</li>
            <li>Écarts et raisons (damaged, lost, found, correction, return)</li>
            <li>Ajustement automatique stocks après validation</li>
            <li>Rapports d'inventaire avec statistiques</li>
            <li>Historique inventaires</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
