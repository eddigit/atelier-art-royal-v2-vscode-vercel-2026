import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  UserPlus, 
  Factory, 
  ShoppingCart,
  BookOpen,
  Layers,
  GraduationCap,
  Grid3X3,
  PackageCheck,
  ClipboardList,
  Star,
  Home,
  Bot,
  BarChart3,
  MessageSquare,
  Briefcase
} from 'lucide-react';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    redirect('/auth/login?redirect=/admin');
  }

  const modules = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, description: 'Vue d\'ensemble' },
    { name: 'Produits', href: '/admin/products', icon: Package, description: 'Gestion catalogue' },
    { name: 'Clients', href: '/admin/customers', icon: Users, description: 'Base clients' },
    { name: 'Leads', href: '/admin/leads', icon: UserPlus, description: 'Prospects' },
    { name: 'Production', href: '/admin/production', icon: Factory, description: 'Atelier broderie' },
    { name: 'Commandes', href: '/admin/orders', icon: ShoppingCart, description: 'Gestion commandes' },
    { name: 'Rites', href: '/admin/rites', icon: BookOpen, description: 'Rites maçonniques' },
    { name: 'Obédiences', href: '/admin/obediences', icon: Layers, description: 'Obédiences' },
    { name: 'Degrés', href: '/admin/degres', icon: GraduationCap, description: 'Degrés par obédience' },
    { name: 'Catégories', href: '/admin/categories', icon: Grid3X3, description: 'Catégories produits' },
    { name: 'Stocks', href: '/admin/stocks', icon: PackageCheck, description: 'Gestion stocks' },
    { name: 'Inventaire', href: '/admin/inventaire', icon: ClipboardList, description: 'Inventaires physiques' },
    { name: 'Avis', href: '/admin/reviews', icon: Star, description: 'Modération avis' },
    { name: 'Accueil', href: '/admin/accueil', icon: Home, description: 'Contenu homepage' },
    { name: 'IA', href: '/admin/ia', icon: Bot, description: 'Chat IA Grok' },
    { name: 'Stats', href: '/admin/stats', icon: BarChart3, description: 'Analytics avancées' },
    { name: 'Chat', href: '/admin/chat', icon: MessageSquare, description: 'Support client' },
    { name: 'Affaires', href: '/admin/affaires', icon: Briefcase, description: 'CRM Kanban' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Administration</h1>
        <p className="text-gray-600 text-lg">Gestion complète de la plateforme</p>
      </div>

      {/* Grille des 18 modules */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {modules.map((module) => (
          <Link
            key={module.name}
            href={module.href}
            className="group relative bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <module.icon className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                  {module.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {module.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Section infos */}
      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          Bienvenue dans votre espace d'administration
        </h2>
        <p className="text-blue-700 text-sm">
          Vous avez accès aux 18 modules de gestion de la plateforme Art Royal. 
          Chaque section dispose d'APIs dédiées pour une gestion complète de votre activité : 
          e-commerce, production, CRM, analytics, et intelligence artificielle.
        </p>
      </div>
    </div>
  );
}
