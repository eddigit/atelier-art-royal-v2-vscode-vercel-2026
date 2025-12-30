'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Users, Package, ShoppingBag, Send, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LuxeHeader from '@/components/layout/LuxeHeader';
import LuxeFooter from '@/components/layout/LuxeFooter';
import { toast } from '@/hooks/use-toast';

interface Obedience {
  _id: string;
  name: string;
  code: string;
  image_url?: string;
}

interface Rite {
  _id: string;
  name: string;
  code: string;
}

interface Degree {
  _id: string;
  name: string;
  level: number;
  loge_type: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images?: string[];
  category_slugs?: string[];
}

interface LodgeConfig {
  obedience: string;
  rite: string;
  apprentices: number;
  compagnons: number;
  maitres: number;
  officers: number;
}

export default function EquiperMaLogePage() {
  const [step, setStep] = useState(1);
  const [obediences, setObediences] = useState<Obedience[]>([]);
  const [rites, setRites] = useState<Rite[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const [config, setConfig] = useState<LodgeConfig>({
    obedience: '',
    rite: '',
    apprentices: 0,
    compagnons: 0,
    maitres: 15,
    officers: 7,
  });

  const [selectedProducts, setSelectedProducts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    Promise.all([
      fetch('/api/obediences?activeOnly=true').then(r => r.json()),
      fetch('/api/rites?activeOnly=true').then(r => r.json()),
    ]).then(([obData, riteData]) => {
      setObediences(obData.obediences || []);
      setRites(riteData.rites || []);
      setIsLoading(false);
    }).catch(console.error);
  }, []);

  const loadProducts = async () => {
    if (!config.obedience || !config.rite) return;

    setIsLoadingProducts(true);
    try {
      const params = new URLSearchParams({
        obedience: config.obedience,
        rite: config.rite,
        limit: '50',
      });

      const response = await fetch(`/api/products-v2?${params}`);
      const data = await response.json();
      setProducts(data.products || []);

      // Pré-sélectionner des quantités suggérées
      const suggestions = new Map<string, number>();
      (data.products || []).forEach((product: Product) => {
        const category = product.category_slugs?.[0] || '';
        let qty = 0;

        if (category.includes('tablier')) {
          qty = config.maitres + config.compagnons + config.apprentices;
        } else if (category.includes('sautoir') || category.includes('cordon')) {
          qty = config.officers;
        } else if (category.includes('gant')) {
          qty = (config.maitres + config.compagnons + config.apprentices) * 2;
        } else {
          qty = 1;
        }

        if (qty > 0) {
          suggestions.set(product._id, qty);
        }
      });

      setSelectedProducts(suggestions);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setSelectedProducts(prev => {
      const updated = new Map(prev);
      const current = updated.get(productId) || 0;
      const newQty = Math.max(0, current + delta);

      if (newQty === 0) {
        updated.delete(productId);
      } else {
        updated.set(productId, newQty);
      }

      return updated;
    });
  };

  const setQuantity = (productId: string, qty: number) => {
    setSelectedProducts(prev => {
      const updated = new Map(prev);
      if (qty <= 0) {
        updated.delete(productId);
      } else {
        updated.set(productId, qty);
      }
      return updated;
    });
  };

  const calculateTotal = () => {
    let total = 0;
    selectedProducts.forEach((qty, productId) => {
      const product = products.find(p => p._id === productId);
      if (product) {
        total += product.price * qty;
      }
    });
    return total;
  };

  const addAllToCart = () => {
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');

    selectedProducts.forEach((qty, productId) => {
      const product = products.find(p => p._id === productId);
      if (product && qty > 0) {
        const existingIndex = existingCart.findIndex((item: any) => item.productId === productId);

        if (existingIndex >= 0) {
          existingCart[existingIndex].quantity += qty;
        } else {
          existingCart.push({
            id: `${productId}-${Date.now()}`,
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: qty,
            image: product.images?.[0] || null,
          });
        }
      }
    });

    localStorage.setItem('cart', JSON.stringify(existingCart));

    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: { itemCount: existingCart.reduce((sum: number, item: any) => sum + item.quantity, 0) }
    }));

    toast({
      title: 'Produits ajoutés au panier',
      description: `${selectedProducts.size} articles ajoutés pour votre loge`,
    });
  };

  const requestQuote = () => {
    const selectedItems = Array.from(selectedProducts.entries()).map(([productId, qty]) => {
      const product = products.find(p => p._id === productId);
      return {
        name: product?.name || 'Produit inconnu',
        quantity: qty,
        unitPrice: product?.price || 0,
        total: (product?.price || 0) * qty,
      };
    });

    const obedienceName = obediences.find(o => o._id === config.obedience)?.name || '';
    const riteName = rites.find(r => r._id === config.rite)?.name || '';

    const quoteData = {
      config: {
        ...config,
        obedienceName,
        riteName,
      },
      items: selectedItems,
      total: calculateTotal(),
    };

    // Pour l'instant, stocker et rediriger vers contact
    localStorage.setItem('quoteRequest', JSON.stringify(quoteData));

    toast({
      title: 'Demande de devis préparée',
      description: 'Vous allez être redirigé vers le formulaire de contact',
    });

    setTimeout(() => {
      window.location.href = '/contact?type=devis-loge';
    }, 1500);
  };

  const totalMembers = config.apprentices + config.compagnons + config.maitres;
  const selectedCount = Array.from(selectedProducts.values()).reduce((sum, qty) => sum + qty, 0);

  if (isLoading) {
    return (
      <>
        <LuxeHeader />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C9A227] mx-auto mb-4" />
            <p className="text-gray-500">Chargement...</p>
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
        {/* Hero */}
        <section className="bg-[#1B3A5F] text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-[#C9A227] text-sm font-semibold tracking-widest uppercase mb-4">
              Service exclusif
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Équiper ma Loge
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Configurez l'équipement complet de votre loge en quelques clics.
              Nous vous proposons une sélection adaptée à votre obédience et votre rite.
            </p>
          </div>
        </section>

        {/* Progress Steps */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-4 md:gap-8">
              {[
                { num: 1, label: 'Configuration' },
                { num: 2, label: 'Effectifs' },
                { num: 3, label: 'Sélection' },
                { num: 4, label: 'Récapitulatif' },
              ].map((s, idx) => (
                <div key={s.num} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step >= s.num ? 'bg-[#C9A227] text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`ml-2 text-sm hidden md:inline ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                  {idx < 3 && <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Step 1: Configuration */}
          {step === 1 && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Configuration de votre Loge</h2>

              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="font-semibold mb-4">Votre Obédience</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {obediences.map((ob) => (
                    <button
                      key={ob._id}
                      onClick={() => setConfig(prev => ({ ...prev, obedience: ob._id }))}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        config.obedience === ob._id
                          ? 'border-[#C9A227] bg-[#C9A227]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {ob.image_url && (
                        <Image
                          src={ob.image_url}
                          alt={ob.name}
                          width={48}
                          height={48}
                          className="mx-auto mb-2 rounded-full"
                        />
                      )}
                      <p className="font-semibold text-sm">{ob.code}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ob.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="font-semibold mb-4">Votre Rite</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {rites.map((rite) => (
                    <button
                      key={rite._id}
                      onClick={() => setConfig(prev => ({ ...prev, rite: rite._id }))}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        config.rite === rite._id
                          ? 'border-[#C9A227] bg-[#C9A227]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold">{rite.code}</p>
                      <p className="text-xs text-gray-500 mt-1">{rite.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!config.obedience || !config.rite}
                  className="bg-[#C9A227] hover:bg-[#b89223]"
                >
                  Continuer
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Effectifs */}
          {step === 2 && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Effectifs de votre Loge</h2>

              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="h-6 w-6 text-[#C9A227]" />
                  <div>
                    <h3 className="font-semibold">Nombre de Frères par degré</h3>
                    <p className="text-sm text-gray-500">Indiquez les effectifs pour calculer les quantités</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { key: 'apprentices', label: 'Apprentis (1°)', desc: 'Frères au premier degré' },
                    { key: 'compagnons', label: 'Compagnons (2°)', desc: 'Frères au deuxième degré' },
                    { key: 'maitres', label: 'Maîtres (3°)', desc: 'Frères au troisième degré' },
                    { key: 'officers', label: 'Officiers', desc: 'Membres du collège d\'officiers' },
                  ].map((field) => (
                    <div key={field.key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{field.label}</p>
                        <p className="text-sm text-gray-500">{field.desc}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setConfig(prev => ({
                            ...prev,
                            [field.key]: Math.max(0, (prev as any)[field.key] - 1)
                          }))}
                          className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={(config as any)[field.key]}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            [field.key]: Math.max(0, parseInt(e.target.value) || 0)
                          }))}
                          className="w-16 text-center border rounded-lg py-2"
                        />
                        <button
                          onClick={() => setConfig(prev => ({
                            ...prev,
                            [field.key]: (prev as any)[field.key] + 1
                          }))}
                          className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Effectif total de la Loge</span>
                    <span className="text-2xl font-bold text-[#C9A227]">{totalMembers} Frères</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Retour
                </Button>
                <Button
                  onClick={() => {
                    setStep(3);
                    loadProducts();
                  }}
                  disabled={totalMembers === 0}
                  className="bg-[#C9A227] hover:bg-[#b89223]"
                >
                  Voir les produits recommandés
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Sélection produits */}
          {step === 3 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Sélection des produits</h2>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{selectedCount} articles sélectionnés</p>
                  <p className="text-xl font-bold text-[#C9A227]">{calculateTotal().toFixed(2)} €</p>
                </div>
              </div>

              {isLoadingProducts ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C9A227] mx-auto mb-4" />
                  <p className="text-gray-500">Chargement des produits recommandés...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun produit trouvé pour cette configuration</p>
                  <Button variant="outline" onClick={() => setStep(1)} className="mt-4">
                    Modifier la configuration
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {products.map((product) => {
                      const qty = selectedProducts.get(product._id) || 0;
                      return (
                        <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                          <Link href={`/product/${product.slug || product._id}`}>
                            <div className="aspect-square bg-gray-100">
                              {product.images?.[0] ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  width={300}
                                  height={300}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl">🎭</div>
                              )}
                            </div>
                          </Link>
                          <div className="p-4">
                            <Link href={`/product/${product.slug || product._id}`}>
                              <h3 className="font-medium line-clamp-2 hover:text-[#C9A227]">{product.name}</h3>
                            </Link>
                            <p className="text-[#C9A227] font-bold mt-2">{product.price.toFixed(2)} €</p>

                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(product._id, -1)}
                                  className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={qty}
                                  onChange={(e) => setQuantity(product._id, parseInt(e.target.value) || 0)}
                                  className="w-14 text-center border rounded py-1"
                                />
                                <button
                                  onClick={() => updateQuantity(product._id, 1)}
                                  className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                >
                                  +
                                </button>
                              </div>
                              {qty > 0 && (
                                <span className="text-sm font-semibold text-[#C9A227]">
                                  {(product.price * qty).toFixed(2)} €
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      Retour
                    </Button>
                    <Button
                      onClick={() => setStep(4)}
                      disabled={selectedCount === 0}
                      className="bg-[#C9A227] hover:bg-[#b89223]"
                    >
                      Voir le récapitulatif
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Récapitulatif */}
          {step === 4 && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Récapitulatif de votre commande</h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="font-semibold mb-4">Articles sélectionnés</h3>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {Array.from(selectedProducts.entries()).map(([productId, qty]) => {
                        const product = products.find(p => p._id === productId);
                        if (!product || qty === 0) return null;

                        return (
                          <div key={productId} className="flex items-center gap-4 border-b pb-4">
                            <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                              {product.images?.[0] ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">🎭</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium line-clamp-1">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.price.toFixed(2)} € x {qty}</p>
                            </div>
                            <p className="font-semibold text-[#C9A227]">
                              {(product.price * qty).toFixed(2)} €
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                    <h3 className="font-semibold mb-4">Votre Loge</h3>

                    <div className="space-y-2 text-sm mb-6">
                      <p>
                        <span className="text-gray-500">Obédience:</span>{' '}
                        <strong>{obediences.find(o => o._id === config.obedience)?.code}</strong>
                      </p>
                      <p>
                        <span className="text-gray-500">Rite:</span>{' '}
                        <strong>{rites.find(r => r._id === config.rite)?.code}</strong>
                      </p>
                      <p>
                        <span className="text-gray-500">Effectif:</span>{' '}
                        <strong>{totalMembers} Frères</strong>
                      </p>
                    </div>

                    <div className="border-t pt-4 mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-500">Sous-total</span>
                        <span>{calculateTotal().toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-500">Livraison</span>
                        <span className="text-green-600">Franco</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total</span>
                        <span className="text-[#C9A227]">{calculateTotal().toFixed(2)} €</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={addAllToCart}
                        className="w-full bg-[#C9A227] hover:bg-[#b89223]"
                      >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Ajouter au panier
                      </Button>
                      <Button
                        onClick={requestQuote}
                        variant="outline"
                        className="w-full"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Demander un devis
                      </Button>
                    </div>

                    <p className="text-xs text-gray-500 mt-4 text-center">
                      Livraison gratuite pour les commandes de loge
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-start mt-8">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Modifier la sélection
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <LuxeFooter />
    </>
  );
}
