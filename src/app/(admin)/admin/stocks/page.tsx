import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function StocksPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Stocks</h1>
        <p className="text-gray-600 mt-2">Suivi en temps réel des stocks et alertes</p>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <p className="text-gray-600">Page gestion stocks - À implémenter avec l'API existante</p>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-500"><strong>API disponible :</strong></p>
          <p className="text-sm font-mono text-blue-600">GET /api/admin/products - Avec filtres stock_status (in_stock, low_stock, out_of_stock)</p>
          <p className="text-sm font-mono text-blue-600">PATCH /api/admin/products/[id]/stock - Ajuster stock</p>
          <p className="text-sm font-mono text-blue-600">POST /api/admin/products/[id]/stock - Définir quantité exacte</p>
          <p className="text-sm text-gray-500 mt-4"><strong>Fonctionnalités :</strong></p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li>Vue d'ensemble stocks (en stock, stock faible, rupture)</li>
            <li>Alertes automatiques seuil bas</li>
            <li>Ajustement rapide quantités</li>
            <li>Historique mouvements stocks</li>
            <li>Produits best-sellers vs rotation lente</li>
            <li>Gestion backorders (commandes en attente de stock)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
