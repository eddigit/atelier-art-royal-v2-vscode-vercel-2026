import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function StatsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-gray-600 mt-2">Analytics e-commerce et visiteurs</p>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <p className="text-gray-600">Page statistiques avancées - À implémenter avec l'API</p>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-500"><strong>API disponible :</strong></p>
          <p className="text-sm font-mono text-blue-600">GET /api/admin/stats?period=30 - Stats complètes</p>
          <p className="text-sm text-gray-500 mt-4"><strong>Fonctionnalités :</strong></p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li><strong>E-commerce :</strong> CA, nb commandes, panier moyen, taux conversion</li>
            <li><strong>Sources :</strong> Web vs POS vs Devis (revenus et volumes)</li>
            <li><strong>Produits :</strong> Top ventes, marges, rotation stock</li>
            <li><strong>Clients :</strong> Nouveaux, récurrents, LTV, segmentation</li>
            <li><strong>Leads :</strong> Tunnel conversion, sources performantes</li>
            <li><strong>Affaires :</strong> Pipeline value, taux closing, durée cycle</li>
            <li><strong>Visiteurs :</strong> Sessions, pages vues, bounce rate (Google Analytics integration)</li>
            <li>Graphiques temporels (jour/semaine/mois)</li>
            <li>Export rapports CSV/Excel</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
