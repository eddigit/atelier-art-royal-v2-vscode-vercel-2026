import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tags, 
  Settings, 
  LogOut,
  Menu,
  BookOpen,
  Layers,
  FileText,
  Receipt,
  UserPlus,
  Factory,
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

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Rediriger si pas admin
  if (!session || session.user?.role !== 'admin') {
    redirect('/auth/login?redirect=/admin');
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Produits', href: '/admin/products', icon: Package },
    { name: 'Clients', href: '/admin/customers', icon: Users },
    { name: 'Leads', href: '/admin/leads', icon: UserPlus },
    { name: 'Production', href: '/admin/production', icon: Factory },
    { name: 'Commandes', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Rites', href: '/admin/rites', icon: BookOpen },
    { name: 'Obédiences', href: '/admin/obediences', icon: Layers },
    { name: 'Degrés', href: '/admin/degres', icon: GraduationCap },
    { name: 'Catégories', href: '/admin/categories', icon: Grid3X3 },
    { name: 'Stocks', href: '/admin/stocks', icon: PackageCheck },
    { name: 'Inventaire', href: '/admin/inventaire', icon: ClipboardList },
    { name: 'Avis', href: '/admin/reviews', icon: Star },
    { name: 'Accueil', href: '/admin/accueil', icon: Home },
    { name: 'IA', href: '/admin/ia', icon: Bot },
    { name: 'Stats', href: '/admin/stats', icon: BarChart3 },
    { name: 'Chat', href: '/admin/chat', icon: MessageSquare },
    { name: 'Affaires', href: '/admin/affaires', icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-neutral-50/50">
      {/* Sidebar Desktop - Tesla/Apple Style */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-6 overflow-y-auto bg-white border-r border-neutral-200/60 px-5 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-neutral-900 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">AR</span>
              </div>
              <div>
                <p className="text-[18px] font-signature text-neutral-900">Art Royal</p>
                <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-neutral-400">Admin</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-x-3 px-3 py-2.5 text-[13px] font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-150"
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0 text-neutral-400 group-hover:text-neutral-600 transition-colors" aria-hidden="true" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* User Info */}
            <div className="mt-auto pt-4 border-t border-neutral-200/60">
              <div className="flex items-center gap-x-3 mb-3 px-3 py-2">
                <div className="h-8 w-8 bg-neutral-900 flex items-center justify-center text-white text-[12px] font-semibold">
                  {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-neutral-900 truncate">
                    {session.user?.name || 'Admin'}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate">
                    {session.user?.email}
                  </p>
                </div>
              </div>
              <Link
                href="/api/auth/signout"
                className="group flex items-center gap-x-3 px-3 py-2.5 text-[13px] font-medium text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
              >
                <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                Déconnexion
              </Link>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar Mobile */}
        <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-4 border-b border-neutral-200/60 bg-white/80 backdrop-blur-xl px-4 lg:hidden">
          <button type="button" className="text-neutral-600 hover:text-neutral-900 transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 flex items-center gap-2">
            <div className="w-6 h-6 bg-neutral-900 flex items-center justify-center">
              <span className="text-white font-semibold text-[10px]">AR</span>
            </div>
            <span className="text-[13px] font-semibold text-neutral-900">Art Royal</span>
          </div>
        </div>

        {/* Page Content */}
        <main className="py-8">
          <div className="px-6 lg:px-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
