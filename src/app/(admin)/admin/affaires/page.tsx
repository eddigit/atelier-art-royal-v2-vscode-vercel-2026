import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function DealsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Affaires</h1>
        <p className="text-gray-600 mt-2">Pipeline commercial Kanban multi-collaborateurs</p>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <p className="text-gray-600">Page CRM Kanban affaires - À implémenter avec l'API</p>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-500"><strong>API disponible :</strong></p>
          <p className="text-sm font-mono text-blue-600">GET /api/admin/deals?view=kanban - Vue Kanban par étapes</p>
          <p className="text-sm font-mono text-blue-600">POST /api/admin/deals - Créer affaire</p>
          <p className="text-sm text-gray-500 mt-4"><strong>Fonctionnalités :</strong></p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li><strong>Vue Kanban :</strong> Lead → Qualification → Proposition → Négociation → Conclusion → Gagné/Perdu</li>
            <li>Drag & drop entre colonnes</li>
            <li>Valeur estimée + probabilité de closing</li>
            <li>Multi-commerciaux avec assignation</li>
            <li>Activités : appels, emails, meetings, notes, tâches</li>
            <li>Prochaine action + date</li>
            <li>Priorités (low, medium, high, critical)</li>
            <li>Tags et filtres personnalisés</li>
            <li>Stats pipeline : valeur pondérée, taux conversion, cycle de vente</li>
            <li>Lien avec leads</li>
            <li>Commission commerciale</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
