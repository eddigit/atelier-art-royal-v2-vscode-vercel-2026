import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ReviewsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Avis</h1>
        <p className="text-gray-600 mt-2">Modération et réponse aux avis clients</p>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <p className="text-gray-600">Page gestion avis/reviews - À implémenter avec l'API</p>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-500"><strong>API disponible :</strong></p>
          <p className="text-sm font-mono text-blue-600">GET /api/admin/reviews - Liste avis (filtres status, rating)</p>
          <p className="text-sm font-mono text-blue-600">PATCH /api/admin/reviews/[id] - Approuver/rejeter/répondre</p>
          <p className="text-sm text-gray-500 mt-4"><strong>Fonctionnalités :</strong></p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li>Modération : pending → approved/rejected</li>
            <li>Filtres par note (1-5 étoiles)</li>
            <li>Réponse aux avis</li>
            <li>Badge "achat vérifié"</li>
            <li>Images dans avis</li>
            <li>Stats : note moyenne, nb avis en attente</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
