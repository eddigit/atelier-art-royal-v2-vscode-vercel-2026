'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { CheckCircle, Clock, XCircle, Package, MapPin, Mail, ArrowRight } from 'lucide-react';
import LuxeHeaderDark from '@/components/layout/LuxeHeaderDark';
import LuxeFooterDark from '@/components/layout/LuxeFooterDark';
import { Button } from '@/components/ui/button';

interface Order {
  _id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  subtotal: number;
  shipping_cost: number;
  customer_name: string;
  customer_email: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  shipping_address: {
    full_name: string;
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  created_at: string;
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('order');

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setError('Numéro de commande manquant');
      setIsLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        setError('Commande non trouvée');
      }
    } catch (err) {
      setError('Erreur lors du chargement de la commande');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30', label: 'En attente de paiement' },
      paid: { color: 'bg-green-500/20 text-green-400 border border-green-500/30', label: 'Payé' },
      failed: { color: 'bg-red-500/20 text-red-400 border border-red-500/30', label: 'Paiement échoué' },
    };
    const c = config[status] || { color: 'bg-white/10 text-white/70 border border-white/20', label: status };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${c.color}`}>{c.label}</span>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C4A052]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mt-4">{error || 'Commande non trouvée'}</h1>
          <Link href="/catalog">
            <Button className="mt-6 bg-[#C4A052] hover:bg-[#b39142] text-white">Retour au catalogue</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPaymentSuccess = order.payment_status === 'paid';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header de confirmation */}
      <div className="text-center mb-10">
        <div className={`w-24 h-24 ${isPaymentSuccess ? 'bg-green-500/20 border-green-500/30' : 'bg-yellow-500/20 border-yellow-500/30'} border rounded-full flex items-center justify-center mx-auto mb-6`}>
          {isPaymentSuccess ? (
            <CheckCircle className="w-12 h-12 text-green-400" />
          ) : (
            <Clock className="w-12 h-12 text-yellow-400" />
          )}
        </div>
        <h1 className="text-3xl font-bold text-white">
          {isPaymentSuccess ? 'Merci pour votre commande !' : 'Commande en attente'}
        </h1>
        <p className="text-white/60 mt-3 max-w-md mx-auto">
          {isPaymentSuccess 
            ? 'Votre paiement a été confirmé. Votre commande est en cours de préparation.' 
            : 'Votre commande a été enregistrée. Nous vous contacterons pour finaliser le paiement.'}
        </p>
      </div>

      {/* Info commande */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-white/50">Numéro de commande</p>
            <p className="text-2xl font-bold text-[#C4A052]">{order.order_number}</p>
          </div>
          {getStatusBadge(order.payment_status)}
        </div>
        
        <div className="text-sm text-white/50">
          Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      {/* Résumé des articles */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-[#C4A052]" />
          <h2 className="font-semibold text-white">Articles commandés</h2>
        </div>
        
        <div className="space-y-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
              <div>
                <p className="font-medium text-white">{item.product_name}</p>
                <p className="text-sm text-white/50">Qté: {item.quantity} × {item.price.toFixed(2)} €</p>
              </div>
              <span className="font-medium text-white">{item.total.toFixed(2)} €</span>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-white/60">
            <span>Sous-total</span>
            <span>{order.subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-white/60">
            <span>Livraison</span>
            <span>{order.shipping_cost === 0 ? 'Gratuit' : `${order.shipping_cost.toFixed(2)} €`}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-white/10">
            <span>Total</span>
            <span className="text-[#C4A052]">{order.total.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      {/* Adresse de livraison */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-[#C4A052]" />
          <h2 className="font-semibold text-white">Adresse de livraison</h2>
        </div>
        <p className="text-white">{order.shipping_address.full_name}</p>
        <p className="text-white/60">{order.shipping_address.street}</p>
        <p className="text-white/60">{order.shipping_address.postal_code} {order.shipping_address.city}</p>
        <p className="text-white/60">{order.shipping_address.country}</p>
      </div>

      {/* Email de confirmation */}
      <div className="bg-[#C4A052]/10 border border-[#C4A052]/20 rounded-xl p-4 mb-8">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-[#C4A052] mt-0.5" />
          <p className="text-white/80">
            Un email de confirmation a été envoyé à <strong className="text-[#C4A052]">{order.customer_email}</strong>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        {session ? (
          <Link href="/account">
            <Button className="bg-[#C4A052] hover:bg-[#b39142] text-white gap-2">
              Voir mes commandes
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        ) : (
          <Link href="/auth/register">
            <Button className="bg-[#C4A052] hover:bg-[#b39142] text-white gap-2">
              Créer un compte
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
        <Link href="/catalog">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Continuer mes achats
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <>
      <LuxeHeaderDark />
      <main className="min-h-screen bg-[#0a0a0c]">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C4A052]" />
          </div>
        }>
          <OrderConfirmationContent />
        </Suspense>
      </main>
      <LuxeFooterDark />
    </>
  );
}
