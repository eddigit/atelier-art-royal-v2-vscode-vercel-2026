import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commandes</h1>
          <p className="text-gray-600 mt-2">Gérez les commandes de toutes sources (Web, POS, Devis)</p>
        </div>
        <Link
          href="/admin/orders/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle commande
        </Link>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <p className="text-gray-600">Page de gestion des commandes - À implémenter avec l'API</p>
        <p className="text-sm text-gray-500 mt-2">API disponible : /api/admin/orders</p>
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">Sources supportées :</p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li>Web : Commandes e-commerce</li>
            <li>POS : Ventes en atelier</li>
            <li>Quote : Commandes issues de devis commerciaux</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
