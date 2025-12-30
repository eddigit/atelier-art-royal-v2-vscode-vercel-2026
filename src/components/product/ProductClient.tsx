'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Check, Truck, Shield, Phone, Plus, Minus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        <div className="aspect-square rounded-lg overflow-hidden bg-white shadow-sm">
          {product.images?.[selectedImageIndex] ? (
            <Image
              src={product.images[selectedImageIndex]}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-full object-contain"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-8xl">🎭</span>
            </div>
          )}
        </div>

        {product.images && product.images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                  idx === selectedImageIndex
                    ? 'border-[#C9A227] ring-2 ring-[#C9A227]/30'
                    : 'border-transparent hover:border-[#C9A227]/50'
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} - Image ${idx + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div>
        <div className="flex flex-wrap gap-2 mb-4">
          {product.category_ids?.map((cat) => (
            <Link
              key={cat._id}
              href={`/catalog?category=${cat.slug}`}
              className="text-xs px-2 py-1 bg-[#C9A227]/10 text-[#C9A227] rounded-full hover:bg-[#C9A227]/20"
            >
              {cat.name}
            </Link>
          ))}
          {discount > 0 && (
            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        <h1 className="font-display text-3xl font-bold mb-4">{product.name}</h1>

        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-3xl font-bold text-[#C9A227]">
            {product.price?.toFixed(2)} €
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-xl text-gray-400 line-through">
              {product.compare_at_price?.toFixed(2)} €
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-6">
          {isInStock ? (
            <>
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-green-600 font-medium">
                {product.stock_quantity > 0
                  ? `En stock (${product.stock_quantity} disponibles)`
                  : 'Disponible sur commande'}
              </span>
            </>
          ) : (
            <span className="text-red-600 font-medium">Rupture de stock</span>
          )}
        </div>

        {product.sku && (
          <p className="text-sm text-gray-500 mb-6">
            Référence: <span className="font-mono">{product.sku}</span>
          </p>
        )}

        {product.rite_ids && product.rite_ids.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Rites compatibles</h3>
            <div className="flex flex-wrap gap-2">
              {product.rite_ids.map((rite) => (
                <Link
                  key={rite._id}
                  href={`/catalog?rite=${rite._id}`}
                  className="text-sm px-3 py-1 bg-[#1B3A5F]/10 text-[#1B3A5F] rounded-full hover:bg-[#1B3A5F]/20 transition-colors"
                >
                  {rite.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {product.obedience_ids && product.obedience_ids.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Obédiences</h3>
            <div className="flex flex-wrap gap-2">
              {product.obedience_ids.map((ob) => (
                <Link
                  key={ob._id}
                  href={`/catalog?obedience=${ob._id}`}
                  className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {ob.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {product.degree_order_ids && product.degree_order_ids.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Degrés</h3>
            <div className="flex flex-wrap gap-2">
              {product.degree_order_ids.map((deg) => (
                <Link
                  key={deg._id}
                  href={`/catalog?degree=${deg._id}`}
                  className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                >
                  {deg.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Diminuer la quantité"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center font-semibold">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= maxQuantity}
              className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Augmenter la quantité"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <Button
            size="lg"
            className="flex-1 bg-[#C9A227] hover:bg-[#b89223] text-white"
            disabled={!isInStock || isAddingToCart}
            onClick={addToCart}
          >
            {isAddingToCart ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Ajout...
              </span>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Ajouter au panier
              </>
            )}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={toggleWishlist}
            className={isWishlisted ? 'text-red-500 border-red-500 hover:bg-red-50' : ''}
            aria-label={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-[#C9A227]" />
            <div className="text-sm">
              <p className="font-medium">Livraison 5-7 jours</p>
              <p className="text-gray-500">Franco dès 500€</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-[#C9A227]" />
            <div className="text-sm">
              <p className="font-medium">Made in France</p>
              <p className="text-gray-500">Qualité artisanale</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-[#C9A227]" />
            <div className="text-sm">
              <p className="font-medium">Conseil expert</p>
              <p className="text-gray-500">06 46 68 36 10</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
