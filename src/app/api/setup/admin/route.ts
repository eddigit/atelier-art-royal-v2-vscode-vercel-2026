import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();

    // Clé secrète pour protéger cette route
    if (secret !== 'create-admin-2025') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Données du compte admin
    const adminEmail = 'contact@artroyal.fr';
    const adminPassword = 'Admin@2025!';
    const adminName = 'Admin Art Royal';

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: adminEmail });
    
    if (existingUser) {
      // Mettre à jour en admin si existe déjà
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      existingUser.role = 'admin';
      existingUser.password = hashedPassword;
      existingUser.name = adminName;
      existingUser.is_active = true;
      await existingUser.save();
      
      return NextResponse.json({
        success: true,
        message: 'Utilisateur existant mis à jour en admin',
        credentials: {
          email: adminEmail,
          password: adminPassword,
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
          adminUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin`,
        },
      });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Créer l'utilisateur admin
    const admin = await User.create({
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: 'admin',
      is_active: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Compte admin créé avec succès',
      credentials: {
        email: adminEmail,
        password: adminPassword,
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
        adminUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin`,
      },
    });
  } catch (error: any) {
    console.error('Erreur création admin:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du compte admin' },
      { status: 500 }
    );
  }
}
