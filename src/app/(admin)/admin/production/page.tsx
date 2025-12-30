import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ProductionPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion Production</h1>
        <p className="text-gray-600 mt-2">Atelier de broderie et création maçonnique</p>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <p className="text-gray-600">Page gestion production atelier - À implémenter avec l'API</p>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-500"><strong>API disponible :</strong></p>
          <p className="text-sm font-mono text-blue-600">GET /api/admin/production - Liste ordres production</p>
          <p className="text-sm font-mono text-blue-600">POST /api/admin/production - Créer ordre</p>
          <p className="text-sm text-gray-500 mt-4"><strong>Fonctionnalités :</strong></p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li>Vue Kanban : pending → in_progress → quality_check → completed → delivered</li>
            <li>Assignation aux artisans/brodeurs</li>
            <li>Personnalisations : broderie, texte, position, couleur fil</li>
            <li>Priorités (low, normal, high, urgent)</li>
            <li>Date limite et suivi temps (estimé vs réel)</li>
            <li>Notes atelier internes</li>
            <li>Lien avec commandes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
