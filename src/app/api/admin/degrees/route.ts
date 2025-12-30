import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { DegreeOrder, Product } from '@/models';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const riteId = searchParams.get('rite');

    const query: Record<string, unknown> = {};
    if (riteId) query.rite_id = riteId;

    const degrees = await DegreeOrder.find(query)
      .sort({ loge_type: 1, level: 1 })
      .lean();

    // Compter les produits par degré (utilise le champ level)
    const degreesWithCounts = await Promise.all(
      degrees.map(async (deg) => {
        const products_count = await Product.countDocuments({ degree: deg.level });
        return { ...deg, products_count };
      })
    );

    return NextResponse.json({ degrees: degreesWithCounts });
  } catch (error) {
    console.error('Erreur API degrés:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    const degree = await DegreeOrder.create({
      ...data,
      rite_id: data.rite_id || null
    });

    return NextResponse.json({ degree }, { status: 201 });
  } catch (error) {
    console.error('Erreur création degré:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
