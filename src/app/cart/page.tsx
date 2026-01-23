'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, Truck, Shield, Package } from 'lucide-react';
import LuxeHeaderDark from '@/components/layout/LuxeHeaderDark';
import LuxeFooterDark from '@/components/layout/LuxeFooterDark';

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
        <LuxeHeaderDark />
        <main className="min-h-screen bg-[#0a0a0c]">
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="animate-pulse text-white/60">Chargement...</div>
          </div>
        </main>
        <LuxeFooterDark />
      </>
    );
  }

  return (
    <>
      <LuxeHeaderDark />
      <main className="min-h-screen bg-[#0a0a0c] pt-8 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-white/50">
            <Link href="/" className="hover:text-[#C5A059] transition-colors">Accueil</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Panier</span>
          </nav>

          {/* Titre */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-full bg-[#C5A059]/10 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-[#C5A059]" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extralight text-white tracking-tight">Votre Panier</h1>
              <p className="text-white/50 text-sm mt-1">{cartItems.length} article{cartItems.length > 1 ? 's' : ''}</p>
            </div>
          </div>

          {cartItems.length === 0 ? (
            /* Panier vide */
            <div className="text-center py-20 bg-white/[0.02] border border-white/10 rounded-2xl">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-white/20" />
              </div>
              <h2 className="text-2xl font-light text-white mb-3">
                Votre panier est vide
              </h2>
              <p className="text-white/50 mb-10 max-w-md mx-auto">
                Découvrez notre collection de décors maçonniques d&apos;exception, confectionnés dans la plus pure tradition artisanale.
              </p>
              <Link href="/catalog">
                <button className="px-8 py-4 bg-[#C5A059] text-black text-sm font-bold tracking-widest uppercase rounded-lg hover:bg-[#D4B44A] transition-all shadow-xl shadow-[#C5A059]/20">
                  Explorer le Catalogue
                  <ArrowRight className="inline-block ml-3 h-4 w-4" />
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Liste des articles */}
              <div className="lg:col-span-2 space-y-4">
                {/* Barre progression livraison gratuite */}
                {remainingForFreeShipping > 0 && (
                  <div className="bg-[#C5A059]/10 border border-[#C5A059]/20 rounded-xl p-5 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Truck className="h-5 w-5 text-[#C5A059]" />
                      <span className="text-white text-sm">
                        Plus que <strong className="text-[#C5A059]">{remainingForFreeShipping.toFixed(2)} €</strong> pour bénéficier de la livraison gratuite !
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#C5A059] to-[#D4B44A] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Articles */}
                {cartItems.map(item => (
                  <article
                    key={item.id}
                    className="bg-white/[0.03] border border-white/10 rounded-xl p-5 flex gap-5 hover:border-[#C5A059]/30 transition-all"
                  >
                    {/* Image */}
                    <Link href={`/product/${item.productId}`} className="w-28 h-28 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 relative">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
                          <span className="text-4xl">🎭</span>
                        </div>
                      )}
                    </Link>

                    {/* Détails */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link
                          href={`/product/${item.productId}`}
                          className="font-medium text-white hover:text-[#C5A059] transition-colors line-clamp-2 text-lg"
                        >
                          {item.name}
                        </Link>
                        {item.sku && (
                          <p className="text-sm text-white/40 mt-1">Réf: {item.sku}</p>
                        )}
                      </div>
                      <p className="text-[#C5A059] font-bold text-xl mt-2">
                        {item.price.toFixed(2)} €
                      </p>
                    </div>

                    {/* Quantité & Actions */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-white/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>

                      <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-2.5 hover:bg-white/10 rounded-l-lg transition-colors text-white/60 hover:text-white"
                          aria-label="Diminuer la quantité"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center font-medium text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-2.5 hover:bg-white/10 rounded-r-lg transition-colors text-white/60 hover:text-white"
                          aria-label="Augmenter la quantité"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="font-bold text-white text-lg">
                        {(item.price * item.quantity).toFixed(2)} €
                      </p>
                    </div>
                  </article>
                ))}

                <Link
                  href="/catalog"
                  className="inline-flex items-center text-white/60 hover:text-[#C5A059] transition-colors mt-6 text-sm tracking-wide"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continuer mes achats
                </Link>
              </div>

              {/* Récapitulatif */}
              <div className="lg:col-span-1">
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 sticky top-24">
                  <h2 className="text-xl font-light text-white mb-6 pb-4 border-b border-white/10">Récapitulatif</h2>

                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Sous-total ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} articles)</span>
                      <span className="font-medium text-white">{subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Livraison</span>
                      <span className="font-medium text-white">
                        {shipping === 0 ? (
                          <span className="text-green-400">Offerte</span>
                        ) : (
                          `${shipping.toFixed(2)} €`
                        )}
                      </span>
                    </div>
                    {shipping === 0 && (
                      <div className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 p-3 rounded-lg flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Livraison offerte !
                      </div>
                    )}
                    <div className="border-t border-white/10 pt-4 flex justify-between text-lg">
                      <span className="font-medium text-white">Total</span>
                      <span className="font-bold text-[#C5A059]">{total.toFixed(2)} €</span>
                    </div>
                  </div>

                  <Link href="/checkout">
                    <button className="w-full mt-6 py-4 bg-[#C5A059] text-black font-bold tracking-widest uppercase text-sm rounded-lg hover:bg-[#D4B44A] transition-all shadow-lg shadow-[#C5A059]/20 flex items-center justify-center gap-2">
                      Passer commande
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>

                  {/* Garanties */}
                  <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <Shield className="h-4 w-4 text-[#C5A059]" />
                      <span>Paiement 100% sécurisé</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <Package className="h-4 w-4 text-[#C5A059]" />
                      <span>Livraison soignée sous 5-7 jours</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <Truck className="h-4 w-4 text-[#C5A059]" />
                      <span>Gratuite dès 500€ d&apos;achat</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <LuxeFooterDark />
    </>
  );
}
