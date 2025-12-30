import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Quote from '@/models/Quote';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/quotes - Liste des devis
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
    const sales_person = searchParams.get('sales_person');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const order = searchParams.get('order') === 'asc' ? 1 : -1;

    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { quote_number: { $regex: search, $options: 'i' } },
        { customer_email: { $regex: search, $options: 'i' } },
        { customer_name: { $regex: search, $options: 'i' } },
        { customer_company: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (sales_person) {
      filter.sales_person = sales_person;
    }

    const skip = (page - 1) * limit;
    const [quotes, total] = await Promise.all([
      Quote.find(filter)
        .populate('customer_id', 'name email')
        .populate('converted_to_order', 'order_number')
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .lean(),
      Quote.countDocuments(filter),
    ]);

    // Statistiques
    const stats = await Quote.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total_value: { $sum: '$total' },
        }
      }
    ]);

    return NextResponse.json({
      quotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des devis:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/admin/quotes - Créer un nouveau devis
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const data = await request.json();

    // Calculer les totaux des items
    const items = data.items.map((item: any) => {
      const discountAmount = (item.unit_price * item.quantity * (item.discount_percent || 0)) / 100;
      return {
        ...item,
        total: (item.unit_price * item.quantity) - discountAmount,
      };
    });

    const subtotal = items.reduce((sum: number, item: any) => sum + item.total, 0);
    const shipping_cost = data.shipping_cost || 0;
    const discount_amount = data.discount_amount || 0;
    const tax_amount = (subtotal + shipping_cost - discount_amount) * 0.20; // TVA 20%
    const total = subtotal + shipping_cost + tax_amount - discount_amount;

    // Définir la date de validité par défaut (30 jours)
    const valid_until = data.valid_until 
      ? new Date(data.valid_until)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const quote = await Quote.create({
      ...data,
      items,
      subtotal,
      shipping_cost,
      tax_amount,
      discount_amount,
      total,
      valid_until,
      sales_person: data.sales_person || session.user.name || session.user.email,
    });

    return NextResponse.json({
      message: 'Devis créé avec succès',
      quote,
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du devis:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
