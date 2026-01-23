import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ImageOff } from 'lucide-react';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import LuxeHeaderDark from '@/components/layout/LuxeHeaderDark';
import LuxeFooterDark from '@/components/layout/LuxeFooterDark';
import ProductClient from '@/components/product/ProductClient';
import ProductReviews from '@/components/product/ProductReviews';

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

async function getRelatedProducts(
  productId: string,
  categoryIds: string[],
  riteIds: string[] = [],
  degreeIds: string[] = []
) {
  await dbConnect();

  // Priorité 1: Même rite ET même degré
  let related = await Product.find({
    _id: { $ne: productId },
    is_active: true,
    $and: [
      { rite_ids: { $in: riteIds.length > 0 ? riteIds : ['none'] } },
      { degree_order_ids: { $in: degreeIds.length > 0 ? degreeIds : ['none'] } }
    ]
  }).limit(4).lean();

  // Si pas assez, Priorité 2: Même rite OU même degré
  if (related.length < 4) {
    const existingIds = related.map(p => p._id.toString());
    const moreRelated = await Product.find({
      _id: { $ne: productId, $nin: existingIds },
      is_active: true,
      $or: [
        { rite_ids: { $in: riteIds.length > 0 ? riteIds : ['none'] } },
        { degree_order_ids: { $in: degreeIds.length > 0 ? degreeIds : ['none'] } }
      ]
    }).limit(4 - related.length).lean();
    related = [...related, ...moreRelated];
  }

  // Si toujours pas assez, Priorité 3: Même catégorie
  if (related.length < 4 && categoryIds.length > 0) {
    const existingIds = related.map(p => p._id.toString());
    const categoryRelated = await Product.find({
      _id: { $ne: productId, $nin: existingIds },
      category_ids: { $in: categoryIds },
      is_active: true
    }).limit(4 - related.length).lean();
    related = [...related, ...categoryRelated];
  }

  return JSON.parse(JSON.stringify(related));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  const categoryIds = product.category_ids?.map((c: any) => c._id) || [];
  const riteIds = product.rite_ids?.map((r: any) => r._id) || [];
  const degreeIds = product.degree_order_ids?.map((d: any) => d._id) || [];

  const relatedProducts = await getRelatedProducts(product._id, categoryIds, riteIds, degreeIds);

  return (
    <>
      <LuxeHeaderDark />
      <main className="min-h-screen bg-[#0a0a0c]">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-white/50">
              <li>
                <Link href="/" className="hover:text-[#C5A059] transition-colors">Accueil</Link>
              </li>
              <li className="text-white/30">/</li>
              <li>
                <Link href="/catalog" className="hover:text-[#C5A059] transition-colors">Catalogue</Link>
              </li>
              {product.category_ids?.[0] && (
                <>
                  <li className="text-white/30">/</li>
                  <li>
                    <Link
                      href={`/catalog?category=${product.category_ids[0].slug}`}
                      className="hover:text-[#C5A059] transition-colors"
                    >
                      {product.category_ids[0].name}
                    </Link>
                  </li>
                </>
              )}
              <li className="text-white/30">/</li>
              <li className="text-white font-medium truncate max-w-[200px]">
                {product.name}
              </li>
            </ol>
          </nav>

          {/* Product Client Component (interactive) */}
          <ProductClient product={product} />

          {/* Description */}
          {product.description && (
            <section className="mt-16 bg-white/[0.03] border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-light text-white mb-6 pb-4 border-b border-white/10">Description</h2>
              <div className="prose prose-invert max-w-none text-white/70">
                {product.description.split('\n').map((paragraph: string, idx: number) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <ProductReviews productId={product._id} />

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-light text-white mb-8">Produits similaires</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((related: any) => (
                  <Link
                    key={related._id}
                    href={`/product/${related.slug || related._id}`}
                    className="group bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden hover:border-[#C5A059]/50 transition-all duration-300"
                  >
                    <div className="aspect-square overflow-hidden bg-white/5 relative">
                      {related.images?.[0] ? (
                        <Image
                          src={related.images[0]}
                          alt={related.name}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
                          <ImageOff className="w-10 h-10 text-white/20 stroke-[1.5]" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-sm text-white line-clamp-2 group-hover:text-[#C5A059] transition-colors min-h-[2.5rem]">
                        {related.name}
                      </h3>
                      <p className="text-[#C5A059] font-bold mt-2">
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
            <Link href="/catalog" className="inline-flex items-center text-white/60 hover:text-[#C5A059] transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au catalogue
            </Link>
          </div>
        </div>
      </main>
      <LuxeFooterDark />
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
