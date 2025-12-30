import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/products/[id] - Détails d'un produit
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

    const product = await Product.findById(params.id)
      .populate('category_ids', 'name')
      .populate('rite_ids', 'name')
      .populate('obedience_ids', 'name')
      .populate('degree_order_ids', 'name')
      .lean();

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/products/[id] - Mettre à jour un produit
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

    // Vérifier si le produit existe
    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier l'unicité du slug si changé
    if (data.slug && data.slug !== product.slug) {
      const existingProduct = await Product.findOne({ slug: data.slug });
      if (existingProduct) {
        return NextResponse.json(
          { error: 'Ce slug est déjà utilisé' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le produit
    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      message: 'Produit mis à jour avec succès',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id] - Mettre à jour un produit (alias de PATCH)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PATCH(request, { params });
}

// DELETE /api/admin/products/[id] - Supprimer un produit (soft delete)
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

    // Soft delete: désactiver le produit
    const product = await Product.findByIdAndUpdate(
      params.id,
      { is_active: false },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Produit désactivé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
