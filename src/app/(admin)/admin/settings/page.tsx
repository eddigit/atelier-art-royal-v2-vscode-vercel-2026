import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-2">Configuration de la boutique</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Général</h2>
          <p className="text-sm text-gray-600">Nom de la boutique, logo, coordonnées</p>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Paiements</h2>
          <p className="text-sm text-gray-600">Configuration des moyens de paiement</p>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Expédition</h2>
          <p className="text-sm text-gray-600">Zones de livraison et tarifs</p>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Taxes</h2>
          <p className="text-sm text-gray-600">Configuration de la TVA</p>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Email</h2>
          <p className="text-sm text-gray-600">Templates et notifications</p>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Utilisateurs</h2>
          <p className="text-sm text-gray-600">Gestion des comptes admin</p>
        </div>
      </div>
    </div>
  );
}
