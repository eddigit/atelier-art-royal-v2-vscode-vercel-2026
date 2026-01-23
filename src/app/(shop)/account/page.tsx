'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LuxeHeaderDark from '@/components/layout/LuxeHeaderDark';
import LuxeFooterDark from '@/components/layout/LuxeFooterDark';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  _id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  account_type: 'personal' | 'lodge' | 'both';
  lodge_name?: string;
  lodge_number?: string;
  lodge_role?: string;
  lodge_address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  obedience_id?: {
    _id: string;
    name: string;
  };
  rite_id?: {
    _id: string;
    name: string;
  };
  degree?: number;
  billing_address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  shipping_address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
    use_billing_address?: boolean;
  };
  default_shipping_type: 'personal' | 'lodge';
  loyalty_points: number;
  total_orders: number;
  total_spent: number;
  newsletter_subscribed: boolean;
  order_notifications: boolean;
}

interface Order {
  _id: string;
  order_number: string;
  status: string;
  total: number;
  items: Array<{
    product_id: {
      _id: string;
      name: string;
      images?: string[];
    };
    quantity: number;
    price: number;
  }>;
  shipping_address: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  created_at: string;
}

type ActiveTab = 'dashboard' | 'orders' | 'profile' | 'lodge' | 'addresses';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Redirection si non connecté
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/account');
    }
  }, [status, router]);

  // Charger les données
  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile();
      fetchOrders();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/my-orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        toast({ title: 'Succès', description: 'Profil mis à jour' });
      } else {
        throw new Error('Erreur mise à jour');
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le profil', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const reorderItems = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/reorder`, {
        method: 'POST',
      });
      if (response.ok) {
        toast({ title: 'Succès', description: 'Articles ajoutés au panier' });
        router.push('/cart');
      } else {
        throw new Error('Erreur');
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de recommander', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400', label: 'En attente' },
      processing: { color: 'bg-blue-500/20 text-blue-400', label: 'En préparation' },
      shipped: { color: 'bg-purple-500/20 text-purple-400', label: 'Expédié' },
      delivered: { color: 'bg-green-500/20 text-green-400', label: 'Livré' },
      cancelled: { color: 'bg-red-500/20 text-red-400', label: 'Annulé' },
    };
    const config = statusConfig[status] || { color: 'bg-white/10 text-white/60', label: status };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  if (status === 'loading' || isLoading) {
    return (
      <>
        <LuxeHeaderDark />
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C4A052]" />
        </div>
        <LuxeFooterDark />
      </>
    );
  }

  if (!session) {
    return null;
  }

  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'Tableau de bord', icon: '📊' },
    { id: 'orders' as ActiveTab, label: 'Mes commandes', icon: '📦' },
    { id: 'profile' as ActiveTab, label: 'Mon profil', icon: '👤' },
    ...(profile?.account_type !== 'personal' ? [{ id: 'lodge' as ActiveTab, label: 'Ma Loge', icon: '🏛️' }] : []),
    { id: 'addresses' as ActiveTab, label: 'Mes adresses', icon: '📍' },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#C4A052] to-[#b39142] text-white rounded-xl p-6">
          <p className="text-sm opacity-80">Points fidélité</p>
          <p className="text-3xl font-bold">{profile?.loyalty_points || 0}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
          <p className="text-sm text-white/50">Commandes totales</p>
          <p className="text-3xl font-bold text-white">{profile?.total_orders || 0}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
          <p className="text-sm text-white/50">Total dépensé</p>
          <p className="text-3xl font-bold text-white">{(profile?.total_spent || 0).toFixed(2)} €</p>
        </div>
      </div>

      {/* Dernières commandes */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Dernières commandes</h3>
          <Button variant="ghost" onClick={() => setActiveTab('orders')} className="text-[#C4A052]">
            Voir tout →
          </Button>
        </div>
        {orders.length === 0 ? (
          <p className="text-white/50 text-center py-8">Vous n'avez pas encore de commandes</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-lg">
                <div>
                  <p className="font-medium text-white">Commande #{order.order_number}</p>
                  <p className="text-sm text-white/50">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="text-right">
                  {getStatusBadge(order.status)}
                  <p className="text-sm font-medium text-white mt-1">{order.total.toFixed(2)} €</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/catalog" className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center hover:bg-white/[0.05] transition-colors">
          <span className="text-2xl">🛒</span>
          <p className="mt-2 font-medium text-white">Continuer mes achats</p>
        </Link>
        <button onClick={() => setActiveTab('profile')} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center hover:bg-white/[0.05] transition-colors">
          <span className="text-2xl">✏️</span>
          <p className="mt-2 font-medium text-white">Modifier mon profil</p>
        </button>
        <button onClick={() => setActiveTab('addresses')} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center hover:bg-white/[0.05] transition-colors">
          <span className="text-2xl">📍</span>
          <p className="mt-2 font-medium text-white">Gérer mes adresses</p>
        </button>
        <Link href="/catalog" className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center hover:bg-white/[0.05] transition-colors">
          <span className="text-2xl">🎁</span>
          <p className="mt-2 font-medium text-white">Nouveautés</p>
        </Link>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Mes commandes</h2>
      
      {orders.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8 text-center">
          <span className="text-6xl">📦</span>
          <h3 className="mt-4 text-xl font-medium text-white">Aucune commande</h3>
          <p className="text-white/50 mt-2">Vous n'avez pas encore passé de commande</p>
          <Link href="/catalog">
            <Button className="mt-4 bg-[#C4A052] hover:bg-[#b39142]">Découvrir nos produits</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
              <div className="p-4 bg-white/[0.02] border-b border-white/10 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="font-semibold text-white">Commande #{order.order_number}</p>
                  <p className="text-sm text-white/50">{new Date(order.created_at).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <span className="font-bold text-lg text-white">{order.total.toFixed(2)} €</span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product_id?.images?.[0] ? (
                          <img src={item.product_id.images[0]} alt={item.product_id.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{item.product_id?.name || 'Produit'}</p>
                        <p className="text-sm text-white/50">Qté: {item.quantity} × {item.price.toFixed(2)} €</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                  <Button variant="outline" onClick={() => reorderItems(order._id)} className="border-white/20 text-white hover:bg-white/5">
                    🔄 Recommander
                  </Button>
                  <Link href={`/orders/${order._id}`}>
                    <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">Voir les détails</Button>
                  </Link>
                  <Button variant="ghost" className="ml-auto text-white/70 hover:text-white hover:bg-white/5">
                    📄 Télécharger la facture
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <ProfileForm profile={profile} onSave={updateProfile} isSaving={isSaving} />
  );

  const renderLodge = () => (
    <LodgeForm profile={profile} onSave={updateProfile} isSaving={isSaving} />
  );

  const renderAddresses = () => (
    <AddressesForm profile={profile} onSave={updateProfile} isSaving={isSaving} />
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'orders':
        return renderOrders();
      case 'profile':
        return renderProfile();
      case 'lodge':
        return renderLodge();
      case 'addresses':
        return renderAddresses();
      default:
        return renderDashboard();
    }
  };

  return (
    <>
      <LuxeHeaderDark />
      <main className="min-h-screen bg-[#0a0a0c] py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              Bonjour, {profile?.first_name || profile?.name || session.user?.name} 👋
            </h1>
            <p className="text-white/60 mt-1">Bienvenue dans votre espace client</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <nav className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#C4A052] text-white'
                        : 'hover:bg-white/5 text-white/70'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <div className="flex-1">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
      <LuxeFooterDark />
    </>
  );
}

// Sous-composant: Formulaire profil
function ProfileForm({ profile, onSave, isSaving }: { profile: UserProfile | null; onSave: (data: Partial<UserProfile>) => void; isSaving: boolean }) {
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    newsletter_subscribed: profile?.newsletter_subscribed ?? true,
    order_notifications: profile?.order_notifications ?? true,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        newsletter_subscribed: profile.newsletter_subscribed ?? true,
        order_notifications: profile.order_notifications ?? true,
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      name: `${formData.first_name} ${formData.last_name}`,
      full_name: `${formData.first_name} ${formData.last_name}`,
    } as Partial<UserProfile>);
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Mon profil</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Prénom</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Nom</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
          <input type="email" value={profile?.email || ''} disabled className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/50" />
          <p className="text-xs text-white/40 mt-1">L'email ne peut pas être modifié</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Téléphone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent"
          />
        </div>
        
        {/* Profil maçonnique */}
        <div className="border-t border-white/10 pt-6">
          <h3 className="font-semibold text-white mb-4">Profil maçonnique</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/50">Obédience</label>
              <p className="font-medium text-white">{profile?.obedience_id?.name || 'Non renseignée'}</p>
            </div>
            <div>
              <label className="block text-sm text-white/50">Rite</label>
              <p className="font-medium text-white">{profile?.rite_id?.name || 'Non renseigné'}</p>
            </div>
            <div>
              <label className="block text-sm text-white/50">Degré</label>
              <p className="font-medium text-white">{profile?.degree ? `${profile.degree}°` : 'Non renseigné'}</p>
            </div>
          </div>
        </div>
        
        {/* Préférences */}
        <div className="border-t border-white/10 pt-6">
          <h3 className="font-semibold text-white mb-4">Préférences de communication</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.newsletter_subscribed}
                onChange={(e) => setFormData({ ...formData, newsletter_subscribed: e.target.checked })}
                className="w-5 h-5 text-[#C4A052] bg-white/5 border-white/20 rounded"
              />
              <span className="text-white/70">Recevoir la newsletter</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.order_notifications}
                onChange={(e) => setFormData({ ...formData, order_notifications: e.target.checked })}
                className="w-5 h-5 text-[#C4A052] bg-white/5 border-white/20 rounded"
              />
              <span className="text-white/70">Notifications sur mes commandes</span>
            </label>
          </div>
        </div>
        
        <Button type="submit" disabled={isSaving} className="bg-[#C4A052] hover:bg-[#b39142]">
          {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </form>
    </div>
  );
}

