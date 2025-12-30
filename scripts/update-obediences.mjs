/**
 * Script pour mettre à jour les obédiences avec leurs images
 * Conserve les relations existantes avec les produits
 */
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI non défini');
  process.exit(1);
}

const ObedienceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  image_url: String,
  image_filename: String,
  order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { collection: 'obediences' });

const ProductSchema = new mongoose.Schema({
  name: String,
  sku: String,
  obedience_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Obedience' }],
}, { collection: 'products' });

const Obedience = mongoose.model('Obedience', ObedienceSchema);
const Product = mongoose.model('Product', ProductSchema);

// Données des obédiences depuis le JSON
const obediencesData = [
  {
    old_id: "693c182e4d91410defbf8b3c",
    name: "La Grande Loge Nationale Française",
    code: "GLNF",
    slug: "glnf",
    description: "",
    image_url: "https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/674636889_glnf.png",
    image_filename: "glnf.png",
    order: 2,
    is_active: true
  },
  {
    old_id: "69411003aabf9eb3a78a54a5",
    name: "La Grande Loge de France",
    code: "GLDF",
    slug: "gldf",
    description: "",
    image_url: "https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/1680a4139_GLDF.png",
    image_filename: "gldf.png",
    order: 1,
    is_active: true
  },
  {
    old_id: "6941104e8dd52fe72f5a5847",
    name: "Le Grand Orient de France",
    code: "GODF",
    slug: "godf",
    description: "",
    image_url: "https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/d537d8159_godf.png",
    image_filename: "godf.png",
    order: 3,
    is_active: true
  },
  {
    old_id: "6941112a1891b79b79deb960",
    name: "Le Droit Humain",
    code: "DH",
    slug: "droit-humain",
    description: "",
    image_url: "https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/e25184669_dh.jpg",
    image_filename: "dh.jpg",
    order: 4,
    is_active: true
  },
  {
    old_id: "6941115a6f3b78bfa306130d",
    name: "La Grande Loge Féminine de France",
    code: "GLFF",
    slug: "glff",
    description: "",
    image_url: "https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/efbce523c_glff.png",
    image_filename: "glff.png",
    order: 5,
    is_active: true
  },
  {
    old_id: "69411222cb46091e0847c961",
    name: "La Grande Loge de l'Alliance Maçonnique Française",
    code: "GL-AMF",
    slug: "gl-amf",
    description: "",
    image_url: "https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/ef6dc945a_glamf.jpg",
    image_filename: "glamf.jpg",
    order: 6,
    is_active: true
  },
  {
    old_id: "6941124dbfa1d55c8f0d4f89",
    name: "La Grande Loge Mixte de France",
    code: "GLMF",
    slug: "glmf",
    description: "",
    image_url: "https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/80090effb_glmf.jpg",
    image_filename: "glmf.jpg",
    order: 7,
    is_active: true
  }
];

async function updateObediences() {
  console.log('🔌 Connexion à MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connecté à MongoDB\n');

  // Récupérer les obédiences existantes
  const existingObediences = await Obedience.find({}).lean();
  console.log(`📊 Obédiences existantes: ${existingObediences.length}`);

  // Créer un mapping code -> _id pour les anciennes obédiences
  const oldCodeToId = new Map();
  existingObediences.forEach(o => {
    oldCodeToId.set(o.code, o._id);
  });

  // Mapping ancien ID -> nouvel ID (pour la mise à jour des produits si nécessaire)
  const idMapping = new Map();

  console.log('\n🔄 Mise à jour des obédiences...\n');

  for (const obData of obediencesData) {
    const existingOb = existingObediences.find(o => o.code === obData.code);

    if (existingOb) {
      // Mise à jour de l'obédience existante
      const updated = await Obedience.findOneAndUpdate(
        { code: obData.code },
        {
          $set: {
            name: obData.name,
            slug: obData.slug,
            description: obData.description || '',
            image_url: obData.image_url,
            image_filename: obData.image_filename,
            order: obData.order,
            is_active: obData.is_active,
            updated_at: new Date()
          }
        },
        { new: true }
      );

      idMapping.set(obData.old_id, updated._id);
      console.log(`   ✅ ${obData.code.padEnd(8)} - ${obData.name.substring(0, 40)}... (mis à jour)`);
    } else {
      // Création d'une nouvelle obédience
      const newOb = await Obedience.create({
        name: obData.name,
        code: obData.code,
        slug: obData.slug,
        description: obData.description || '',
        image_url: obData.image_url,
        image_filename: obData.image_filename,
        order: obData.order,
        is_active: obData.is_active
      });

      idMapping.set(obData.old_id, newOb._id);
      console.log(`   ✨ ${obData.code.padEnd(8)} - ${obData.name.substring(0, 40)}... (créée)`);
    }
  }

  // Vérification des relations avec les produits
  console.log('\n📊 Vérification des relations avec les produits...');
  const productsWithObediences = await Product.countDocuments({
    obedience_ids: { $exists: true, $ne: [] }
  });
  console.log(`   Produits avec obédiences: ${productsWithObediences}`);

  // Liste détaillée des produits par obédience
  console.log('\n📋 Produits par obédience:');
  for (const [code, id] of oldCodeToId) {
    const count = await Product.countDocuments({ obedience_ids: id });
    if (count > 0) {
      const obedience = await Obedience.findById(id);
      console.log(`   ${code.padEnd(8)} - ${obedience.name.substring(0, 35)}...: ${count} produits`);
    }
  }

  // Statistiques finales
  console.log('\n📊 Statistiques finales:');
  const totalObediences = await Obedience.countDocuments({});
  const activeObediences = await Obedience.countDocuments({ is_active: true });
  const obediencesWithImages = await Obedience.countDocuments({ 
    image_url: { $exists: true, $ne: '' } 
  });

  console.log(`   Total obédiences: ${totalObediences}`);
  console.log(`   Obédiences actives: ${activeObediences}`);
  console.log(`   Obédiences avec images: ${obediencesWithImages}`);

  await mongoose.disconnect();
  console.log('\n✅ Mise à jour terminée !');
}

updateObediences().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
