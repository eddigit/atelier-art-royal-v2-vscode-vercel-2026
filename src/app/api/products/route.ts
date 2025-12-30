import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import DegreeOrder from '@/models/DegreeOrder';

interface ProductFilters {
  // Filtres de base
  category?: string;
  rite?: string;
  obedience?: string;
  degree?: string;
  logeType?: string;
  search?: string;
  
  // Filtres de prix
  minPrice?: number;
  maxPrice?: number;
  
  // Filtres de statut
  featured?: boolean;
  showPromotions?: boolean;
  showNew?: boolean;
  inStockOnly?: boolean;
  
  // Filtres d'attributs
  size?: string;
  color?: string;
  material?: string;
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Tri
  sortBy?: string;
}

function parseFilters(searchParams: URLSearchParams): ProductFilters {
  return {
    category: searchParams.get('category') || undefined,
    rite: searchParams.get('rite') || undefined,
    obedience: searchParams.get('obedience') || undefined,
    degree: searchParams.get('degree') || searchParams.get('degreeOrder') || undefined,
    logeType: searchParams.get('logeType') || undefined,
    search: searchParams.get('search') || undefined,
    
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    
    featured: searchParams.get('featured') === 'true' ? true : undefined,
    showPromotions: searchParams.get('showPromotions') === 'true' ? true : undefined,
    showNew: searchParams.get('showNew') === 'true' ? true : undefined,
    inStockOnly: searchParams.get('inStockOnly') === 'true' ? true : undefined,
    
    size: searchParams.get('size') || undefined,
    color: searchParams.get('color') || undefined,
    material: searchParams.get('material') || undefined,
    
    page: parseInt(searchParams.get('page') || '1'),
    limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
    
    sortBy: searchParams.get('sortBy') || '-created_at',
  };
}

async function buildMongoQuery(filters: ProductFilters) {
  const query: any = { is_active: true };
  
  // Filtre par catégorie
  if (filters.category) {
    if (mongoose.Types.ObjectId.isValid(filters.category)) {
      query.category_ids = new mongoose.Types.ObjectId(filters.category);
    }
  }
  
  // Filtre par rite
  if (filters.rite) {
    if (mongoose.Types.ObjectId.isValid(filters.rite)) {
      query.rite_ids = new mongoose.Types.ObjectId(filters.rite);
    }
  }
  
  // Filtre par obédience
  if (filters.obedience) {
    if (mongoose.Types.ObjectId.isValid(filters.obedience)) {
      query.obedience_ids = new mongoose.Types.ObjectId(filters.obedience);
    }
  }
  
  // Filtre par degré
  if (filters.degree) {
    if (mongoose.Types.ObjectId.isValid(filters.degree)) {
      query.degree_order_ids = new mongoose.Types.ObjectId(filters.degree);
    }
  }
  
  // Filtre par type de loge (indirect via DegreeOrder)
  if (filters.logeType) {
    const degreesByLogeType = await DegreeOrder.find({ 
      loge_type: filters.logeType,
      is_active: true 
    }).select('_id').lean();
    
    const degreeIds = degreesByLogeType.map(d => d._id);
    
    if (degreeIds.length > 0) {
      if (query.degree_order_ids) {
        // Combiner avec le filtre de degré existant
        query.degree_order_ids = { 
          $in: degreeIds.filter(id => 
            id.toString() === query.degree_order_ids.toString()
          )
        };
      } else {
        query.degree_order_ids = { $in: degreeIds };
      }
    } else {
      // Aucun degré trouvé pour ce type de loge, retourner 0 résultats
      query._id = null;
    }
  }
  
  // Filtre par prix
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
  }
  
  // Produits en vedette
  if (filters.featured) {
    query.featured = true;
  }
  
  // Promotions actives
  if (filters.showPromotions) {
    const now = new Date();
    query.compare_at_price = { $exists: true, $gt: 0 };
    query.$expr = { $lt: ['$price', '$compare_at_price'] };
    query.$or = [
      { promo_start_date: { $exists: false } },
      { promo_start_date: { $lte: now } }
    ];
    query.$and = [
      {
        $or: [
          { promo_end_date: { $exists: false } },
          { promo_end_date: { $gte: now } }
        ]
      }
    ];
  }
  
  // Nouveautés (30 derniers jours)
  if (filters.showNew) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    query.created_at = { $gte: thirtyDaysAgo };
  }
  
  // En stock uniquement
  if (filters.inStockOnly) {
    query.$or = [
      { stock_quantity: { $gt: 0 } },
      { allow_backorders: true }
    ];
  }
  
  // Filtres d'attributs
  if (filters.size) {
    query.sizes = filters.size;
  }
  
  if (filters.color) {
    query.colors = { $regex: new RegExp(filters.color, 'i') };
  }
  
  if (filters.material) {
    query.materials = { $regex: new RegExp(filters.material, 'i') };
  }
  
  // Recherche textuelle
  if (filters.search) {
    // Utiliser la recherche full-text MongoDB si disponible
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { short_description: { $regex: filters.search, $options: 'i' } },
      { tags: { $regex: filters.search, $options: 'i' } },
      { materials: { $regex: filters.search, $options: 'i' } },
      { colors: { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  return query;
}

function buildSortQuery(sortBy: string) {
  const sortOptions: Record<string, any> = {
    '-created_at': { created_at: -1 },
    'created_at': { created_at: 1 },
    'price_asc': { price: 1 },
    'price_desc': { price: -1 },
    '-price': { price: -1 },
    'price': { price: 1 },
    'name': { name: 1 },
    '-name': { name: -1 },
    'featured': { featured: -1, created_at: -1 },
    'popular': { review_count: -1, average_rating: -1 },
  };
  
  return sortOptions[sortBy] || { created_at: -1 };
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const filters = parseFilters(searchParams);
    
    const query = await buildMongoQuery(filters);
    const sort = buildSortQuery(filters.sortBy || '-created_at');
    const skip = ((filters.page || 1) - 1) * (filters.limit || 20);

    // Exécution de la requête avec populate
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(filters.limit || 20)
        .populate('category_ids', 'name slug')
        .populate('rite_ids', 'name code')
        .populate('obedience_ids', 'name code')
        .populate('degree_order_ids', 'name level loge_type')
        .lean(),
      Product.countDocuments(query),
    ]);

    // Calculer les agrégations pour les filtres disponibles
    const aggregations = searchParams.get('withAggregations') === 'true' 
      ? await getFilterAggregations(query)
      : null;

    return NextResponse.json({
      products,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        pages: Math.ceil(total / (filters.limit || 20)),
        hasNext: ((filters.page || 1) * (filters.limit || 20)) < total,
        hasPrev: (filters.page || 1) > 1,
      },
      aggregations,
      filters: filters, // Retourner les filtres appliqués
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    );
  }
}

