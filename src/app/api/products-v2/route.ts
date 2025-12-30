import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import DegreeOrder from '@/models/DegreeOrder';

/**
 * API Products V2 - Optimisée avec agrégation MongoDB et champs dénormalisés
 * 
 * Améliorations:
 * - Utilise loge_types, rite_codes, etc. pour filtrage direct sans populate
 * - Pipeline aggregation au lieu de find().populate()
 * - Projection limitée des champs pour réduire le payload
 * - Index composites pour requêtes combinées
 */

interface ProductFilters {
  category?: string;
  rite?: string;
  obedience?: string;
  degree?: string;
  logeType?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  showPromotions?: boolean;
  showNew?: boolean;
  inStockOnly?: boolean;
  size?: string;
  color?: string;
  material?: string;
  page?: number;
  limit?: number;
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
    featured: searchParams.get('featured') === 'true' || undefined,
    showPromotions: searchParams.get('showPromotions') === 'true' || undefined,
    showNew: searchParams.get('showNew') === 'true' || undefined,
    inStockOnly: searchParams.get('inStockOnly') === 'true' || undefined,
    size: searchParams.get('size') || undefined,
    color: searchParams.get('color') || undefined,
    material: searchParams.get('material') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
    sortBy: searchParams.get('sortBy') || '-created_at',
  };
}

/**
 * Construire le pipeline d'agrégation MongoDB optimisé
 */
async function buildOptimizedPipeline(filters: ProductFilters) {
  const pipeline: any[] = [];

  // Match initial sur is_active (utilise l'index)
  const matchStage: any = { is_active: true };

  // OPTIMISATION: Filtrage par type de loge via champ dénormalisé
  if (filters.logeType) {
    matchStage.loge_types = filters.logeType;
  }

  // Filtre par catégorie (ObjectId)
  if (filters.category && mongoose.Types.ObjectId.isValid(filters.category)) {
    matchStage.category_ids = new mongoose.Types.ObjectId(filters.category);
  }

  // Filtre par rite (ObjectId)
  if (filters.rite && mongoose.Types.ObjectId.isValid(filters.rite)) {
    matchStage.rite_ids = new mongoose.Types.ObjectId(filters.rite);
  }

  // Filtre par obédience (ObjectId)
  if (filters.obedience && mongoose.Types.ObjectId.isValid(filters.obedience)) {
    matchStage.obedience_ids = new mongoose.Types.ObjectId(filters.obedience);
  }

  // Filtre par degré (ObjectId)
  if (filters.degree && mongoose.Types.ObjectId.isValid(filters.degree)) {
    matchStage.degree_order_ids = new mongoose.Types.ObjectId(filters.degree);
  }

  // Filtre de prix (utilise l'index composite is_active+price)
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    matchStage.price = {};
    if (filters.minPrice !== undefined) matchStage.price.$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) matchStage.price.$lte = filters.maxPrice;
  }

  // Produits en vedette
  if (filters.featured) {
    matchStage.featured = true;
  }

  // Promotions actives
  if (filters.showPromotions) {
    const now = new Date();
    matchStage.compare_at_price = { $exists: true, $ne: null };
    matchStage.$expr = { $lt: ['$price', '$compare_at_price'] };
  }

  // Nouveautés (30 derniers jours)
  if (filters.showNew) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    matchStage.created_at = { $gte: thirtyDaysAgo };
  }

  // En stock uniquement (utilise l'index composite)
  if (filters.inStockOnly) {
    matchStage.$or = [
      { stock_quantity: { $gt: 0 } },
      { allow_backorders: true }
    ];
  }

  // Attributs
  if (filters.size) {
    matchStage.sizes = filters.size;
  }
  if (filters.color) {
    matchStage.colors = { $regex: new RegExp(filters.color, 'i') };
  }
  if (filters.material) {
    matchStage.materials = { $regex: new RegExp(filters.material, 'i') };
  }

  // Recherche textuelle
  if (filters.search) {
    matchStage.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { short_description: { $regex: filters.search, $options: 'i' } },
      { tags: { $regex: filters.search, $options: 'i' } },
    ];
  }

  pipeline.push({ $match: matchStage });

  // OPTIMISATION: Populate uniquement les champs nécessaires avec projection
  pipeline.push({
    $lookup: {
      from: 'categories',
      localField: 'category_ids',
      foreignField: '_id',
      as: 'categories',
      pipeline: [{ $project: { name: 1, slug: 1 } }]
    }
  });

  pipeline.push({
    $lookup: {
      from: 'rites',
      localField: 'rite_ids',
      foreignField: '_id',
      as: 'rites',
      pipeline: [{ $project: { name: 1, code: 1, abbreviation: 1 } }]
    }
  });

  pipeline.push({
    $lookup: {
      from: 'obediences',
      localField: 'obedience_ids',
      foreignField: '_id',
      as: 'obediences',
      pipeline: [{ $project: { name: 1, code: 1, abbreviation: 1 } }]
    }
  });

  pipeline.push({
    $lookup: {
      from: 'degreeorders',
      localField: 'degree_order_ids',
      foreignField: '_id',
      as: 'degrees',
      pipeline: [{ $project: { name: 1, level: 1, loge_type: 1 } }]
    }
  });

  // Projection des champs pour la liste (réduire le payload)
  pipeline.push({
    $project: {
      name: 1,
      slug: 1,
      short_description: 1,
      price: 1,
      compare_at_price: 1,
      images: { $slice: ['$images', 2] }, // Max 2 images pour la liste
      stock_quantity: 1,
      allow_backorders: 1,
      featured: 1,
      created_at: 1,
      average_rating: 1,
      review_count: 1,
      categories: 1,
      rites: 1,
      obediences: 1,
      degrees: 1,
      loge_types: 1,
      // Calculer is_on_sale
      is_on_sale: {
        $and: [
          { $gt: ['$compare_at_price', '$price'] },
          { $ifNull: ['$compare_at_price', false] }
        ]
      }
    }
  });

  // Tri
  const sortStage = buildSortStage(filters.sortBy || '-created_at');
  pipeline.push({ $sort: sortStage });

  return pipeline;
}

function buildSortStage(sortBy: string) {
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

    // Construire le pipeline d'agrégation
    const pipeline = await buildOptimizedPipeline(filters);

    // Pagination avec facet (exécution parallèle count + résultats)
    const skip = ((filters.page || 1) - 1) * (filters.limit || 20);
    const limit = filters.limit || 20;

    const aggregationPipeline = [
      ...pipeline,
      {
        $facet: {
          products: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }]
        }
      }
    ];

    const startTime = Date.now();
    const results = await Product.aggregate(aggregationPipeline);
    const executionTime = Date.now() - startTime;

    const products = results[0].products;
    const total = results[0].totalCount[0]?.count || 0;

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
      filters,
      performance: {
        executionTime: `${executionTime}ms`,
        resultCount: products.length
      }
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits', details: error.message },
      { status: 500 }
    );
  }
}
