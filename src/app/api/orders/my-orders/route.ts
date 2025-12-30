import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

// GET: Récupérer les commandes de l'utilisateur connecté
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    await connectDB();
    
    // Trouver l'utilisateur
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    // Récupérer les commandes de l'utilisateur (par ID ou par email)
    const orders = await Order.find({ 
      $or: [
        { customer_id: user._id },
        { customer_email: session.user.email }
      ]
    })
      .populate({
        path: 'items.product_id',
        select: 'name slug images price',
      })
      .sort({ created_at: -1 });
    
    return NextResponse.json({ 
      orders,
      total: orders.length 
    });
  } catch (error) {
    console.error('Erreur GET my-orders:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