async function getFilterAggregations(baseQuery: any) {
  // Agrégations pour connaître les options de filtres disponibles
  const aggregations = await Product.aggregate([
    { $match: { ...baseQuery, is_active: true } },
    {
      $facet: {
        priceRange: [
          {
            $group: {
              _id: null,
              minPrice: { $min: '$price' },
              maxPrice: { $max: '$price' },
            }
          }
        ],
        sizes: [
          { $unwind: { path: '$sizes', preserveNullAndEmptyArrays: false } },
          { $group: { _id: '$sizes', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ],
        colors: [
          { $unwind: { path: '$colors', preserveNullAndEmptyArrays: false } },
          { $group: { _id: '$colors', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ],
        materials: [
          { $unwind: { path: '$materials', preserveNullAndEmptyArrays: false } },
          { $group: { _id: '$materials', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ],
        categories: [
          { $unwind: { path: '$category_ids', preserveNullAndEmptyArrays: false } },
          { $group: { _id: '$category_ids', count: { $sum: 1 } } }
        ],
        rites: [
          { $unwind: { path: '$rite_ids', preserveNullAndEmptyArrays: false } },
          { $group: { _id: '$rite_ids', count: { $sum: 1 } } }
        ],
        obediences: [
          { $unwind: { path: '$obedience_ids', preserveNullAndEmptyArrays: false } },
          { $group: { _id: '$obedience_ids', count: { $sum: 1 } } }
        ],
        degrees: [
          { $unwind: { path: '$degree_order_ids', preserveNullAndEmptyArrays: false } },
          { $group: { _id: '$degree_order_ids', count: { $sum: 1 } } }
        ],
      }
    }
  ]);

  const result = aggregations[0];
  
  return {
    priceRange: result.priceRange[0] || { minPrice: 0, maxPrice: 1000 },
    sizes: result.sizes.map((s: any) => ({ value: s._id, count: s.count })),
    colors: result.colors.map((c: any) => ({ value: c._id, count: c.count })),
    materials: result.materials.map((m: any) => ({ value: m._id, count: m.count })),
    categoryIds: result.categories.map((c: any) => ({ id: c._id, count: c.count })),
    riteIds: result.rites.map((r: any) => ({ id: r._id, count: r.count })),
    obedienceIds: result.obediences.map((o: any) => ({ id: o._id, count: o.count })),
    degreeIds: result.degrees.map((d: any) => ({ id: d._id, count: d.count })),
  };
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // TODO: Vérifier l'authentification admin

    const product = await Product.create(body);

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du produit' },
      { status: 500 }
    );
  }
}
