import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Rite from '@/models/Rite';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const withProductCount = searchParams.get('withProductCount') === 'true';
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    const filter: any = {};
    if (activeOnly) {
      filter.is_active = true;
    }

    let rites = await Rite.find(filter).sort({ order: 1 }).lean();

    if (withProductCount) {
      // Compter les produits actifs par rite
      const productCounts = await Product.aggregate([
        { $match: { is_active: true } },
        { $unwind: '$rite_ids' },
        { $group: { _id: '$rite_ids', count: { $sum: 1 } } }
      ]);

      const countMap = new Map(productCounts.map(p => [p._id.toString(), p.count]));

      rites = rites.map(rite => ({
        ...rite,
        product_count: countMap.get(rite._id.toString()) || 0
      }));

      // Optionnellement, filtrer les rites sans produits
      if (searchParams.get('hideEmpty') === 'true') {
        rites = rites.filter((r: any) => r.product_count > 0);
      }
    }

    return NextResponse.json({ rites });
  } catch (error) {
    console.error('Error fetching rites:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des rites' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // TODO: Vérifier l'authentification admin
    
    const rite = await Rite.create(body);
    return NextResponse.json(rite, { status: 201 });
  } catch (error: any) {
    console.error('Error creating rite:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du rite' },
      { status: 500 }
    );
  }
}
