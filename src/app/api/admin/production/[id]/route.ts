import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Production } from '@/models';

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

    const order = await Production.findById(id)
      .populate('order_id', 'order_number')
      .populate('product_id', 'name sku images')
      .populate('assigned_to', 'name');

    if (!order) {
      return NextResponse.json({ error: 'Ordre non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Erreur récupération ordre:', error);
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

    // Si le statut passe à "ready", enregistrer la date de complétion
    if (data.status === 'ready' || data.status === 'shipped') {
      data.actual_completion = new Date();
    }

    const order = await Production.findByIdAndUpdate(id, data, { new: true })
      .populate('order_id', 'order_number')
      .populate('product_id', 'name sku');

    if (!order) {
      return NextResponse.json({ error: 'Ordre non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Erreur modification ordre:', error);
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

    await Production.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression ordre:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
