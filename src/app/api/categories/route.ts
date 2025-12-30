import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const withProductCount = searchParams.get('withProductCount') === 'true';
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    const flat = searchParams.get('flat') === 'true';

    const filter: any = {};
    if (activeOnly) {
      filter.is_active = true;
    }

    let categories = await Category.find(filter).sort({ order: 1, name: 1 }).lean();

    if (withProductCount) {
      // Compter les produits actifs par catégorie
      const productCounts = await Product.aggregate([
        { $match: { is_active: true } },
        { $unwind: '$category_ids' },
        { $group: { _id: '$category_ids', count: { $sum: 1 } } }
      ]);

      const countMap = new Map(productCounts.map(p => [p._id.toString(), p.count]));

      categories = categories.map(cat => ({
        ...cat,
        product_count: countMap.get(cat._id.toString()) || 0
      }));

      // Optionnellement, filtrer les catégories sans produits
      if (searchParams.get('hideEmpty') === 'true') {
        categories = categories.filter((c: any) => c.product_count > 0);
      }
    }

    // Si non flat, construire la hiérarchie
    if (!flat) {
      interface CategoryWithChildren {
        _id: any;
        parent_id?: any;
        children: CategoryWithChildren[];
        [key: string]: any;
      }
      
      const categoryMap = new Map<string, CategoryWithChildren>(
        categories.map(c => [c._id.toString(), { ...c, children: [] as CategoryWithChildren[] }])
      );
      const rootCategories: CategoryWithChildren[] = [];

      categories.forEach((cat: any) => {
        const catWithChildren = categoryMap.get(cat._id.toString())!;
        if (cat.parent_id) {
          const parent = categoryMap.get(cat.parent_id.toString());
          if (parent) {
            parent.children.push(catWithChildren);
          } else {
            rootCategories.push(catWithChildren);
          }
        } else {
          rootCategories.push(catWithChildren);
        }
      });

      return NextResponse.json({ categories: rootCategories, flat: categories });
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // TODO: Vérifier l'authentification admin
    
    const category = await Category.create(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la catégorie' },
      { status: 500 }
    );
  }
}
