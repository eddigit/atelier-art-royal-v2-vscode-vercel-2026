import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Category } from '@/models';

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

    // Régénérer le slug si le nom change
    if (data.name) {
      data.slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const category = await Category.findByIdAndUpdate(id, data, { new: true });
    
    if (!category) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Erreur modification catégorie:', error);
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

    // Vérifier s'il y a des sous-catégories
    const hasChildren = await Category.exists({ parent_id: id });
    if (hasChildren) {
      return NextResponse.json({ error: 'Impossible de supprimer : sous-catégories existantes' }, { status: 400 });
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression catégorie:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