// Sous-composant: Formulaire Loge
function LodgeForm({ profile, onSave, isSaving }: { profile: UserProfile | null; onSave: (data: Partial<UserProfile>) => void; isSaving: boolean }) {
  const [formData, setFormData] = useState({
    lodge_name: profile?.lodge_name || '',
    lodge_number: profile?.lodge_number || '',
    lodge_role: profile?.lodge_role || '',
    lodge_street: profile?.lodge_address?.street || '',
    lodge_city: profile?.lodge_address?.city || '',
    lodge_postal_code: profile?.lodge_address?.postal_code || '',
    lodge_country: profile?.lodge_address?.country || 'France',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        lodge_name: profile.lodge_name || '',
        lodge_number: profile.lodge_number || '',
        lodge_role: profile.lodge_role || '',
        lodge_street: profile.lodge_address?.street || '',
        lodge_city: profile.lodge_address?.city || '',
        lodge_postal_code: profile.lodge_address?.postal_code || '',
        lodge_country: profile.lodge_address?.country || 'France',
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      lodge_name: formData.lodge_name,
      lodge_number: formData.lodge_number,
      lodge_role: formData.lodge_role,
      lodge_address: formData.lodge_street ? {
        street: formData.lodge_street,
        city: formData.lodge_city,
        postal_code: formData.lodge_postal_code,
        country: formData.lodge_country,
      } : undefined,
    } as Partial<UserProfile>);
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">🏛️ Ma Loge</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Nom de la Loge</label>
            <input
              type="text"
              value={formData.lodge_name}
              onChange={(e) => setFormData({ ...formData, lodge_name: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent"
              placeholder="Ex: La Parfaite Union"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Numéro de Loge</label>
            <input
              type="text"
              value={formData.lodge_number}
              onChange={(e) => setFormData({ ...formData, lodge_number: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent"
              placeholder="Ex: 123"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Votre fonction en Loge</label>
          <input
            type="text"
            value={formData.lodge_role}
            onChange={(e) => setFormData({ ...formData, lodge_role: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent"
            placeholder="Ex: Secrétaire, Trésorier, Frère..."
          />
        </div>
        
        <div className="border-t border-white/10 pt-6">
          <h3 className="font-semibold text-white mb-4">Adresse du Temple</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={formData.lodge_street}
              onChange={(e) => setFormData({ ...formData, lodge_street: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent"
              placeholder="Rue et numéro"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.lodge_postal_code}
                onChange={(e) => setFormData({ ...formData, lodge_postal_code: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent"
                placeholder="Code postal"
              />
              <input
                type="text"
                value={formData.lodge_city}
                onChange={(e) => setFormData({ ...formData, lodge_city: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent"
                placeholder="Ville"
              />
            </div>
          </div>
        </div>
        
        <Button type="submit" disabled={isSaving} className="bg-[#C4A052] hover:bg-[#b39142]">
          {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </form>
    </div>
  );
}

// Sous-composant: Formulaire Adresses
function AddressesForm({ profile, onSave, isSaving }: { profile: UserProfile | null; onSave: (data: Partial<UserProfile>) => void; isSaving: boolean }) {
  const [billingAddress, setBillingAddress] = useState({
    street: profile?.billing_address?.street || '',
    city: profile?.billing_address?.city || '',
    postal_code: profile?.billing_address?.postal_code || '',
    country: profile?.billing_address?.country || 'France',
  });
  
  const [shippingAddress, setShippingAddress] = useState({
    street: profile?.shipping_address?.street || '',
    city: profile?.shipping_address?.city || '',
    postal_code: profile?.shipping_address?.postal_code || '',
    country: profile?.shipping_address?.country || 'France',
    use_billing_address: profile?.shipping_address?.use_billing_address ?? true,
  });
  
  const [defaultShipping, setDefaultShipping] = useState(profile?.default_shipping_type || 'personal');

  useEffect(() => {
    if (profile) {
      setBillingAddress({
        street: profile.billing_address?.street || '',
        city: profile.billing_address?.city || '',
        postal_code: profile.billing_address?.postal_code || '',
        country: profile.billing_address?.country || 'France',
      });
      setShippingAddress({
        street: profile.shipping_address?.street || '',
        city: profile.shipping_address?.city || '',
        postal_code: profile.shipping_address?.postal_code || '',
        country: profile.shipping_address?.country || 'France',
        use_billing_address: profile.shipping_address?.use_billing_address ?? true,
      });
      setDefaultShipping(profile.default_shipping_type || 'personal');
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      billing_address: billingAddress,
      shipping_address: shippingAddress,
      default_shipping_type: defaultShipping,
    } as Partial<UserProfile>);
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">📍 Mes adresses</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Adresse de facturation */}
        <div>
          <h3 className="font-semibold text-white mb-4">Adresse de facturation</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={billingAddress.street}
              onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent"
              placeholder="Rue et numéro"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={billingAddress.postal_code}
                onChange={(e) => setBillingAddress({ ...billingAddress, postal_code: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent"
                placeholder="Code postal"
              />
              <input
                type="text"
                value={billingAddress.city}
                onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent"
                placeholder="Ville"
              />
            </div>
          </div>
        </div>
        
        {/* Adresse de livraison */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Adresse de livraison</h3>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={shippingAddress.use_billing_address}
                onChange={(e) => setShippingAddress({ ...shippingAddress, use_billing_address: e.target.checked })}
                className="w-4 h-4 text-[#C4A052] bg-white/5 border-white/20 rounded"
              />
              <span className="text-white/70">Identique à la facturation</span>
            </label>
          </div>
          
          {!shippingAddress.use_billing_address && (
            <div className="space-y-4">
              <input
                type="text"
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent"
                placeholder="Rue et numéro"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={shippingAddress.postal_code}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent"
                  placeholder="Code postal"
                />
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#C4A052] focus:border-transparent"
                  placeholder="Ville"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Adresse par défaut (si compte loge) */}
        {profile?.account_type !== 'personal' && (
          <div className="border-t border-white/10 pt-6">
            <h3 className="font-semibold text-white mb-4">Adresse de livraison par défaut</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="defaultShipping"
                  checked={defaultShipping === 'personal'}
                  onChange={() => setDefaultShipping('personal')}
                  className="w-4 h-4 text-[#C4A052]"
                />
                <span className="text-white/70">Mon adresse personnelle</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="defaultShipping"
                  checked={defaultShipping === 'lodge'}
                  onChange={() => setDefaultShipping('lodge')}
                  className="w-4 h-4 text-[#C4A052]"
                />
                <span className="text-white/70">Adresse de la Loge</span>
              </label>
            </div>
          </div>
        )}
        
        <Button type="submit" disabled={isSaving} className="bg-[#C4A052] hover:bg-[#b39142]">
          {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </form>
    </div>
  );
}
