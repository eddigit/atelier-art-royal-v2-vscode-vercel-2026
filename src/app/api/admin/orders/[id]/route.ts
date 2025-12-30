import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/orders/[id] - Détails d'une commande
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const order = await Order.findById(params.id)
      .populate('customer_id', 'name email phone')
      .populate('quote_id', 'quote_number sales_person')
      .populate('items.product_id', 'name images')
      .lean();

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/orders/[id] - Mettre à jour une commande
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const data = await request.json();

    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Si changement de statut vers "shipped", ajouter la date
    if (data.status === 'shipped' && order.status !== 'shipped') {
      data.shipped_at = new Date();
    }

    // Si changement de statut vers "delivered", ajouter la date
    if (data.status === 'delivered' && order.status !== 'delivered') {
      data.delivered_at = new Date();
    }

    // Mettre à jour la commande
    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      message: 'Commande mise à jour avec succès',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/orders/[id] - Annuler une commande
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const order = await Order.findById(params.id);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Ne peut annuler que les commandes non expédiées
    if (['shipped', 'delivered'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Impossible d\'annuler une commande déjà expédiée' },
        { status: 400 }
      );
    }

    // Restaurer les stocks
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product_id,
        { $inc: { stock_quantity: item.quantity } }
      );
    }

    // Marquer comme annulée
    order.status = 'cancelled';
    await order.save();

    return NextResponse.json({
      message: 'Commande annulée avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
