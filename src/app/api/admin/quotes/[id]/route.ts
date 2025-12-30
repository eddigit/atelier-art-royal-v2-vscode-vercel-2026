import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Quote from '@/models/Quote';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/quotes/[id] - Détails d'un devis
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

    const quote = await Quote.findById(params.id)
      .populate('customer_id', 'name email phone')
      .populate('converted_to_order', 'order_number status')
      .populate('items.product_id', 'name images stock_quantity')
      .lean();

    if (!quote) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ quote });
  } catch (error) {
    console.error('Erreur lors de la récupération du devis:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/quotes/[id] - Mettre à jour un devis
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

    const quote = await Quote.findById(params.id);
    if (!quote) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    // Ne peut modifier un devis converti
    if (quote.status === 'converted') {
      return NextResponse.json(
        { error: 'Impossible de modifier un devis déjà converti' },
        { status: 400 }
      );
    }

    const updatedQuote = await Quote.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      message: 'Devis mis à jour avec succès',
      quote: updatedQuote,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du devis:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/quotes/[id] - Supprimer un devis
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

    const quote = await Quote.findById(params.id);
    
    if (!quote) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    // Ne peut supprimer un devis converti
    if (quote.status === 'converted') {
      return NextResponse.json(
        { error: 'Impossible de supprimer un devis converti' },
        { status: 400 }
      );
    }

    await Quote.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: 'Devis supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du devis:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
