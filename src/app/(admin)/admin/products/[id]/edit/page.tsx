import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

async function getProduct(id: string) {
  await dbConnect();
  
  const product = await Product.findById(id)
    .populate('rite_ids', 'name code')
    .populate('obedience_ids', 'name code')
    .populate('degree_order_ids', 'name level loge_type')
    .populate('category_ids', 'name slug')
    .lean();

  if (!product) {
    return null;
  }

  return JSON.parse(JSON.stringify(product));
}

export const metadata = {
  title: 'Éditer Produit | Admin',
};

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0A1628]">
            Éditer Produit
          </h1>
          <p className="mt-2 text-gray-600">
            {product.name}
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Chargement...</div>}>
        <ProductForm product={product} isEditing />
      </Suspense>
    </div>
  );
}
