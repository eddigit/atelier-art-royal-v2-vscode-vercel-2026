import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function IAPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Intelligence Artificielle</h1>
        <p className="text-gray-600 mt-2">Chat IA Grok - Accompagnement commercial</p>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <p className="text-gray-600">Page configuration Chat IA Grok - À implémenter</p>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-500"><strong>API à créer :</strong></p>
          <p className="text-sm font-mono text-blue-600">POST /api/chat/grok - Proxy vers API Grok</p>
          <p className="text-sm font-mono text-blue-600">GET /api/admin/chat-logs - Historique conversations</p>
          <p className="text-sm text-gray-500 mt-4"><strong>Fonctionnalités :</strong></p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li><strong>Chat frontend :</strong> Widget chat sur toutes pages publiques</li>
            <li><strong>IA Contextuelle :</strong> Connaissance catalogue, obédiences, rites, degrés</li>
            <li><strong>Accompagnement :</strong> Aide au choix produits, personnalisation</li>
            <li><strong>Qualification :</strong> Collecte infos pour leads</li>
            <li><strong>Support :</strong> FAQ, statut commande, contact</li>
            <li><strong>Admin :</strong> Configuration prompts système, logs, analytics conversations</li>
            <li><strong>Grok API :</strong> x.ai API key configuration</li>
            <li>Transfert vers agent humain si nécessaire</li>
            <li>Historique conversations par utilisateur</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
