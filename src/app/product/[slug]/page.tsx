import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Check, Truck, Shield, Phone } from 'lucide-react';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { Button } from '@/components/ui/button';
import LuxeHeader from '@/components/layout/LuxeHeader';
import LuxeFooter from '@/components/layout/LuxeFooter';

interface ProductPageProps {
  params: { slug: string };
}

async function getProduct(slug: string) {
  await dbConnect();

  const product = await Product.findOne({
    $or: [
      { slug },
      { _id: slug }
    ],
    is_active: true
  })
    .populate('category_ids', 'name slug')
    .populate('rite_ids', 'name code')
    .populate('obedience_ids', 'name code')
    .populate('degree_order_ids', 'name level loge_type')
    .lean();

  if (!product) return null;
  return JSON.parse(JSON.stringify(product));
}

async function getRelatedProducts(productId: string, categoryIds: string[]) {
  await dbConnect();

  const related = await Product.find({
    _id: { $ne: productId },
    category_ids: { $in: categoryIds },
    is_active: true
  })
    .limit(4)
    .lean();

  return JSON.parse(JSON.stringify(related));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  const categoryIds = product.category_ids?.map((c: any) => c._id) || [];
  const relatedProducts = categoryIds.length > 0
    ? await getRelatedProducts(product._id, categoryIds)
    : [];

  const isInStock = product.stock_quantity > 0 || product.allow_backorders;
  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  return (
    <>
      <LuxeHeader />
      <main className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-gold-600">Accueil</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/catalog" className="hover:text-gold-600">Catalogue</Link>
            </li>
            {product.category_ids?.[0] && (
              <>
                <li>/</li>
                <li>
                  <Link
                    href={`/catalog?category=${product.category_ids[0].slug}`}
                    className="hover:text-gold-600"
                  >
                    {product.category_ids[0].name}
                  </Link>
                </li>
              </>
            )}
            <li>/</li>
            <li className="text-gray-900 font-medium truncate max-w-[200px]">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-white shadow-sm">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
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

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    className="w-20 h-20 rounded-lg overflow-hidden border-2 border-transparent hover:border-gold-500 flex-shrink-0"
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
            {/* Categories & Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.category_ids?.map((cat: any) => (
                <Link
                  key={cat._id}
                  href={`/catalog?category=${cat.slug}`}
                  className="text-xs px-2 py-1 bg-gold-100 text-gold-700 rounded-full hover:bg-gold-200"
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

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-gold-600">
                {product.price?.toFixed(2)} €
              </span>
              {product.compare_at_price > product.price && (
                <span className="text-xl text-gray-400 line-through">
                  {product.compare_at_price?.toFixed(2)} €
                </span>
              )}
            </div>

            {/* Stock Status */}
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

            {/* SKU */}
            {product.sku && (
              <p className="text-sm text-gray-500 mb-6">
                Référence: <span className="font-mono">{product.sku}</span>
              </p>
            )}

            {/* Rites */}
            {product.rite_ids?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Rites compatibles</h3>
                <div className="flex flex-wrap gap-2">
                  {product.rite_ids.map((rite: any) => (
                    <span
                      key={rite._id}
                      className="text-sm px-3 py-1 bg-navy-100 text-navy-700 rounded-full"
                    >
                      {rite.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Obediences */}
            {product.obedience_ids?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Obédiences</h3>
                <div className="flex flex-wrap gap-2">
                  {product.obedience_ids.map((ob: any) => (
                    <span
                      key={ob._id}
                      className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
                    >
                      {ob.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Degrees */}
            {product.degree_order_ids?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Degrés</h3>
                <div className="flex flex-wrap gap-2">
                  {product.degree_order_ids.map((deg: any) => (
                    <span
                      key={deg._id}
                      className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full"
                    >
                      {deg.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="flex gap-4 mb-8">
              <Button
                size="lg"
                className="flex-1 bg-gold-600 hover:bg-gold-700"
                disabled={!isInStock}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Ajouter au panier
              </Button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-gold-600" />
                <div className="text-sm">
                  <p className="font-medium">Livraison 5-7 jours</p>
                  <p className="text-gray-500">Franco dès 500€</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gold-600" />
                <div className="text-sm">
                  <p className="font-medium">Made in France</p>
                  <p className="text-gray-500">Qualité artisanale</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gold-600" />
                <div className="text-sm">
                  <p className="font-medium">Conseil expert</p>
                  <p className="text-gray-500">06 46 68 36 10</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <section className="mt-12 bg-white rounded-lg p-8 shadow-sm">
            <h2 className="font-display text-2xl font-bold mb-4">Description</h2>
            <div className="prose max-w-none text-gray-600">
              {product.description.split('\n').map((paragraph: string, idx: number) => (
                <p key={idx} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold mb-6">Produits similaires</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((related: any) => (
                <Link
                  key={related._id}
                  href={`/product/${related.slug || related._id}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square overflow-hidden">
                    {related.images?.[0] ? (
                      <Image
                        src={related.images[0]}
                        alt={related.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-4xl">🎭</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-gold-600">
                      {related.name}
                    </h3>
                    <p className="text-gold-600 font-bold mt-2">
                      {related.price?.toFixed(2)} €
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back Link */}
        <div className="mt-12">
          <Link href="/catalog" className="inline-flex items-center text-gold-600 hover:text-gold-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au catalogue
          </Link>
        </div>
      </div>

      </main>
      <LuxeFooter />
    </>
  );
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    return { title: 'Produit non trouvé' };
  }

  return {
    title: `${product.name} | Atelier Art Royal`,
    description: product.description?.substring(0, 160) || `Découvrez ${product.name} - Haute couture maçonnique française`,
  };
}
