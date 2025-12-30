import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ChatPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chat Support</h1>
        <p className="text-gray-600 mt-2">Messagerie client en temps réel</p>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <p className="text-gray-600">Page chat support client - À implémenter</p>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-500"><strong>À créer :</strong></p>
          <p className="text-sm font-mono text-blue-600">WebSocket /api/chat/support - Temps réel</p>
          <p className="text-sm font-mono text-blue-600">GET /api/admin/chat/conversations - Liste conversations</p>
          <p className="text-sm text-gray-500 mt-4"><strong>Fonctionnalités :</strong></p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li><strong>Interface admin :</strong> Vue liste conversations actives</li>
            <li><strong>Temps réel :</strong> WebSocket pour messagerie instantanée</li>
            <li><strong>Multi-agents :</strong> Plusieurs conseillers peuvent gérer chats</li>
            <li><strong>Statuts :</strong> En attente, en cours, résolu, fermé</li>
            <li><strong>Infos contextuelles :</strong> Historique commandes client, panier actuel</li>
            <li><strong>Réponses pré-définies :</strong> Templates messages fréquents</li>
            <li><strong>Transfert :</strong> Entre agents ou escalade</li>
            <li><strong>Fichiers :</strong> Partage images/documents</li>
            <li><strong>Notifications :</strong> Nouveau message, client en attente</li>
            <li>Historique et export conversations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
