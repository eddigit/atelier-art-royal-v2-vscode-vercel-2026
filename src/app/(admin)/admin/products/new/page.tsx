import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';

export const metadata = {
  title: 'Nouveau Produit | Admin',
};

export default function NewProductPage() {
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
            Nouveau Produit
          </h1>
          <p className="mt-2 text-gray-600">
            Créez un nouveau produit dans le catalogue
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Chargement...</div>}>
        <ProductForm />
      </Suspense>
    </div>
  );
}
