import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PATCH /api/admin/products/[id]/stock - Ajuster le stock d'un produit
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

    const { adjustment, reason } = await request.json();

    if (typeof adjustment !== 'number') {
      return NextResponse.json(
        { error: 'L\'ajustement doit être un nombre' },
        { status: 400 }
      );
    }

    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Calculer le nouveau stock
    const newStock = Math.max(0, product.stock_quantity + adjustment);

    // Mettre à jour le stock
    product.stock_quantity = newStock;
    await product.save();

    // TODO: Créer un log d'ajustement de stock dans une collection StockHistory
    // StockHistory.create({
    //   product_id: params.id,
    //   adjustment,
    //   previous_stock: product.stock_quantity - adjustment,
    //   new_stock: newStock,
    //   reason,
    //   adjusted_by: session.user.id,
    // });

    return NextResponse.json({
      message: 'Stock mis à jour avec succès',
      product: {
        _id: product._id,
        name: product.name,
        stock_quantity: product.stock_quantity,
        low_stock_threshold: product.low_stock_threshold,
      },
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajustement du stock:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products/[id]/stock/set - Définir le stock exact d'un produit
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const { stock_quantity, reason } = await request.json();

    if (typeof stock_quantity !== 'number' || stock_quantity < 0) {
      return NextResponse.json(
        { error: 'La quantité doit être un nombre positif' },
        { status: 400 }
      );
    }

    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    const previousStock = product.stock_quantity;
    product.stock_quantity = stock_quantity;
    await product.save();

    return NextResponse.json({
      message: 'Stock défini avec succès',
      product: {
        _id: product._id,
        name: product.name,
        previous_stock: previousStock,
        stock_quantity: product.stock_quantity,
        low_stock_threshold: product.low_stock_threshold,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la définition du stock:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
