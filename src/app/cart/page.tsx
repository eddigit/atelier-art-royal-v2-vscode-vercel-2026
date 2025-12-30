'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LuxeHeader from '@/components/layout/LuxeHeader';
import LuxeFooter from '@/components/layout/LuxeFooter';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Charger le panier depuis localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setIsLoading(false);
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (id: string) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 500 ? 0 : 15;
  const total = subtotal + shipping;

  if (isLoading) {
    return (
      <>
        <LuxeHeader />
        <main className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="animate-pulse">Chargement...</div>
          </div>
        </main>
        <LuxeFooter />
      </>
    );
  }

  return (
    <>
      <LuxeHeader />
      <main className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-8">Votre Panier</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              Votre panier est vide
            </h2>
            <p className="text-gray-500 mb-8">
              Découvrez notre collection de décors maçonniques
            </p>
            <Link href="/catalog">
              <Button className="bg-gold-600 hover:bg-gold-700">
                Voir le catalogue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg p-4 shadow-sm flex gap-4"
                >
                  {/* Image */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl">🎭</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.productId}`}
                      className="font-medium hover:text-gold-600 line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    {item.sku && (
                      <p className="text-sm text-gray-500 mt-1">Réf: {item.sku}</p>
                    )}
                    <p className="text-gold-600 font-bold mt-2">
                      {item.price.toFixed(2)} €
                    </p>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-2 hover:bg-gray-200 rounded-l-lg"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-2 hover:bg-gray-200 rounded-r-lg"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="font-bold">
                      {(item.price * item.quantity).toFixed(2)} €
                    </p>
                  </div>
                </div>
              ))}

              <Link
                href="/catalog"
                className="inline-flex items-center text-gold-600 hover:text-gold-700 mt-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continuer mes achats
              </Link>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
                <h2 className="font-display text-xl font-bold mb-4">Récapitulatif</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-medium">{subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Livraison</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">Gratuit</span>
                      ) : (
                        `${shipping.toFixed(2)} €`
                      )}
                    </span>
                  </div>
                  {subtotal < 500 && (
                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      Plus que {(500 - subtotal).toFixed(2)} € pour bénéficier de la livraison gratuite
                    </p>
                  )}
                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-gold-600">{total.toFixed(2)} €</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 bg-gold-600 hover:bg-gold-700"
                  size="lg"
                >
                  Passer commande
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Paiement sécurisé par carte bancaire
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      </main>
      <LuxeFooter />
    </>
  );
}
