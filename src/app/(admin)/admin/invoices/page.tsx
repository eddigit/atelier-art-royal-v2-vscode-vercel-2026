import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Factures</h1>
          <p className="text-gray-600 mt-2">Gérez vos factures et paiements</p>
        </div>
        <button
          disabled
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-400 text-sm font-medium cursor-not-allowed"
          title="Fonctionnalité en cours de développement"
        >
          <Plus className="w-4 h-4" />
          Nouvelle facture
        </button>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <p className="text-gray-600">Page de gestion des factures - À implémenter avec l'API</p>
        <p className="text-sm text-gray-500 mt-2">API disponible : /api/admin/invoices</p>
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">Fonctionnalités :</p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li>Génération depuis commandes</li>
            <li>Paiements partiels et multiples</li>
            <li>Suivi des impayés</li>
            <li>Export PDF</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
