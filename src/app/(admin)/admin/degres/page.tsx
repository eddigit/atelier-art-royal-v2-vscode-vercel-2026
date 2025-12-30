import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function DegreesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Degrés</h1>
        <p className="text-gray-600 mt-2">Degrés maçonniques par obédience</p>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <p className="text-gray-600">Page gestion degrés - Utilise API DegreeOrder existante</p>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-500"><strong>API disponible :</strong></p>
          <p className="text-sm font-mono text-blue-600">GET /api/degrees - Liste degrés</p>
          <p className="text-sm text-gray-500"><strong>Note :</strong> Le modèle DegreeOrder existe déjà</p>
          <p className="text-sm text-gray-500 mt-4"><strong>À créer :</strong></p>
          <p className="text-sm font-mono text-blue-600">POST /api/admin/degrees - Créer degré</p>
          <p className="text-sm font-mono text-blue-600">PATCH /api/admin/degrees/[id] - Modifier</p>
          <p className="text-sm font-mono text-blue-600">DELETE /api/admin/degrees/[id] - Supprimer</p>
          <p className="text-sm text-gray-500 mt-4"><strong>Fonctionnalités :</strong></p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li>CRUD degrés maçonniques</li>
            <li>Niveau (1er, 2ème, 3ème, etc.)</li>
            <li>Type de loge (blue_lodge, scottish_rite, york_rite, etc.)</li>
            <li>Lien avec obédiences</li>
            <li>Association aux produits</li>
            <li>Ordre d'affichage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
