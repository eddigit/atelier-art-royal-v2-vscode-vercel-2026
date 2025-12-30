import { Suspense } from 'react';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Rite from '@/models/Rite';
import Obedience from '@/models/Obedience';
import DegreeOrder from '@/models/DegreeOrder';
import { CatalogClient } from './CatalogClient';
import LuxeHeader from '@/components/layout/LuxeHeader';
import LuxeFooter from '@/components/layout/LuxeFooter';

interface SearchParams {
  category?: string;
  rite?: string;
  obedience?: string;
  degree?: string;
  degreeOrder?: string;
  logeType?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  size?: string;
  color?: string;
  material?: string;
  showPromotions?: string;
  showNew?: string;
  inStockOnly?: string;
  page?: string;
  sortBy?: string;
}

async function getFilters() {
  await dbConnect();
  
  // Récupérer les filtres avec le compte de produits
  const [categories, rites, obediences, degrees] = await Promise.all([
    Category.find({ is_active: true }).sort({ order: 1 }).lean(),
    Rite.find({ is_active: true }).sort({ order: 1 }).lean(),
    Obedience.find({ is_active: true }).sort({ order: 1 }).lean(),
    DegreeOrder.find({ is_active: true }).sort({ loge_type: 1, level: 1 }).lean(),
  ]);
  
  // Compter les produits par entité
  const [catCounts, riteCounts, obCounts, degCounts] = await Promise.all([
    Product.aggregate([
      { $match: { is_active: true } },
      { $unwind: '$category_ids' },
      { $group: { _id: '$category_ids', count: { $sum: 1 } } }
    ]),
    Product.aggregate([
      { $match: { is_active: true } },
      { $unwind: '$rite_ids' },
      { $group: { _id: '$rite_ids', count: { $sum: 1 } } }
    ]),
    Product.aggregate([
      { $match: { is_active: true } },
      { $unwind: '$obedience_ids' },
      { $group: { _id: '$obedience_ids', count: { $sum: 1 } } }
    ]),
    Product.aggregate([
      { $match: { is_active: true } },
      { $unwind: '$degree_order_ids' },
      { $group: { _id: '$degree_order_ids', count: { $sum: 1 } } }
    ]),
  ]);
  
  const catCountMap = new Map(catCounts.map(c => [c._id.toString(), c.count]));
  const riteCountMap = new Map(riteCounts.map(r => [r._id.toString(), r.count]));
  const obCountMap = new Map(obCounts.map(o => [o._id.toString(), o.count]));
  const degCountMap = new Map(degCounts.map(d => [d._id.toString(), d.count]));
  
  // Récupérer les attributs uniques des produits
  const attributeAggregation = await Product.aggregate([
    { $match: { is_active: true } },
    {
      $facet: {
        sizes: [
          { $unwind: { path: '$sizes', preserveNullAndEmptyArrays: false } },
          { $group: { _id: '$sizes' } },
          { $sort: { _id: 1 } }
        ],
        colors: [
          { $unwind: { path: '$colors', preserveNullAndEmptyArrays: false } },
          { $group: { _id: '$colors' } },
          { $sort: { _id: 1 } }
        ],
        materials: [
          { $unwind: { path: '$materials', preserveNullAndEmptyArrays: false } },
          { $group: { _id: '$materials' } },
          { $sort: { _id: 1 } }
        ],
        priceRange: [
          { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }
        ]
      }
    }
  ]);
  
  const attrs = attributeAggregation[0] || {};
  
  return {
    categories: JSON.parse(JSON.stringify(categories.map(c => ({
      ...c,
      product_count: catCountMap.get(c._id.toString()) || 0
    })))),
    rites: JSON.parse(JSON.stringify(rites.map(r => ({
      ...r,
      product_count: riteCountMap.get(r._id.toString()) || 0
    })))),
    obediences: JSON.parse(JSON.stringify(obediences.map(o => ({
      ...o,
      product_count: obCountMap.get(o._id.toString()) || 0
    })))),
    degrees: JSON.parse(JSON.stringify(degrees.map(d => ({
      ...d,
      product_count: degCountMap.get(d._id.toString()) || 0
    })))),
    sizes: attrs.sizes?.map((s: any) => s._id) || [],
    colors: attrs.colors?.map((c: any) => c._id) || [],
    materials: attrs.materials?.map((m: any) => m._id) || [],
    priceRange: attrs.priceRange?.[0] 
      ? { min: attrs.priceRange[0].min, max: attrs.priceRange[0].max }
      : { min: 0, max: 1000 },
  };
}

