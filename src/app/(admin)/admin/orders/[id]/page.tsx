import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Commande {params.id}</h1>
        <p className="text-gray-600 mt-2">Détails de la commande</p>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <p className="text-gray-600">Page détails commande - À implémenter avec l'API</p>
        <p className="text-sm text-gray-500 mt-2">API : GET /api/admin/orders/{params.id}</p>
      </div>
    </div>
  );
}
