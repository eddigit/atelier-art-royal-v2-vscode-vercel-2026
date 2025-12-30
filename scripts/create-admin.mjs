import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String },
  role: { type: String, enum: ['user', 'customer', 'admin'], default: 'customer' },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdminUser() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Vérifier si un admin existe déjà
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Un compte admin existe déjà:', existingAdmin.email);
      console.log('Voulez-vous en créer un autre? Modifiez l\'email ci-dessous.');
      process.exit(0);
    }

    // Données du compte admin
    const adminEmail = 'contact@artroyal.fr';
    const adminPassword = 'Admin@2025!';
    const adminName = 'Admin Art Royal';

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      console.log('📧 Utilisateur existe déjà, mise à jour du rôle...');
      
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      existingUser.role = 'admin';
      existingUser.password = hashedPassword;
      existingUser.name = adminName;
      existingUser.is_active = true;
      await existingUser.save();
      
      console.log('✅ Utilisateur mis à jour en tant qu\'admin');
    } else {
      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Créer l'utilisateur admin
      const admin = new User({
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'admin',
        is_active: true,
      });

      await admin.save();
      console.log('✅ Compte admin créé avec succès!');
    }

    console.log('\n📋 Informations de connexion:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email    : ${adminEmail}`);
    console.log(`🔑 Password : ${adminPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌐 Connectez-vous sur: http://localhost:3000/auth/login');
    console.log('📊 Puis accédez à: http://localhost:3000/admin');

    await mongoose.connection.close();
    console.log('\n✅ Terminé!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createAdminUser();
