import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import CartItem from '@/models/CartItem';

// POST: Ajouter les articles d'une commande passée au panier (recommander)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { id } = await params;
    
    await connectDB();
    
    // Trouver l'utilisateur
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    // Trouver la commande (par ID client ou email)
    const order = await Order.findOne({ 
      _id: id, 
      $or: [
        { customer_id: user._id },
        { customer_email: session.user.email }
      ]
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }
    
    // Ajouter chaque article au panier
    const cartItems = [];
    
    for (const item of order.items) {
      // Vérifier si l'article existe déjà dans le panier
      const existingItem = await CartItem.findOne({
        user_id: user._id,
        product_id: item.product_id,
      });
      
      if (existingItem) {
        // Mettre à jour la quantité
        existingItem.quantity += item.quantity;
        await existingItem.save();
        cartItems.push(existingItem);
      } else {
        // Créer un nouvel article
        const cartItem = await CartItem.create({
          user_id: user._id,
          product_id: item.product_id,
          quantity: item.quantity,
        });
        cartItems.push(cartItem);
      }
    }
    
    return NextResponse.json({
      message: 'Articles ajoutés au panier',
      items_added: cartItems.length,
    });
  } catch (error) {
    console.error('Erreur reorder:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
