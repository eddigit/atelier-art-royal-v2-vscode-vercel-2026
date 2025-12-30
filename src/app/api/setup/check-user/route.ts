import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    // Chercher l'utilisateur admin
    const user = await User.findOne({ email: 'gilleskorzec@gmail.com' }).select('+password');
    
    if (!user) {
      return NextResponse.json({
        found: false,
        message: 'Utilisateur gilleskorzec@gmail.com non trouvé',
        allUsers: await User.find().select('email name role is_active').lean(),
      });
    }

    return NextResponse.json({
      found: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        is_active: user.is_active,
        hasPassword: !!user.password,
        passwordLength: user.password?.length || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}
