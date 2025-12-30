'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import LuxeHeader from '@/components/layout/LuxeHeader';
import LuxeFooter from '@/components/layout/LuxeFooter';
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
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente de paiement' },
      paid: { color: 'bg-green-100 text-green-800', label: 'Payé' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Paiement échoué' },
    };
    const c = config[status] || { color: 'bg-gray-100 text-gray-800', label: status };
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
          <span className="text-6xl">❌</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">{error || 'Commande non trouvée'}</h1>
          <Link href="/catalog">
            <Button className="mt-6 bg-[#C4A052]">Retour au catalogue</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPaymentSuccess = order.payment_status === 'paid';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header de confirmation */}
      <div className="text-center mb-8">
        <div className={`w-20 h-20 ${isPaymentSuccess ? 'bg-green-100' : 'bg-yellow-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <span className="text-4xl">{isPaymentSuccess ? '✓' : '⏳'}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isPaymentSuccess ? 'Merci pour votre commande !' : 'Commande en attente'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isPaymentSuccess 
            ? 'Votre paiement a été confirmé' 
            : 'Votre commande a été enregistrée. Nous vous contacterons pour finaliser le paiement.'}
        </p>
      </div>

      {/* Info commande */}
      <div className="bg-white rounded-xl shadow border p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-500">Numéro de commande</p>
            <p className="text-2xl font-bold text-[#C4A052]">{order.order_number}</p>
          </div>
          {getStatusBadge(order.payment_status)}
        </div>
        
        <div className="text-sm text-gray-500">
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
      <div className="bg-white rounded-xl shadow border p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Articles commandés</h2>
        
        <div className="space-y-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
              <div>
                <p className="font-medium text-gray-900">{item.product_name}</p>
                <p className="text-sm text-gray-500">Qté: {item.quantity} × {item.price.toFixed(2)} €</p>
              </div>
              <span className="font-medium">{item.total.toFixed(2)} €</span>
            </div>
          ))}
        </div>

        <div className="border-t mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Sous-total</span>
            <span>{order.subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Livraison</span>
            <span>{order.shipping_cost === 0 ? 'Gratuit' : `${order.shipping_cost.toFixed(2)} €`}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
            <span>Total</span>
            <span>{order.total.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      {/* Adresse de livraison */}
      <div className="bg-white rounded-xl shadow border p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">📍 Adresse de livraison</h2>
        <p className="text-gray-700">{order.shipping_address.full_name}</p>
        <p className="text-gray-600">{order.shipping_address.street}</p>
        <p className="text-gray-600">{order.shipping_address.postal_code} {order.shipping_address.city}</p>
        <p className="text-gray-600">{order.shipping_address.country}</p>
      </div>

      {/* Email de confirmation */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-blue-800">
          📧 Un email de confirmation a été envoyé à <strong>{order.customer_email}</strong>
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        {session ? (
          <Link href="/account">
            <Button className="bg-[#C4A052] hover:bg-[#b39142]">
              Voir mes commandes
            </Button>
          </Link>
        ) : (
          <Link href="/auth/register">
            <Button className="bg-[#C4A052] hover:bg-[#b39142]">
              Créer un compte
            </Button>
          </Link>
        )}
        <Link href="/catalog">
          <Button variant="outline">
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
      <LuxeHeader />
      <main className="min-h-screen bg-gray-50">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C4A052]" />
          </div>
        }>
          <OrderConfirmationContent />
        </Suspense>
      </main>
      <LuxeFooter />
    </>
  );
}
