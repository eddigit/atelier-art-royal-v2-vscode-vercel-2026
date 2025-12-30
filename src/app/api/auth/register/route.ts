import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      name,
      full_name,
      first_name,
      last_name,
      phone,
      account_type,
      obedience_id,
      rite_id,
      degree,
      lodge_name,
      lodge_number,
      lodge_role,
      billing_address,
      shipping_address,
      lodge_address,
      default_shipping_type,
      newsletter_subscribed,
      order_notifications,
      onboarding_completed,
    } = body;

    // Validation minimale
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe sont requis' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    await connectDB();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cet email' },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Construire l'objet utilisateur
    const userData: Record<string, unknown> = {
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
      is_active: true,
    };

    // Nom
    if (first_name && last_name) {
      userData.first_name = first_name;
      userData.last_name = last_name;
      userData.name = `${first_name} ${last_name}`;
      userData.full_name = `${first_name} ${last_name}`;
    } else if (name) {
      userData.name = name;
      userData.full_name = full_name || name;
    }

    // Téléphone
    if (phone) userData.phone = phone;

    // Type de compte
    if (account_type) userData.account_type = account_type;

    // Profil maçonnique
    if (obedience_id) userData.obedience_id = obedience_id;
    if (rite_id) userData.rite_id = rite_id;
    if (degree) userData.degree = degree;
    if (lodge_name) userData.lodge_name = lodge_name;
    if (lodge_number) userData.lodge_number = lodge_number;
    if (lodge_role) userData.lodge_role = lodge_role;

    // Adresses
    if (billing_address && billing_address.street) {
      userData.billing_address = billing_address;
    }
    if (shipping_address && shipping_address.street) {
      userData.shipping_address = shipping_address;
    }
    if (lodge_address && lodge_address.street) {
      userData.lodge_address = lodge_address;
    }

    // Préférences
    if (default_shipping_type) userData.default_shipping_type = default_shipping_type;
    if (typeof newsletter_subscribed === 'boolean') userData.newsletter_subscribed = newsletter_subscribed;
    if (typeof order_notifications === 'boolean') userData.order_notifications = order_notifications;

    // Onboarding
    if (typeof onboarding_completed === 'boolean') {
      userData.onboarding_completed = onboarding_completed;
      userData.onboarding_step = onboarding_completed ? 4 : 0;
    }

    // Créer l'utilisateur
    const user = await User.create(userData);

    return NextResponse.json(
      {
        message: 'Utilisateur créé avec succès',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          account_type: user.account_type,
          onboarding_completed: user.onboarding_completed,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Erreur inscription:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
