'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Eye } from 'lucide-react';

interface ProductCardProps {
  product: {
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
    is_on_sale?: boolean;
    discount_percentage?: number;
    created_at?: string;
    rite_ids?: Array<{ name: string; code: string }>;
    category_ids?: Array<{ name: string; slug: string }>;
  };
  showQuickView?: boolean;
  showWishlist?: boolean;
  onAddToCart?: (productId: string) => void;
  onQuickView?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
}

export function ProductCard({
  product,
  showQuickView = true,
  showWishlist = true,
  onAddToCart,
  onQuickView,
  onAddToWishlist,
}: ProductCardProps) {
  const isOutOfStock = product.stock_quantity <= 0 && !product.allow_backorders;
  const isOnSale = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercentage = isOnSale
    ? Math.round((1 - product.price / product.compare_at_price!) * 100)
    : 0;
  
  // Vérifier si c'est une nouveauté (30 derniers jours)
  const isNew = product.created_at 
    ? new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    : false;

  const productUrl = `/product/${product.slug || product._id}`;

  return (
    <article className="group bg-white/[0.03] border border-white/10 rounded-lg overflow-hidden hover:border-[#C5A059]/50 hover:shadow-[0_0_30px_rgba(197,160,89,0.1)] transition-all duration-300 relative">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {isOnSale && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPercentage}%
          </span>
        )}
        {isNew && !isOnSale && (
          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
            Nouveau
          </span>
        )}
        {product.featured && (
          <span className="bg-[#C5A059] text-white text-xs font-bold px-2 py-1 rounded">
            ⭐ Vedette
          </span>
        )}
      </div>

      {/* Actions rapides */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {showWishlist && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToWishlist?.(product._id);
            }}
            className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full shadow-md flex items-center justify-center hover:bg-[#C5A059]/20 hover:border-[#C5A059]/50 transition-colors"
            title="Ajouter aux favoris"
          >
            <Heart className="h-4 w-4 text-white/80 hover:text-red-400" />
          </button>
        )}
        {showQuickView && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onQuickView?.(product._id);
            }}
            className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full shadow-md flex items-center justify-center hover:bg-[#C5A059]/20 hover:border-[#C5A059]/50 transition-colors"
            title="Aperçu rapide"
          >
            <Eye className="h-4 w-4 text-white/80" />
          </button>
        )}
      </div>

      {/* Image */}
      <Link href={productUrl} className="block aspect-square overflow-hidden bg-white/5 relative">
        {product.images?.[0] ? (
          <>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Seconde image au hover si disponible */}
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
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
            <span className="text-6xl">🎭</span>
          </div>
        )}
        
        {/* Overlay rupture de stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded border border-white/20">
              Rupture de stock
            </span>
          </div>
        )}
      </Link>

      {/* Contenu */}
      <div className="p-4">
        {/* Catégories/Rites */}
        {product.rite_ids && product.rite_ids.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.rite_ids.slice(0, 2).map((rite, i) => (
              <span key={i} className="text-xs text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/20 px-2 py-0.5 rounded">
                {rite.code || rite.name}
              </span>
            ))}
          </div>
        )}

        {/* Nom */}
        <Link href={productUrl}>
          <h3 className="font-medium text-white mb-2 line-clamp-2 group-hover:text-[#C5A059] transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Description courte */}
        {product.short_description && (
          <p className="text-sm text-white/50 mb-3 line-clamp-2">
            {product.short_description}
          </p>
        )}

        {/* Prix */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span className={`text-lg font-bold ${isOnSale ? 'text-red-400' : 'text-[#C5A059]'}`}>
              {product.price.toFixed(2)} €
            </span>
            {isOnSale && product.compare_at_price && (
              <span className="text-sm text-white/40 line-through">
                {product.compare_at_price.toFixed(2)} €
              </span>
            )}
          </div>
        </div>

        {/* Bouton ajouter au panier */}
        {!isOutOfStock && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.(product._id);
            }}
            className="w-full bg-[#C5A059] hover:bg-[#b39142] text-white text-sm font-medium py-2.5 px-4 rounded transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Ajouter au panier
          </button>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
