'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, Truck } from 'lucide-react';
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

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 15;

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setIsLoading(false);
  }, []);

  const updateCart = (newCart: CartItem[]) => {
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));

    // Émettre un événement pour mettre à jour le header
    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: { itemCount: newCart.reduce((sum, item) => sum + item.quantity, 0) }
    }));
  };

  const updateQuantity = (id: string, delta: number) => {
    const updated = cartItems.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    updateCart(updated);
  };

  const removeItem = (id: string) => {
    const updated = cartItems.filter(item => item.id !== id);
    updateCart(updated);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

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
                <Button className="bg-[#C9A227] hover:bg-[#b89223]">
                  Voir le catalogue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {/* Free shipping progress */}
                {remainingForFreeShipping > 0 && (
                  <div className="bg-[#C9A227]/10 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-5 w-5 text-[#C9A227]" />
                      <span className="text-sm font-medium">
                        Plus que <strong>{remainingForFreeShipping.toFixed(2)} €</strong> pour la livraison gratuite !
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#C9A227] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {cartItems.map(item => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg p-4 shadow-sm flex gap-4"
                  >
                    {/* Image */}
                    <Link href={`/product/${item.productId}`} className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.productId}`}
                        className="font-medium hover:text-[#C9A227] line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      {item.sku && (
                        <p className="text-sm text-gray-500 mt-1">Réf: {item.sku}</p>
                      )}
                      <p className="text-[#C9A227] font-bold mt-2">
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
                  className="inline-flex items-center text-[#C9A227] hover:text-[#b89223] mt-4"
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
                      <span className="text-gray-600">Sous-total ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} articles)</span>
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
                    {shipping === 0 && (
                      <p className="text-xs text-green-600 bg-green-50 p-2 rounded flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        Livraison offerte !
                      </p>
                    )}
                    <div className="border-t pt-3 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[#C9A227]">{total.toFixed(2)} €</span>
                    </div>
                  </div>

                  <Link href="/checkout">
                    <Button
                      className="w-full mt-6 bg-[#C9A227] hover:bg-[#b89223]"
                      size="lg"
                    >
                      Passer commande
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>

                  <div className="mt-6 space-y-2 text-xs text-gray-500">
                    <p className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Paiement 100% sécurisé
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Livraison soignée sous 5-7 jours
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Service client disponible
                    </p>
                  </div>
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
