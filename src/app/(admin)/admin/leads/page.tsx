import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function LeadsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Leads</h1>
        <p className="text-gray-600 mt-2">Gestion des prospects et opportunités commerciales</p>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <p className="text-gray-600">Page gestion leads/prospects - À implémenter avec l'API</p>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-500"><strong>API disponible :</strong></p>
          <p className="text-sm font-mono text-blue-600">GET /api/admin/leads - Liste avec filtres (status, source, assigned_to, search)</p>
          <p className="text-sm font-mono text-blue-600">POST /api/admin/leads - Créer lead</p>
          <p className="text-sm font-mono text-blue-600">PATCH /api/admin/leads/[id] - Modifier</p>
          <p className="text-sm font-mono text-blue-600">DELETE /api/admin/leads/[id] - Supprimer</p>
          <p className="text-sm text-gray-500 mt-4"><strong>Fonctionnalités :</strong></p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li>Tableau leads avec statuts (new, contacted, qualified, proposal, negotiation, won, lost)</li>
            <li>Filtres par source (website, phone, email, referral, social, event)</li>
            <li>Assignment aux commerciaux</li>
            <li>Suivi actions et prochaines relances</li>
            <li>Conversion en client</li>
            <li>Stats par statut et source</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
