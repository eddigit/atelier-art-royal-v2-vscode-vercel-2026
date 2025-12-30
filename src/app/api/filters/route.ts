import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Rite from '@/models/Rite';
import Obedience from '@/models/Obedience';
import DegreeOrder from '@/models/DegreeOrder';
import { catalogCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

/**
 * API optimisée pour récupérer les filtres disponibles avec comptage
 * Utilise le cache et des agrégations MongoDB efficaces
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const cacheKey = `${CACHE_KEYS.FILTERS_AGGREGATIONS}:${includeInactive}`;

    // Essayer de récupérer depuis le cache
    const cached = catalogCache.get<any>(cacheKey);
    if (cached) {
      return NextResponse.json({
        ...cached,
        fromCache: true
      });
    }

    // Pipeline d'agrégation MongoDB ultra-optimisé
    const productMatch = includeInactive ? {} : { is_active: true };

    // Agrégation en parallèle pour toutes les entités
    const [
      categoryAggregation,
      riteAggregation,
      obedienceAggregation,
      degreeAggregation,
      logeTypeAggregation,
      priceRange,
      attributesAggregation
    ] = await Promise.all([
      // Catégories avec comptage
      Product.aggregate([
        { $match: productMatch },
        { $unwind: '$category_ids' },
        { $group: { _id: '$category_ids', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' },
        { $match: { 'category.is_active': true } },
        {
          $project: {
            _id: 1,
            name: '$category.name',
            slug: '$category.slug',
            parent_id: '$category.parent_id',
            count: 1,
            order: '$category.order'
          }
        },
        { $sort: { order: 1, name: 1 } }
      ]),

      // Rites avec comptage
      Product.aggregate([
        { $match: productMatch },
        { $unwind: '$rite_ids' },
        { $group: { _id: '$rite_ids', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'rites',
            localField: '_id',
            foreignField: '_id',
            as: 'rite'
          }
        },
        { $unwind: '$rite' },
        { $match: { 'rite.is_active': true } },
        {
          $project: {
            _id: 1,
            name: '$rite.name',
            code: '$rite.code',
            abbreviation: '$rite.abbreviation',
            count: 1,
            order: '$rite.order'
          }
        },
        { $sort: { order: 1, name: 1 } }
      ]),

      // Obédiences avec comptage
      Product.aggregate([
        { $match: productMatch },
        { $unwind: '$obedience_ids' },
        { $group: { _id: '$obedience_ids', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'obediences',
            localField: '_id',
            foreignField: '_id',
            as: 'obedience'
          }
        },
        { $unwind: '$obedience' },
        { $match: { 'obedience.is_active': true } },
        {
          $project: {
            _id: 1,
            name: '$obedience.name',
            code: '$obedience.code',
            abbreviation: '$obedience.abbreviation',
            country: '$obedience.country',
            count: 1,
            order: '$obedience.order'
          }
        },
        { $sort: { order: 1, name: 1 } }
      ]),

      // Degrés avec comptage
      Product.aggregate([
        { $match: productMatch },
        { $unwind: '$degree_order_ids' },
        { $group: { _id: '$degree_order_ids', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'degreeorders',
            localField: '_id',
            foreignField: '_id',
            as: 'degree'
          }
        },
        { $unwind: '$degree' },
        { $match: { 'degree.is_active': true } },
        {
          $project: {
            _id: 1,
            name: '$degree.name',
            level: '$degree.level',
            loge_type: '$degree.loge_type',
            count: 1
          }
        },
        { $sort: { loge_type: 1, level: 1 } }
      ]),

      // Types de loge (via champs dénormalisés) - ULTRA RAPIDE
      Product.aggregate([
        { $match: productMatch },
        { $unwind: { path: '$loge_types', preserveNullAndEmptyArrays: false } },
        { $group: { _id: '$loge_types', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),

      // Fourchette de prix
      Product.aggregate([
        { $match: productMatch },
        {
          $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
            avgPrice: { $avg: '$price' }
          }
        }
      ]),

      // Attributs (sizes, colors, materials)
      Product.aggregate([
        { $match: productMatch },
        {
          $facet: {
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
            ]
          }
        }
      ])
    ]);

    // Structurer la réponse
    const filters = {
      categories: categoryAggregation.map(c => ({
        id: c._id.toString(),
        name: c.name,
        slug: c.slug,
        parent_id: c.parent_id?.toString(),
        productCount: c.count,
        order: c.order
      })),

      rites: riteAggregation.map(r => ({
        id: r._id.toString(),
        name: r.name,
        code: r.code,
        abbreviation: r.abbreviation,
        productCount: r.count,
        order: r.order
      })),

      obediences: obedienceAggregation.map(o => ({
        id: o._id.toString(),
        name: o.name,
        code: o.code,
        abbreviation: o.abbreviation,
        country: o.country,
        productCount: o.count,
        order: o.order
      })),

      degrees: degreeAggregation.map(d => ({
        id: d._id.toString(),
        name: d.name,
        level: d.level,
        loge_type: d.loge_type,
        productCount: d.count
      })),

      logeTypes: logeTypeAggregation.map(lt => ({
        value: lt._id,
        productCount: lt.count
      })),

      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 1000, avgPrice: 0 },

      attributes: {
        sizes: attributesAggregation[0].sizes.map((s: any) => ({
          value: s._id,
          count: s.count
        })),
        colors: attributesAggregation[0].colors.map((c: any) => ({
          value: c._id,
          count: c.count
        })),
        materials: attributesAggregation[0].materials.map((m: any) => ({
          value: m._id,
          count: m.count
        }))
      },

      timestamp: Date.now()
    };

    // Mettre en cache (15 minutes)
    catalogCache.set(cacheKey, filters, CACHE_TTL.LONG);

    return NextResponse.json({
      ...filters,
      fromCache: false
    });

  } catch (error: any) {
    console.error('Erreur API filters:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des filtres', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Invalider le cache des filtres (appelé lors de modifications)
 */
export async function DELETE(req: NextRequest) {
  try {
    catalogCache.invalidatePattern('^filters:');
    
    return NextResponse.json({
      message: 'Cache des filtres invalidé',
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
