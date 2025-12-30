import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/products - Liste des produits avec gestion avancée
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const rite = searchParams.get('rite');
    const stock_status = searchParams.get('stock_status'); // 'in_stock', 'low_stock', 'out_of_stock'
    const is_active = searchParams.get('is_active');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const order = searchParams.get('order') === 'asc' ? 1 : -1;

    // Construction du filtre
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category_ids = category;
    }

    if (rite) {
      filter.rite_ids = rite;
    }

    if (is_active !== null && is_active !== undefined) {
      filter.is_active = is_active === 'true';
    }

    // Filtre de stock
    if (stock_status === 'out_of_stock') {
      filter.stock_quantity = 0;
    } else if (stock_status === 'low_stock') {
      filter.$expr = { $lte: ['$stock_quantity', '$low_stock_threshold'] };
      filter.stock_quantity = { $gt: 0 };
    } else if (stock_status === 'in_stock') {
      filter.$expr = { $gt: ['$stock_quantity', '$low_stock_threshold'] };
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category_ids', 'name')
        .populate('rite_ids', 'name')
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    // Statistiques de stock
    const stockStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          total_products: { $sum: 1 },
          in_stock: {
            $sum: {
              $cond: [
                { $gt: ['$stock_quantity', '$low_stock_threshold'] },
                1,
                0
              ]
            }
          },
          low_stock: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lte: ['$stock_quantity', '$low_stock_threshold'] },
                    { $gt: ['$stock_quantity', 0] }
                  ]
                },
                1,
                0
              ]
            }
          },
          out_of_stock: {
            $sum: { $cond: [{ $eq: ['$stock_quantity', 0] }, 1, 0] }
          },
        }
      }
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stock_stats: stockStats[0] || {},
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const data = await request.json();

    // Générer le slug si pas fourni
    if (!data.slug && data.name) {
      data.slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Vérifier l'unicité du slug
    if (data.slug) {
      const existingProduct = await Product.findOne({ slug: data.slug });
      if (existingProduct) {
        data.slug = `${data.slug}-${Date.now()}`;
      }
    }

    // Créer le produit
    const product = await Product.create({
      ...data,
      stock_quantity: data.stock_quantity || 0,
      low_stock_threshold: data.low_stock_threshold || 5,
      is_active: data.is_active !== false,
      featured: data.featured || false,
    });

    return NextResponse.json({
      message: 'Produit créé avec succès',
      product,
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
