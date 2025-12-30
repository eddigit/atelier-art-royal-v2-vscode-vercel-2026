/**
 * Script pour mettre à jour les rites avec leurs images
 * Conserve les relations existantes avec les produits
 */
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI non défini');
  process.exit(1);
}

const RiteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  slug: { type: String },
  description: String,
  image_url: String,
  image_filename: String,
  alternate_names: [String],
  order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { collection: 'rites' });

const ProductSchema = new mongoose.Schema({
  name: String,
  sku: String,
  rite_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rite' }],
}, { collection: 'products' });

const Rite = mongoose.model('Rite', RiteSchema);
const Product = mongoose.model('Product', ProductSchema);

// Données des rites depuis le JSON de Base44
const ritesData = [
  {
    old_id: "691cd6e2ee47cbeebf1631ea",
    name: "Rite Écossais Ancien et Accepté",
    code: "REAA",
    slug: "reaa",
    description: "Le rite le plus pratiqué dans le monde",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691cd26ea8838a859856a6b6/e91124245_GeneratedImageNovember192025-2_10AM.png",
    image_filename: "reaa.png",
    order: 1,
    is_active: true,
    alternate_names: ["REAA", "Écossais Ancien et Accepté"]
  },
  {
    old_id: "691cd6a6430557d88b72de97",
    name: "Rite Écossais Rectifié",
    code: "RER",
    slug: "rer",
    description: "Rite chrétien et chevaleresque",
    image_url: "https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/0fd5118c0_GeneratedImageNovember192025-8_28AM.png",
    image_filename: "rer.png",
    order: 2,
    is_active: true,
    alternate_names: ["RER", "Écossais Rectifié"]
  },
  {
    old_id: "691cd6e2ee47cbeebf1631ec",
    name: "Rite Français",
    code: "RF",
    slug: "rf",
    description: "Rite pratiqué principalement en France",
    image_url: "https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/3a781b700_GeneratedImageNovember192025-8_28AM1.png",
    image_filename: "rf.png",
    order: 3,
    is_active: true,
    alternate_names: ["RF", "Français", "Rite Moderne"]
  },
  {
    old_id: "691cd6e2ee47cbeebf1631eb",
    name: "Rite d'Émulation",
    code: "EMULATION",
    slug: "emulation",
    description: "Rite traditionnel anglais",
    image_url: "https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/7438304f9_GeneratedImageNovember192025-8_34AM.png",
    image_filename: "emulation.png",
    order: 4,
    is_active: true,
    alternate_names: ["Émulation", "Emulation", "Rite Anglais"]
  },
  {
    old_id: "691cd6a6430557d88b72de9a",
    name: "Rite d'York",
    code: "YORK",
    slug: "york",
    description: "Rite d'York",
    image_url: "https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/9b6f815e4_GeneratedImageNovember192025-8_37AM.png",
    image_filename: "york.png",
    order: 5,
    is_active: true,
    alternate_names: ["York", "Rite Américain"]
  }
];

async function updateRites() {
  console.log('🔌 Connexion à MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connecté à MongoDB\n');

  // Récupérer les rites existants
  const existingRites = await Rite.find({}).lean();
  console.log(`📊 Rites existants: ${existingRites.length}`);

  // Lister les rites existants
  console.log('\n📋 Rites actuels en base:');
  for (const rite of existingRites) {
    console.log(`   - ${rite.code}: ${rite.name}`);
  }

  // Créer un mapping code -> _id pour les anciens rites
  const oldCodeToId = new Map();
  existingRites.forEach(r => {
    oldCodeToId.set(r.code, r._id);
  });

  console.log('\n🔄 Mise à jour des rites...\n');

  for (const riteData of ritesData) {
    const existingRite = existingRites.find(r => r.code === riteData.code);

    if (existingRite) {
      // Mise à jour du rite existant
      const updated = await Rite.findOneAndUpdate(
        { code: riteData.code },
        {
          $set: {
            name: riteData.name,
            slug: riteData.slug,
            description: riteData.description || '',
            image_url: riteData.image_url,
            image_filename: riteData.image_filename,
            alternate_names: riteData.alternate_names || [],
            order: riteData.order,
            is_active: riteData.is_active,
            updated_at: new Date()
          }
        },
        { new: true }
      );

      console.log(`   ✅ ${riteData.code.padEnd(12)} - ${riteData.name.substring(0, 35)}... (mis à jour)`);
    } else {
      // Création d'un nouveau rite
      const newRite = await Rite.create({
        name: riteData.name,
        code: riteData.code,
        slug: riteData.slug,
        description: riteData.description || '',
        image_url: riteData.image_url,
        image_filename: riteData.image_filename,
        alternate_names: riteData.alternate_names || [],
        order: riteData.order,
        is_active: riteData.is_active
      });

      console.log(`   ✨ ${riteData.code.padEnd(12)} - ${riteData.name.substring(0, 35)}... (créé)`);
    }
  }

  // Vérification des relations avec les produits
  console.log('\n📊 Vérification des relations avec les produits...');
  const productsWithRites = await Product.countDocuments({
    rite_ids: { $exists: true, $ne: [] }
  });
  console.log(`   Produits avec rites: ${productsWithRites}`);

  // Liste détaillée des produits par rite
  console.log('\n📋 Produits par rite:');
  for (const [code, id] of oldCodeToId) {
    const count = await Product.countDocuments({ rite_ids: id });
    if (count > 0) {
      const rite = await Rite.findById(id);
      console.log(`   ${code.padEnd(12)} - ${rite.name.substring(0, 30)}...: ${count} produits`);
    }
  }

  // Statistiques finales
  console.log('\n📊 Statistiques finales:');
  const totalRites = await Rite.countDocuments({});
  const activeRites = await Rite.countDocuments({ is_active: true });
  const ritesWithImages = await Rite.countDocuments({ 
    image_url: { $exists: true, $ne: '' } 
  });
  const ritesWithSlugs = await Rite.countDocuments({ 
    slug: { $exists: true, $ne: '' } 
  });

  console.log(`   Total rites: ${totalRites}`);
  console.log(`   Rites actifs: ${activeRites}`);
  console.log(`   Avec images: ${ritesWithImages}`);
  console.log(`   Avec slugs: ${ritesWithSlugs}`);

  await mongoose.disconnect();
  console.log('\n✅ Mise à jour terminée !');
}

updateRites().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
