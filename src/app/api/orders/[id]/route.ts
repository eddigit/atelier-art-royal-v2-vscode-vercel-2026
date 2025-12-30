import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

// GET: Récupérer une commande spécifique
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await connectDB();
    
    const order = await Order.findById(id).populate({
      path: 'items.product_id',
      select: 'name slug images',
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }
    
    // Vérifier les permissions (admin ou propriétaire de la commande)
    const session = await getServerSession(authOptions);
    
    if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email });
      
      // Si admin, autoriser
      if (user?.role === 'admin') {
        return NextResponse.json({ order });
      }
      
      // Si propriétaire (par ID ou email), autoriser
      if (
        order.customer_id?.toString() === user?._id.toString() ||
        order.customer_email === session.user.email
      ) {
        return NextResponse.json({ order });
      }
    }
    
    // Pour les invités, vérifier juste l'ID (pour la page de confirmation)
    // On retourne des infos limitées
    return NextResponse.json({
      order: {
        _id: order._id,
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        total: order.total,
        subtotal: order.subtotal,
        shipping_cost: order.shipping_cost,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        items: order.items,
        shipping_address: order.shipping_address,
        created_at: order.created_at,
      },
    });
  } catch (error) {
    console.error('Erreur GET order:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT: Mettre à jour une commande (admin uniquement)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    
    const { id } = await params;
    const body = await req.json();
    
    const order = await Order.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );
    
    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }
    
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Erreur PUT order:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
