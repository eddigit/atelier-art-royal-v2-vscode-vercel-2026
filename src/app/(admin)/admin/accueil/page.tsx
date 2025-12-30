import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function AccueilPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion Page d'Accueil</h1>
        <p className="text-gray-600 mt-2">Contenu et éléments de la homepage</p>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <p className="text-gray-600">Page gestion contenu homepage - À implémenter</p>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-500"><strong>À créer :</strong></p>
          <p className="text-sm font-mono text-blue-600">API /api/admin/homepage - CRUD sections homepage</p>
          <p className="text-sm text-gray-500 mt-4"><strong>Fonctionnalités :</strong></p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li><strong>Hero banner :</strong> Titre, sous-titre, image, CTA</li>
            <li><strong>Collections mises en avant :</strong> Sélection 3 collections</li>
            <li><strong>Produits vedette :</strong> Carrousel produits</li>
            <li><strong>Bannières promotionnelles :</strong> Offres spéciales, nouveautés</li>
            <li><strong>Section savoir-faire :</strong> Texte + images atelier</li>
            <li><strong>Témoignages :</strong> Avis clients sélectionnés</li>
            <li><strong>SEO :</strong> Meta title, description, keywords</li>
            <li>Prévisualisation avant publication</li>
            <li>Versioning contenu</li>
            <li>Planification publication</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
