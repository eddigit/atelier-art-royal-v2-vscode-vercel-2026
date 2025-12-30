import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Rite, Product } from '@/models';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();
    
    const rites = await Rite.find()
      .sort({ sort_order: 1, name: 1 })
      .lean();

    // Compter les produits par rite
    const ritesWithCounts = await Promise.all(
      rites.map(async (rite) => {
        const products_count = await Product.countDocuments({ rite_id: rite._id });
        return { ...rite, products_count };
      })
    );

    return NextResponse.json({ rites: ritesWithCounts });
  } catch (error) {
    console.error('Erreur API rites:', error);
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

    // Générer le slug
    const slug = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const rite = await Rite.create({ ...data, slug });

    return NextResponse.json({ rite }, { status: 201 });
  } catch (error) {
    console.error('Erreur création rite:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
