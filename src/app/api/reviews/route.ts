import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'productId requis' }, { status: 400 });
    }

    const reviews = await Review.find({ product_id: productId })
      .populate('user_id', 'first_name last_name')
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Erreur GET reviews:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { product_id, user_id, rating, comment } = body;

    if (!product_id || !rating || !comment) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const review = new Review({
      product_id,
      user_id: user_id || null,
      rating: Math.min(5, Math.max(1, rating)),
      comment,
    });

    await review.save();

    return NextResponse.json({ review, message: 'Avis ajouté avec succès' }, { status: 201 });
  } catch (error) {
    console.error('Erreur POST review:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
