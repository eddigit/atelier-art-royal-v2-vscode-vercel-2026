import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Category, Product } from '@/models';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();
    
    const categories = await Category.find()
      .populate('parent_id', 'name')
      .sort({ sort_order: 1, name: 1 })
      .lean();

    // Compter les produits par catégorie
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const products_count = await Product.countDocuments({ category_id: cat._id });
        return { ...cat, products_count };
      })
    );

    return NextResponse.json({ categories: categoriesWithCounts });
  } catch (error) {
    console.error('Erreur API catégories:', error);
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

    const category = await Category.create({
      ...data,
      slug,
      parent_id: data.parent_id || null
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Erreur création catégorie:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
