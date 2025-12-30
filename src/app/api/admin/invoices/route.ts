import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/invoices - Liste des factures
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
    const overdue = searchParams.get('overdue'); // 'true' ou 'false'
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const order = searchParams.get('order') === 'asc' ? 1 : -1;

    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { invoice_number: { $regex: search, $options: 'i' } },
        { customer_email: { $regex: search, $options: 'i' } },
        { customer_name: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (overdue === 'true') {
      filter.status = { $in: ['sent', 'partial'] };
      filter.due_date = { $lt: new Date() };
    }

    const skip = (page - 1) * limit;
    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate('customer_id', 'name email')
        .populate('order_id', 'order_number')
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .lean(),
      Invoice.countDocuments(filter),
    ]);

    // Statistiques
    const stats = await Invoice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total_amount: { $sum: '$total' },
          total_paid: { $sum: '$amount_paid' },
          total_due: { $sum: '$amount_due' },
        }
      }
    ]);

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/admin/invoices - Créer une nouvelle facture (depuis commande)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const { order_id } = await request.json();

    if (!order_id) {
      return NextResponse.json(
        { error: 'ID de commande requis' },
        { status: 400 }
      );
    }

    // Récupérer la commande
    const order = await Order.findById(order_id).lean();
    
    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier si une facture existe déjà pour cette commande
    const existingInvoice = await Invoice.findOne({ order_id });
    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Une facture existe déjà pour cette commande', invoice: existingInvoice },
        { status: 400 }
      );
    }

    // Créer la facture depuis la commande
    const invoice = await Invoice.create({
      order_id: order._id,
      customer_id: order.customer_id,
      customer_email: order.customer_email,
      customer_name: order.customer_name,
      
      billing_address: order.billing_address,
      
      items: order.items.map((item: any) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        sku: item.sku,
        quantity: item.quantity,
        unit_price: item.price,
        tax_rate: 20, // TVA 20%
        total: item.total,
      })),
      
      subtotal: order.subtotal,
      tax_amount: order.tax_amount,
      discount_amount: order.discount_amount,
      total: order.total,
      
      amount_paid: order.payment_status === 'paid' ? order.total : 0,
      amount_due: order.payment_status === 'paid' ? 0 : order.total,
      
      issue_date: new Date(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      
      status: order.payment_status === 'paid' ? 'paid' : 'sent',
      paid_at: order.payment_status === 'paid' ? new Date() : undefined,
    });

    return NextResponse.json({
      message: 'Facture créée avec succès',
      invoice,
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
