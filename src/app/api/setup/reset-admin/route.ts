import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { secret, newPassword } = await request.json();

    // Clé secrète pour protéger cette route
    if (secret !== 'reset-admin-pwd-2025') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const adminEmail = 'gilleskorzec@gmail.com';
    const password = '$$Reussite888!!';

    // Trouver ou créer l'utilisateur
    let user = await User.findOne({ email: adminEmail });
    
    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    if (!user) {
      // Créer le compte admin
      user = await User.create({
        email: adminEmail,
        password: hashedPassword,
        name: 'Gilles Korzec',
        role: 'admin',
        is_active: true,
      });
    } else {
      // Mettre à jour l'existant
      user.password = hashedPassword;
      user.role = 'admin';
      user.is_active = true;
      user.name = 'Gilles Korzec';
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Mot de passe admin réinitialisé',
      credentials: {
        email: adminEmail,
        password: password,
        loginUrl: '/auth/login',
        adminUrl: '/admin',
      },
    });
  } catch (error: any) {
    console.error('Erreur réinitialisation:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