async function getProducts(searchParams: SearchParams) {
  await dbConnect();
  
  const page = parseInt(searchParams.page || '1');
  const limit = 12;
  const skip = (page - 1) * limit;
  
  const query: any = { is_active: true };
  
  // Filtre par catégorie (par ID ou slug)
  if (searchParams.category) {
    const category = await Category.findOne({ 
      $or: [
        { slug: searchParams.category },
        { _id: searchParams.category }
      ]
    });
    if (category) query.category_ids = category._id;
  }
  
  // Filtre par rite
  if (searchParams.rite) {
    query.rite_ids = searchParams.rite;
  }
  
  // Filtre par obédience
  if (searchParams.obedience) {
    query.obedience_ids = searchParams.obedience;
  }
  
  // Filtre par degré
  const degreeId = searchParams.degree || searchParams.degreeOrder;
  if (degreeId) {
    query.degree_order_ids = degreeId;
  }
  
  // Filtre par type de loge (indirect via DegreeOrder)
  if (searchParams.logeType) {
    const degreesByLogeType = await DegreeOrder.find({ 
      loge_type: searchParams.logeType,
      is_active: true 
    }).select('_id').lean();
    
    const degreeIds = degreesByLogeType.map(d => d._id);
    
    if (degreeIds.length > 0) {
      query.degree_order_ids = { $in: degreeIds };
    }
  }
  
  // Filtre par prix
  if (searchParams.minPrice || searchParams.maxPrice) {
    query.price = {};
    if (searchParams.minPrice) query.price.$gte = parseFloat(searchParams.minPrice);
    if (searchParams.maxPrice) query.price.$lte = parseFloat(searchParams.maxPrice);
  }
  
  // Filtre par attributs
  if (searchParams.size) {
    query.sizes = searchParams.size;
  }
  
  if (searchParams.color) {
    query.colors = { $regex: new RegExp(searchParams.color, 'i') };
  }
  
  if (searchParams.material) {
    query.materials = { $regex: new RegExp(searchParams.material, 'i') };
  }
  
  // Filtre promotions
  if (searchParams.showPromotions === 'true') {
    query.compare_at_price = { $exists: true, $gt: 0 };
    query.$expr = { $lt: ['$price', '$compare_at_price'] };
  }
  
  // Filtre nouveautés (30 derniers jours)
  if (searchParams.showNew === 'true') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    query.created_at = { $gte: thirtyDaysAgo };
  }
  
  // Filtre en stock uniquement
  if (searchParams.inStockOnly === 'true') {
    query.$or = [
      { stock_quantity: { $gt: 0 } },
      { allow_backorders: true }
    ];
  }
  
  // Recherche textuelle
  if (searchParams.search) {
    const searchRegex = { $regex: searchParams.search, $options: 'i' };
    // Si on a déjà un $or (inStockOnly), on doit utiliser $and
    if (query.$or) {
      query.$and = [
        { $or: query.$or },
        { 
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { short_description: searchRegex },
            { tags: searchRegex },
          ]
        }
      ];
      delete query.$or;
    } else {
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { short_description: searchRegex },
        { tags: searchRegex },
      ];
    }
  }
  
  // Tri
  let sort: any = { created_at: -1 };
  switch (searchParams.sortBy) {
    case 'price_asc':
    case 'price':
      sort = { price: 1 };
      break;
    case 'price_desc':
    case '-price':
      sort = { price: -1 };
      break;
    case 'name':
      sort = { name: 1 };
      break;
    case '-name':
      sort = { name: -1 };
      break;
    case 'featured':
      sort = { featured: -1, created_at: -1 };
      break;
    case 'popular':
      sort = { review_count: -1, average_rating: -1 };
      break;
    default:
      sort = { created_at: -1 };
  }
  
  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('category_ids', 'name slug')
      .populate('rite_ids', 'name code')
      .populate('obedience_ids', 'name code')
      .populate('degree_order_ids', 'name level loge_type')
      .lean(),
    Product.countDocuments(query),
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

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [filters, { products, pagination }] = await Promise.all([
    getFilters(),
    getProducts(searchParams),
  ]);

  return (
    <>
      <LuxeHeader />
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogClient 
          initialProducts={products}
          initialPagination={pagination}
          filterOptions={filters}
          initialFilters={searchParams}
        />
      </Suspense>
      <LuxeFooter />
    </>
  );
}

function CatalogSkeleton() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar skeleton */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded mb-6"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="mb-4">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-8 bg-gray-100 rounded mb-1"></div>
                  ))}
                </div>
              ))}
            </div>
          </aside>
          
          {/* Grid skeleton */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
