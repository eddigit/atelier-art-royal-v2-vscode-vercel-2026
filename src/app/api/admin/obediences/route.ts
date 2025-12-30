import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Obedience, Product } from '@/models';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();
    
    const obediences = await Obedience.find()
      .sort({ sort_order: 1, name: 1 })
      .lean();

    // Compter les produits par obédience
    const obediencesWithCounts = await Promise.all(
      obediences.map(async (ob) => {
        const products_count = await Product.countDocuments({ obedience_id: ob._id });
        return { ...ob, products_count };
      })
    );

    return NextResponse.json({ obediences: obediencesWithCounts });
  } catch (error) {
    console.error('Erreur API obédiences:', error);
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

    const obedience = await Obedience.create({ ...data, slug });

    return NextResponse.json({ obedience }, { status: 201 });
  } catch (error) {
    console.error('Erreur création obédience:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
