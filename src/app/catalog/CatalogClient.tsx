'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingCart, Grid3X3, List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CatalogFilters, type FilterOptions, type ActiveFilters } from '@/components/catalog/CatalogFilters';
import { ProductSort } from '@/components/catalog/ProductSort';
import { Pagination } from '@/components/catalog/Pagination';
import { useToast } from '@/hooks/use-toast';

interface Product {
  _id: string;
  name: string;
  slug?: string;
  price: number;
  compare_at_price?: number;
  images?: string[];
  short_description?: string;
  stock_quantity: number;
  allow_backorders?: boolean;
  featured?: boolean;
  created_at?: string;
  rite_ids?: Array<{ name: string; code: string }>;
  category_ids?: Array<{ name: string; slug: string }>;
  obedience_ids?: Array<{ name: string; code: string }>;
  degree_order_ids?: Array<{ name: string; level: number; loge_type: string }>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface CatalogClientProps {
  initialProducts: Product[];
  initialPagination: PaginationInfo;
  filterOptions: FilterOptions;
  initialFilters: ActiveFilters;
}

export function CatalogClient({
  initialProducts,
  initialPagination,
  filterOptions,
  initialFilters,
}: CatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [gridColumns, setGridColumns] = useState(3);
  
  // Récupérer les filtres actifs depuis l'URL
  const activeFilters: ActiveFilters = {
    category: searchParams.get('category') || undefined,
    rite: searchParams.get('rite') || undefined,
    obedience: searchParams.get('obedience') || undefined,
    degree: searchParams.get('degree') || searchParams.get('degreeOrder') || undefined,
    logeType: searchParams.get('logeType') || undefined,
    search: searchParams.get('search') || undefined,
    minPrice: searchParams.get('minPrice') || undefined,
    maxPrice: searchParams.get('maxPrice') || undefined,
    size: searchParams.get('size') || undefined,
    color: searchParams.get('color') || undefined,
    material: searchParams.get('material') || undefined,
    showPromotions: searchParams.get('showPromotions') || undefined,
    showNew: searchParams.get('showNew') || undefined,
    inStockOnly: searchParams.get('inStockOnly') || undefined,
    sortBy: searchParams.get('sortBy') || '-created_at',
  };

  const handleSortChange = useCallback((sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', sort);
    params.delete('page'); // Reset page on sort change
    router.push(`/catalog?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const handleAddToCart = useCallback(async (productId: string) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      
      if (res.ok) {
        toast({
          title: 'Produit ajouté',
          description: 'Le produit a été ajouté à votre panier.',
        });
      } else {
        throw new Error('Erreur lors de l\'ajout au panier');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le produit au panier.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Calculer si le produit est en promotion
  const isOnSale = (product: Product) => {
    return product.compare_at_price && product.compare_at_price > product.price;
  };

  const getDiscountPercentage = (product: Product) => {
    if (!isOnSale(product)) return 0;
    return Math.round((1 - product.price / product.compare_at_price!) * 100);
  };

  // Vérifier si c'est une nouveauté (30 derniers jours)
  const isNew = (product: Product) => {
    if (!product.created_at) return false;
    return new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  };

  const isOutOfStock = (product: Product) => {
    return product.stock_quantity <= 0 && !product.allow_backorders;
  };

  // Obtenir les paramètres URL actuels pour la pagination
  const getCurrentSearchParams = () => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== 'page') {
        params[key] = value;
      }
    });
    return params;
  };

  // Générer le titre de la page en fonction des filtres
  const getPageTitle = () => {
    const parts: string[] = [];
    
    if (activeFilters.search) {
      return `Résultats pour "${activeFilters.search}"`;
    }
    
    if (activeFilters.category) {
      const cat = filterOptions.categories.find(c => c._id === activeFilters.category || c.slug === activeFilters.category);
      if (cat) parts.push(cat.name);
    }
    
    if (activeFilters.rite) {
      const rite = filterOptions.rites.find(r => r._id === activeFilters.rite);
      if (rite) parts.push(rite.name);
    }
    
    if (activeFilters.obedience) {
      const ob = filterOptions.obediences.find(o => o._id === activeFilters.obedience);
      if (ob) parts.push(ob.name);
    }
    
    if (activeFilters.logeType) {
      parts.push(activeFilters.logeType);
    }
    
    if (parts.length > 0) {
      return parts.join(' - ');
    }
    
    return 'Catalogue';
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-gold-600">Accueil</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Catalogue</span>
        </nav>

        {/* Titre de la page */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          {getPageTitle()}
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filtres */}
          <CatalogFilters
            options={filterOptions}
            activeFilters={activeFilters}
            totalProducts={initialPagination.total}
            className="w-full lg:w-64 flex-shrink-0"
          />

          {/* Contenu principal */}
          <div className="flex-1">
            {/* Barre d'outils */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{initialPagination.total}</span> produit{initialPagination.total > 1 ? 's' : ''}
                </p>
                
                {/* Toggle vue grille/liste - Desktop */}
                <div className="hidden md:flex items-center gap-1 border-l pl-4">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-gold-600' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Vue grille"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100 text-gold-600' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Vue liste"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  
                  {viewMode === 'grid' && (
                    <div className="flex items-center gap-1 border-l pl-2 ml-2">
                      {[2, 3, 4].map(cols => (
                        <button
                          key={cols}
                          onClick={() => setGridColumns(cols)}
                          className={`p-1 rounded text-xs ${gridColumns === cols ? 'bg-gray-100 text-gold-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          {cols}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <ProductSort
                currentSort={activeFilters.sortBy || '-created_at'}
                onChange={handleSortChange}
              />
            </div>

            {/* Grille produits */}
            {initialProducts.length > 0 ? (
              <div className={
                viewMode === 'list' 
                  ? 'flex flex-col gap-4'
                  : `grid gap-6 ${
                      gridColumns === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                      gridColumns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    }`
              }>
                {initialProducts.map((product) => (
                  viewMode === 'list' ? (
                    // Vue Liste
                    <article 
                      key={product._id}
                      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all flex"
                    >
                      <Link 
                        href={`/product/${product.slug || product._id}`}
                        className="w-48 h-48 flex-shrink-0 overflow-hidden bg-gray-100 relative"
                      >
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="200px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl">🎭</span>
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {isOnSale(product) && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                              -{getDiscountPercentage(product)}%
                            </span>
                          )}
                          {isNew(product) && !isOnSale(product) && (
                            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                              Nouveau
                            </span>
                          )}
                        </div>
                      </Link>
                      
                      <div className="flex-1 p-4 flex flex-col">
                        <div className="flex-1">
                          {/* Rites */}
                          {product.rite_ids && product.rite_ids.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {product.rite_ids.slice(0, 3).map((rite, i) => (
                                <span key={i} className="text-xs text-gold-600 bg-gold-50 px-2 py-0.5 rounded">
                                  {rite.code || rite.name}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <Link href={`/product/${product.slug || product._id}`}>
                            <h3 className="font-medium text-lg mb-2 hover:text-gold-600 transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          
                          {product.short_description && (
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                              {product.short_description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-baseline gap-2">
                            <span className={`text-xl font-bold ${isOnSale(product) ? 'text-red-600' : 'text-gold-600'}`}>
                              {product.price.toFixed(2)} €
                            </span>
                            {isOnSale(product) && product.compare_at_price && (
                              <span className="text-sm text-gray-400 line-through">
                                {product.compare_at_price.toFixed(2)} €
                              </span>
                            )}
                          </div>
                          
                          {!isOutOfStock(product) ? (
                            <Button
                              onClick={() => handleAddToCart(product._id)}
                              className="bg-gray-900 hover:bg-gold-600"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Ajouter
                            </Button>
                          ) : (
                            <span className="text-sm text-red-500">Rupture de stock</span>
                          )}
                        </div>
                      </div>
                    </article>
                  ) : (
                    // Vue Grille
                    <article 
                      key={product._id}
                      className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 relative"
                    >
                      {/* Badges */}
                      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                        {isOnSale(product) && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            -{getDiscountPercentage(product)}%
                          </span>
                        )}
                        {isNew(product) && !isOnSale(product) && (
                          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                            Nouveau
                          </span>
                        )}
                        {product.featured && (
                          <span className="bg-gold-500 text-white text-xs font-bold px-2 py-1 rounded">
                            ⭐ Vedette
                          </span>
                        )}
                      </div>

                      {/* Image */}
                      <Link 
                        href={`/product/${product.slug || product._id}`} 
                        className="block aspect-square overflow-hidden bg-gray-100 relative"
                      >
                        {product.images?.[0] ? (
                          <>
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {product.images[1] && (
                              <Image
                                src={product.images[1]}
                                alt={`${product.name} - vue 2`}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0"
                              />
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <span className="text-6xl">🎭</span>
                          </div>
                        )}
                        
                        {/* Overlay rupture de stock */}
                        {isOutOfStock(product) && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-white text-gray-900 text-sm font-medium px-4 py-2 rounded">
                              Rupture de stock
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* Contenu */}
                      <div className="p-4">
                        {/* Rites */}
                        {product.rite_ids && product.rite_ids.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {product.rite_ids.slice(0, 2).map((rite, i) => (
                              <span key={i} className="text-xs text-gold-600 bg-gold-50 px-2 py-0.5 rounded">
                                {rite.code || rite.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Nom */}
                        <Link href={`/product/${product.slug || product._id}`}>
                          <h3 className="font-medium mb-2 line-clamp-2 group-hover:text-gold-600 transition-colors min-h-[2.5rem]">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Prix */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-baseline gap-2">
                            <span className={`text-lg font-bold ${isOnSale(product) ? 'text-red-600' : 'text-gold-600'}`}>
                              {product.price.toFixed(2)} €
                            </span>
                            {isOnSale(product) && product.compare_at_price && (
                              <span className="text-sm text-gray-400 line-through">
                                {product.compare_at_price.toFixed(2)} €
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bouton ajouter au panier */}
                        {!isOutOfStock(product) && (
                          <button
                            onClick={() => handleAddToCart(product._id)}
                            className="w-full bg-gray-900 hover:bg-gold-600 text-white text-sm font-medium py-2.5 px-4 rounded transition-colors flex items-center justify-center gap-2"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Ajouter au panier
                          </button>
                        )}
                      </div>
                    </article>
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-xl font-medium text-gray-900 mb-2">
                  Aucun produit trouvé
                </h2>
                <p className="text-gray-500 mb-6">
                  Essayez de modifier vos critères de recherche ou de supprimer certains filtres.
                </p>
                <Link href="/catalog">
                  <Button variant="outline">
                    Voir tous les produits
                  </Button>
                </Link>
              </div>
            )}

            {/* Pagination */}
            {initialPagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={initialPagination.page}
                  totalPages={initialPagination.totalPages}
                  baseUrl="/catalog"
                  searchParams={getCurrentSearchParams()}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default CatalogClient;
