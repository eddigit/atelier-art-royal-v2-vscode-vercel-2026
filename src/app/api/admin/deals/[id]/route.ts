import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Deal } from '@/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const deal = await Deal.findById(id)
      .populate('assigned_to', 'name email')
      .populate('products.product_id', 'name sku price');

    if (!deal) {
      return NextResponse.json({ error: 'Affaire non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ deal });
  } catch (error) {
    console.error('Erreur récupération affaire:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const data = await request.json();

    // Mettre à jour la probabilité selon le stage
    if (data.stage) {
      const stageProbabilities: Record<string, number> = {
        discovery: 10,
        proposal: 25,
        negotiation: 50,
        closing: 75,
        won: 100,
        lost: 0
      };
      if (!data.probability) {
        data.probability = stageProbabilities[data.stage] || data.probability;
      }
    }

    const deal = await Deal.findByIdAndUpdate(id, data, { new: true })
      .populate('assigned_to', 'name');

    if (!deal) {
      return NextResponse.json({ error: 'Affaire non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ deal });
  } catch (error) {
    console.error('Erreur modification affaire:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    await Deal.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression affaire:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
