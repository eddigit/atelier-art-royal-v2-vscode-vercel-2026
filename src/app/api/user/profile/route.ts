import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET: Récupérer le profil de l'utilisateur connecté
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    await connectDB();
    
    const user = await User.findOne({ email: session.user.email })
      .populate('obedience_id', 'name logo')
      .populate('rite_id', 'name image_url')
      .select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Erreur GET profil:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT: Mettre à jour le profil
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const body = await req.json();
    
    await connectDB();
    
    // Champs autorisés à modifier
    const allowedFields = [
      'first_name',
      'last_name',
      'name',
      'full_name',
      'phone',
      'account_type',
      'lodge_name',
      'lodge_number',
      'lodge_role',
      'lodge_address',
      'obedience_id',
      'rite_id',
      'degree',
      'billing_address',
      'shipping_address',
      'default_shipping_type',
      'newsletter_subscribed',
      'order_notifications',
      'promo_notifications',
      'onboarding_completed',
      'onboarding_step',
    ];
    
    const updates: Record<string, unknown> = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }
    
    // Mettre à jour le nom complet si prénom/nom fournis
    if (updates.first_name && updates.last_name) {
      updates.name = `${updates.first_name} ${updates.last_name}`;
      updates.full_name = `${updates.first_name} ${updates.last_name}`;
    }
    
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updates },
      { new: true }
    )
      .populate('obedience_id', 'name logo')
      .populate('rite_id', 'name image_url')
      .select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'Profil mis à jour',
      user 
    });
  } catch (error) {
    console.error('Erreur PUT profil:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
