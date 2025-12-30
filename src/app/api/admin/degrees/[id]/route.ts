import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { DegreeOrder } from '@/models';

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

    const degree = await DegreeOrder.findByIdAndUpdate(id, data, { new: true });
    
    if (!degree) {
      return NextResponse.json({ error: 'Degré non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ degree });
  } catch (error) {
    console.error('Erreur modification degré:', error);
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

    await DegreeOrder.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression degré:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
