import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Obedience from '@/models/Obedience';
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

    let obediences = await Obedience.find(filter).sort({ order: 1 }).lean();

    if (withProductCount) {
      // Compter les produits actifs par obédience
      const productCounts = await Product.aggregate([
        { $match: { is_active: true } },
        { $unwind: '$obedience_ids' },
        { $group: { _id: '$obedience_ids', count: { $sum: 1 } } }
      ]);

      const countMap = new Map(productCounts.map(p => [p._id.toString(), p.count]));

      obediences = obediences.map(ob => ({
        ...ob,
        product_count: countMap.get(ob._id.toString()) || 0
      }));

      // Optionnellement, filtrer les obédiences sans produits
      if (searchParams.get('hideEmpty') === 'true') {
        obediences = obediences.filter((o: any) => o.product_count > 0);
      }
    }

    return NextResponse.json({ obediences });
  } catch (error) {
    console.error('Error fetching obediences:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des obédiences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // TODO: Vérifier l'authentification admin
    
    const obedience = await Obedience.create(body);
    return NextResponse.json(obedience, { status: 201 });
  } catch (error: any) {
    console.error('Error creating obedience:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de l\'obédience' },
      { status: 500 }
    );
  }
}
