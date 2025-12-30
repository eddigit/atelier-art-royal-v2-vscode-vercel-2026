import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/customers/[id] - Détails d'un client
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

    const customer = await User.findById(params.id)
      .select('-password')
      .populate('obedience_id', 'name')
      .lean();

    if (!customer) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les statistiques de commandes du client
    const orders = await Order.find({ customer_id: params.id }).lean();
    const stats = {
      total_orders: orders.length,
      total_spent: orders.reduce((sum, order) => sum + order.total, 0),
      average_order: orders.length > 0 
        ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length 
        : 0,
    };

    return NextResponse.json({
      customer,
      stats,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/customers/[id] - Mettre à jour un client
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

    // Vérifier si le client existe
    const customer = await User.findById(params.id);
    if (!customer) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'email existe déjà (si changé)
    if (data.email && data.email !== customer.email) {
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Un utilisateur avec cet email existe déjà' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le client
    const updatedCustomer = await User.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json({
      message: 'Client mis à jour avec succès',
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/customers/[id] - Supprimer un client (soft delete)
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

    // Vérifier si le client a des commandes
    const hasOrders = await Order.exists({ customer_id: params.id });
    
    if (hasOrders) {
      // Soft delete: désactiver le compte
      await User.findByIdAndUpdate(params.id, { is_active: false });
      return NextResponse.json({
        message: 'Client désactivé (a des commandes associées)',
      });
    } else {
      // Hard delete si pas de commandes
      await User.findByIdAndDelete(params.id);
      return NextResponse.json({
        message: 'Client supprimé avec succès',
      });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
