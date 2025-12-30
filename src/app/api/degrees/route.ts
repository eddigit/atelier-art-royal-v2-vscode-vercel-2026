import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DegreeOrder from '@/models/DegreeOrder';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const withProductCount = searchParams.get('withProductCount') === 'true';
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    const logeType = searchParams.get('logeType'); // 'Loge Symbolique' ou 'Loge Hauts Grades'

    const filter: any = {};
    if (activeOnly) {
      filter.is_active = true;
    }
    if (logeType) {
      filter.loge_type = logeType;
    }

    let degrees = await DegreeOrder.find(filter)
      .sort({ loge_type: 1, level: 1, order: 1 })
      .lean();

    if (withProductCount) {
      // Compter les produits actifs par degré
      const productCounts = await Product.aggregate([
        { $match: { is_active: true } },
        { $unwind: '$degree_order_ids' },
        { $group: { _id: '$degree_order_ids', count: { $sum: 1 } } }
      ]);

      const countMap = new Map(productCounts.map(p => [p._id.toString(), p.count]));

      degrees = degrees.map(deg => ({
        ...deg,
        product_count: countMap.get(deg._id.toString()) || 0
      }));

      // Optionnellement, filtrer les degrés sans produits
      if (searchParams.get('hideEmpty') === 'true') {
        degrees = degrees.filter((d: any) => d.product_count > 0);
      }
    }

    // Grouper par type de loge si demandé
    if (searchParams.get('grouped') === 'true') {
      const grouped = {
        'Loge Symbolique': degrees.filter((d: any) => d.loge_type === 'Loge Symbolique'),
        'Loge Hauts Grades': degrees.filter((d: any) => d.loge_type === 'Loge Hauts Grades'),
      };
      return NextResponse.json({ degrees, grouped });
    }

    return NextResponse.json({ degrees });
  } catch (error) {
    console.error('Error fetching degrees:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des degrés' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // TODO: Vérifier l'authentification admin
    
    const degree = await DegreeOrder.create(body);
    return NextResponse.json(degree, { status: 201 });
  } catch (error: any) {
    console.error('Error creating degree:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du degré' },
      { status: 500 }
    );
  }
}
