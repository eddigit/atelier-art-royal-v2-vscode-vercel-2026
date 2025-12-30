import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/orders - Liste des commandes avec filtres avancés
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
    const status = searchParams.get('status');
    const payment_status = searchParams.get('payment_status');
    const source = searchParams.get('source'); // web, pos, quote
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const order = searchParams.get('order') === 'asc' ? 1 : -1;

    // Construction du filtre
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { order_number: { $regex: search, $options: 'i' } },
        { customer_email: { $regex: search, $options: 'i' } },
        { customer_name: { $regex: search, $options: 'i' } },
        { tracking_number: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (payment_status) {
      filter.payment_status = payment_status;
    }

    if (source) {
      filter.source = source;
    }

    if (startDate || endDate) {
      filter.created_at = {};
      if (startDate) {
        filter.created_at.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.created_at.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer_id', 'name email')
        .populate('quote_id', 'quote_number')
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    // Statistiques par source
    const sourceStats = await Order.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          total_revenue: { $sum: '$total' },
        }
      }
    ]);

    // Statistiques par statut
    const statusStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        }
      }
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        by_source: sourceStats,
        by_status: statusStats,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/admin/orders - Créer une nouvelle commande (POS ou manuelle)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const data = await request.json();

    // Vérifier et mettre à jour les stocks
    for (const item of data.items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return NextResponse.json(
          { error: `Produit ${item.product_name} non trouvé` },
          { status: 404 }
        );
      }

      if (product.stock_quantity < item.quantity && !product.allow_backorders) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${item.product_name}` },
          { status: 400 }
        );
      }
    }

    // Créer la commande
    const order = await Order.create({
      ...data,
      source: data.source || 'pos', // Par défaut POS pour création admin
    });

    // Mettre à jour les stocks
    for (const item of data.items) {
      await Product.findByIdAndUpdate(
        item.product_id,
        { $inc: { stock_quantity: -item.quantity } }
      );
    }

    return NextResponse.json({
      message: 'Commande créée avec succès',
      order,
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
