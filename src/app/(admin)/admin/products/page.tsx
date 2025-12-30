import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Filter, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

async function getProducts(searchParams: any) {
  await dbConnect();
  
  const page = parseInt(searchParams.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const filter: any = {};
  
  if (searchParams.search) {
    filter.$text = { $search: searchParams.search };
  }
  
  if (searchParams.status === 'active') {
    filter.is_active = true;
  } else if (searchParams.status === 'inactive') {
    filter.is_active = false;
  }

  if (searchParams.filter === 'lowStock') {
    filter.stock_quantity = { $lte: 5 };
    filter.is_active = true;
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products: JSON.parse(JSON.stringify(products)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const { products, pagination } = await getProducts(searchParams);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0A1628]">
            Produits
          </h1>
          <p className="mt-2 text-gray-600">
            Gérez votre catalogue de produits
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-[#B8860B] hover:bg-[#C9A84C]">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Produit
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
                defaultValue={searchParams.search || ''}
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
            defaultValue={searchParams.status || 'all'}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>

          {/* Stock Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
            defaultValue={searchParams.filter || ''}
          >
            <option value="">Tous les stocks</option>
            <option value="lowStock">Stock faible</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-[#0A1628] mt-1">
            {pagination.total}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">En ligne</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {products.filter((p: any) => p.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Stock faible</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {products.filter((p: any) => p.stock_quantity <= 5).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">En rupture</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {products.filter((p: any) => p.stock_quantity === 0).length}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Aucun produit trouvé
                  </td>
                </tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              width={64}
                              height={64}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                              <span className="text-2xl">📦</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#0A1628] truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            SKU: {product.sku || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.price?.toFixed(2)} €
                      </div>
                      {product.compare_at_price && (
                        <div className="text-xs text-gray-500 line-through">
                          {product.compare_at_price.toFixed(2)} €
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        product.stock_quantity === 0
                          ? 'text-red-600'
                          : product.stock_quantity <= 5
                          ? 'text-amber-600'
                          : 'text-green-600'
                      }`}>
                        {product.stock_quantity || 0}
                      </div>
                      {product.allow_backorders && (
                        <div className="text-xs text-gray-500">
                          Sur commande
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.is_active ? (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            En ligne
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Hors ligne
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="text-[#B8860B] hover:text-[#0A1628] p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page <span className="font-medium">{pagination.page}</span> sur{' '}
                <span className="font-medium">{pagination.totalPages}</span>
              </div>
              <div className="flex gap-2">
                {pagination.page > 1 && (
                  <Link href={`/admin/products?page=${pagination.page - 1}`}>
                    <Button variant="outline" size="sm">
                      Précédent
                    </Button>
                  </Link>
                )}
                {pagination.page < pagination.totalPages && (
                  <Link href={`/admin/products?page=${pagination.page + 1}`}>
                    <Button variant="outline" size="sm">
                      Suivant
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
