import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CartItem from '@/models/CartItem';
import Product from '@/models/Product';

// Helper pour récupérer l'identifiant utilisateur ou session
function getIdentifier(request: NextRequest) {
  // TODO: Implémenter avec NextAuth pour les utilisateurs connectés
  const sessionId = request.cookies.get('cart_session')?.value;
  return { sessionId, userId: null };
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { sessionId, userId } = getIdentifier(request);

    if (!sessionId && !userId) {
      return NextResponse.json({ items: [], total: 0 });
    }

    const filter = userId ? { user_id: userId } : { session_id: sessionId };

    const items = await CartItem.find(filter)
      .populate('product_id', 'name slug images price stock_quantity')
      .lean();

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return NextResponse.json({
      items: items.map((item: any) => ({
        _id: item._id,
        product: item.product_id,
        quantity: item.quantity,
        price: item.price,
        customization: item.customization,
        subtotal: item.price * item.quantity,
      })),
      total,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du panier' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { productId, quantity = 1, customization } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'ID produit requis' },
        { status: 400 }
      );
    }

    // Vérifier que le produit existe et est actif
    const product = await Product.findOne({
      _id: productId,
      is_active: true,
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier le stock si pas de backorder
    if (!product.allow_backorders && product.stock_quantity < quantity) {
      return NextResponse.json(
        { error: 'Stock insuffisant' },
        { status: 400 }
      );
    }

    let { sessionId, userId } = getIdentifier(request);

    // Créer un session ID si nécessaire
    if (!sessionId && !userId) {
      sessionId = crypto.randomUUID();
    }

    const filter = userId
      ? { user_id: userId, product_id: productId }
      : { session_id: sessionId, product_id: productId };

    // Chercher si l'item existe déjà dans le panier
    const existingItem = await CartItem.findOne(filter);

    let cartItem;
    if (existingItem) {
      // Mettre à jour la quantité
      existingItem.quantity += quantity;
      existingItem.price = product.price;
      cartItem = await existingItem.save();
    } else {
      // Créer un nouvel item
      cartItem = await CartItem.create({
        ...(userId ? { user_id: userId } : { session_id: sessionId }),
        product_id: productId,
        quantity,
        price: product.price,
        customization,
      });
    }

    const response = NextResponse.json({
      message: 'Produit ajouté au panier',
      item: cartItem,
    });

    // Définir le cookie session si nouveau
    if (!request.cookies.get('cart_session')?.value && sessionId) {
      response.cookies.set('cart_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 jours
      });
    }

    return response;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout au panier' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { sessionId, userId } = getIdentifier(request);

    if (!sessionId && !userId) {
      return NextResponse.json({ message: 'Panier vide' });
    }

    const filter = userId ? { user_id: userId } : { session_id: sessionId };

    await CartItem.deleteMany(filter);

    return NextResponse.json({ message: 'Panier vidé avec succès' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du panier' },
      { status: 500 }
    );
  }
}
