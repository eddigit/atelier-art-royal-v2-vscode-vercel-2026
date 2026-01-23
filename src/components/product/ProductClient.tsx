'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Check, Truck, Shield, Phone, Plus, Minus, Heart, ImageOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProductClientProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    compare_at_price?: number;
    stock_quantity: number;
    allow_backorders: boolean;
    sku?: string;
    images?: string[];
    description?: string;
    category_ids?: Array<{ _id: string; name: string; slug: string }>;
    rite_ids?: Array<{ _id: string; name: string; code: string }>;
    obedience_ids?: Array<{ _id: string; name: string; code: string }>;
    degree_order_ids?: Array<{ _id: string; name: string; level: number; loge_type: string }>;
  };
}

export default function ProductClient({ product }: ProductClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const isInStock = product.stock_quantity > 0 || product.allow_backorders;
  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  const maxQuantity = product.stock_quantity > 0 ? Math.min(product.stock_quantity, 99) : 99;

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsWishlisted(wishlist.includes(product._id));
  }, [product._id]);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => {
      const newQty = prev + delta;
      if (newQty < 1) return 1;
      if (newQty > maxQuantity) return maxQuantity;
      return newQty;
    });
  };

  const addToCart = async () => {
    setIsAddingToCart(true);

    try {
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItemIndex = existingCart.findIndex(
        (item: any) => item.productId === product._id
      );

      if (existingItemIndex >= 0) {
        existingCart[existingItemIndex].quantity += quantity;
      } else {
        existingCart.push({
          id: `${product._id}-${Date.now()}`,
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          image: product.images?.[0] || null,
          sku: product.sku,
        });
      }

      localStorage.setItem('cart', JSON.stringify(existingCart));

      window.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { itemCount: existingCart.reduce((sum: number, item: any) => sum + item.quantity, 0) }
      }));

      toast({
        title: 'Ajouté au panier',
        description: `${quantity}x ${product.name}`,
      });

      setQuantity(1);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter au panier',
        variant: 'destructive',
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

    if (isWishlisted) {
      const newWishlist = wishlist.filter((id: string) => id !== product._id);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      setIsWishlisted(false);
      toast({ title: 'Retiré des favoris' });
    } else {
      wishlist.push(product._id);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      setIsWishlisted(true);
      toast({ title: 'Ajouté aux favoris' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Images */}
      <div className="space-y-4">
        <div className="aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative">
          {product.images?.[selectedImageIndex] ? (
            <Image
              src={product.images[selectedImageIndex]}
              alt={product.name}
              fill
              className="object-contain"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
              <ImageOff className="w-20 h-20 text-white/20 stroke-[1.5]" />
            </div>
          )}
          
          {/* Badge promo */}
          {discount > 0 && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-lg">
              -{discount}%
            </div>
          )}
        </div>

        {product.images && product.images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all relative ${
                  idx === selectedImageIndex
                    ? 'border-[#C5A059] ring-2 ring-[#C5A059]/30'
                    : 'border-white/10 hover:border-[#C5A059]/50'
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} - Image ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div>
        {/* Categories & Badge */}
        <div className="flex flex-wrap gap-2 mb-4">
          {product.category_ids?.map((cat) => (
            <Link
              key={cat._id}
              href={`/catalog?category=${cat.slug}`}
              className="text-xs px-3 py-1.5 bg-[#C5A059]/10 text-[#C5A059] rounded-full hover:bg-[#C5A059]/20 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Nom */}
        <h1 className="text-3xl md:text-4xl font-extralight text-white tracking-tight mb-6">{product.name}</h1>

        {/* Prix */}
        <div className="flex items-baseline gap-4 mb-6">
          <span className="text-4xl font-bold text-[#C5A059]">
            {product.price?.toFixed(2)} €
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-xl text-white/40 line-through">
              {product.compare_at_price?.toFixed(2)} €
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="flex items-center gap-2 mb-6">
          {isInStock ? (
            <>
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-400" />
              </div>
              <span className="text-green-400 font-medium">
                {product.stock_quantity > 0
                  ? `En stock (${product.stock_quantity} disponibles)`
                  : 'Disponible sur commande'}
              </span>
            </>
          ) : (
            <span className="text-red-400 font-medium">Rupture de stock</span>
          )}
        </div>

        {/* Référence */}
        {product.sku && (
          <p className="text-sm text-white/40 mb-6">
            Référence: <span className="font-mono text-white/60">{product.sku}</span>
          </p>
        )}

        {/* Rites */}
        {product.rite_ids && product.rite_ids.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-white/60 mb-2">Rites compatibles</h3>
            <div className="flex flex-wrap gap-2">
              {product.rite_ids.map((rite) => (
                <Link
                  key={rite._id}
                  href={`/catalog?rite=${rite._id}`}
                  className="text-sm px-3 py-1.5 bg-white/5 border border-white/10 text-white/80 rounded-lg hover:border-[#C5A059]/50 hover:text-[#C5A059] transition-all"
                >
                  {rite.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Obédiences */}
        {product.obedience_ids && product.obedience_ids.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-white/60 mb-2">Obédiences</h3>
            <div className="flex flex-wrap gap-2">
              {product.obedience_ids.map((ob) => (
                <Link
                  key={ob._id}
                  href={`/catalog?obedience=${ob._id}`}
                  className="text-sm px-3 py-1.5 bg-white/5 border border-white/10 text-white/80 rounded-lg hover:border-[#C5A059]/50 hover:text-[#C5A059] transition-all"
                >
                  {ob.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Degrés */}
        {product.degree_order_ids && product.degree_order_ids.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-white/60 mb-2">Degrés</h3>
            <div className="flex flex-wrap gap-2">
              {product.degree_order_ids.map((deg) => (
                <Link
                  key={deg._id}
                  href={`/catalog?degree=${deg._id}`}
                  className="text-sm px-3 py-1.5 bg-white/5 border border-white/10 text-white/80 rounded-lg hover:border-[#C5A059]/50 hover:text-[#C5A059] transition-all"
                >
                  {deg.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Quantité */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="p-3 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white/60 hover:text-white rounded-l-lg"
              aria-label="Diminuer la quantité"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center font-semibold text-white">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= maxQuantity}
              className="p-3 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white/60 hover:text-white rounded-r-lg"
              aria-label="Augmenter la quantité"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Bouton ajouter au panier */}
          <button
            className="flex-1 py-4 px-6 bg-[#C5A059] text-black font-bold tracking-widest uppercase text-sm rounded-lg hover:bg-[#D4B44A] transition-all shadow-lg shadow-[#C5A059]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={!isInStock || isAddingToCart}
            onClick={addToCart}
          >
            {isAddingToCart ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                Ajout...
              </span>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5" />
                Ajouter au panier
              </>
            )}
          </button>

          {/* Favoris */}
          <button
            onClick={toggleWishlist}
            className={`p-4 rounded-lg border transition-all ${
              isWishlisted 
                ? 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20' 
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/30'
            }`}
            aria-label={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Garanties */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-white/10">
          <div className="flex items-center gap-3 bg-white/[0.02] p-4 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[#C5A059]/10 flex items-center justify-center">
              <Truck className="h-5 w-5 text-[#C5A059]" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-white">Livraison 5-7 jours</p>
              <p className="text-white/50">Franco dès 500€</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/[0.02] p-4 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[#C5A059]/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-[#C5A059]" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-white">Made in France</p>
              <p className="text-white/50">Qualité artisanale</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/[0.02] p-4 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[#C5A059]/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-[#C5A059]" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-white">Conseil expert</p>
              <p className="text-white/50">06 46 68 36 10</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
