/**
 * Script pour nettoyer les rites en double et mettre à jour avec les images
 * Conserve les relations existantes avec les produits
 * Version 2 - Corrige le conflit de mise à jour
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
  name: String,
  code: String,
  slug: String,
  description: String,
  image_url: String,
  image_filename: String,
  alternate_names: [String],
  order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  created_at: Date,
  updated_at: Date
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
    name: "Rite Écossais Ancien et Accepté",
    code: "REAA",
    slug: "reaa",
    description: "Le rite le plus pratiqué dans le monde",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691cd26ea8838a859856a6b6/e91124245_GeneratedImageNovember192025-2_10AM.png",
    image_filename: "reaa.png",
    order: 1,
    alternate_names: ["REAA", "Écossais Ancien et Accepté"]
  },
  {
    name: "Rite Écossais Rectifié",
    code: "RER",
    slug: "rer",
    description: "Rite chrétien et chevaleresque",
    image_url: "https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/0fd5118c0_GeneratedImageNovember192025-8_28AM.png",
    image_filename: "rer.png",
    order: 2,
    alternate_names: ["RER", "Écossais Rectifié"]
  },
  {
    name: "Rite Français",
    code: "RF",
    slug: "rf",
    description: "Rite pratiqué principalement en France",
    image_url: "https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/3a781b700_GeneratedImageNovember192025-8_28AM1.png",
    image_filename: "rf.png",
    order: 3,
    alternate_names: ["RF", "Français", "Rite Moderne"]
  },
  {
    name: "Rite d'Émulation",
    code: "EMULATION",
    slug: "emulation",
    description: "Rite traditionnel anglais",
    image_url: "https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/7438304f9_GeneratedImageNovember192025-8_34AM.png",
    image_filename: "emulation.png",
    order: 4,
    alternate_names: ["Émulation", "Emulation", "Rite Anglais"]
  },
  {
    name: "Rite d'York",
    code: "YORK",
    slug: "york",
    description: "Rite d'York",
    image_url: "https://base44.app/api/apps/691cd26ea8838a859856a6b6/files/public/691cd26ea8838a859856a6b6/9b6f815e4_GeneratedImageNovember192025-8_37AM.png",
    image_filename: "york.png",
    order: 5,
    alternate_names: ["York", "Rite Américain"]
  }
];

async function cleanAndUpdateRites() {
  console.log('🔌 Connexion à MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connecté à MongoDB\n');

  // Récupérer tous les rites existants
  const existingRites = await Rite.find({}).lean();
  console.log(`📊 Rites existants: ${existingRites.length}`);

  console.log('\n📋 Analyse des rites actuels:');
  for (const rite of existingRites) {
    const productCount = await Product.countDocuments({ rite_ids: rite._id });
    console.log(`   ${rite.code?.padEnd(12)} | ${rite.name?.substring(0, 35).padEnd(35)} | ${productCount} produits`);
  }

  // Mapping des codes - identifier les rites principaux
  // On garde: REAA, RER (Rite Écossais Rectifié), RF, et on crée EMULATION, YORK
  const riteMapping = {
    // Code minuscule -> ID du rite principal à utiliser
  };

  // Trouver les rites principaux par code majuscule
  const mainRites = new Map();
  for (const rite of existingRites) {
    if (rite.code === rite.code?.toUpperCase() && rite.code !== 'emulation' && rite.code !== 'york') {
      mainRites.set(rite.code, rite);
    }
  }

  console.log('\n🔧 Phase 1: Migration des relations...\n');

  // Migrer les produits des doublons vers les rites principaux
  for (const rite of existingRites) {
    const codeUpper = rite.code?.toUpperCase();
    const isLowerCase = rite.code !== codeUpper;
    
    // Cas spéciaux: emulation et york sont des codes minuscules mais sans version majuscule
    if (rite.code === 'emulation' || rite.code === 'york') {
      continue; // On les traitera après
    }
    
    if (isLowerCase) {
      const mainRite = mainRites.get(codeUpper);
      if (mainRite) {
        // Trouver les produits qui ont ce rite doublon
        const products = await Product.find({ rite_ids: rite._id }).lean();
        
        for (const product of products) {
          // Récupérer les rites actuels
          const currentRites = product.rite_ids.map(id => id.toString());
          
          // Retirer le doublon et ajouter le principal si pas déjà présent
          const newRites = currentRites.filter(id => id !== rite._id.toString());
          if (!newRites.includes(mainRite._id.toString())) {
            newRites.push(mainRite._id);
          }
          
          // Mettre à jour le produit
          await Product.updateOne(
            { _id: product._id },
            { $set: { rite_ids: newRites } }
          );
        }
        
        if (products.length > 0) {
          console.log(`   ✅ Migré ${products.length} produits de "${rite.code}" vers "${mainRite.code}"`);
        }
        
        // Supprimer le doublon
        await Rite.deleteOne({ _id: rite._id });
        console.log(`   🗑️  Supprimé: "${rite.code}" (${rite.name})`);
      }
    }
  }

  console.log('\n🔧 Phase 2: Création/Mise à jour des rites principaux...\n');

  // Mettre à jour ou créer les rites avec les bonnes données
  for (const riteData of ritesData) {
    // Chercher le rite existant par code (majuscule ou minuscule)
    let existing = await Rite.findOne({ 
      $or: [
        { code: riteData.code },
        { code: riteData.code.toLowerCase() }
      ]
    });

    if (existing) {
      // Mise à jour du rite existant
      await Rite.updateOne(
        { _id: existing._id },
        {
          $set: {
            name: riteData.name,
            code: riteData.code, // Normaliser en majuscule
            slug: riteData.slug,
            description: riteData.description,
            image_url: riteData.image_url,
            image_filename: riteData.image_filename,
            alternate_names: riteData.alternate_names,
            order: riteData.order,
            is_active: true,
            updated_at: new Date()
          }
        }
      );
      console.log(`   ✅ ${riteData.code.padEnd(12)} - ${riteData.name.substring(0, 35)}... (mis à jour)`);
    } else {
      // Création d'un nouveau rite
      await Rite.create({
        name: riteData.name,
        code: riteData.code,
        slug: riteData.slug,
        description: riteData.description,
        image_url: riteData.image_url,
        image_filename: riteData.image_filename,
        alternate_names: riteData.alternate_names,
        order: riteData.order,
        is_active: true
      });
      console.log(`   ✨ ${riteData.code.padEnd(12)} - ${riteData.name.substring(0, 35)}... (créé)`);
    }
  }

  // Nettoyer les rites obsolètes (mauvais nom, sans produits)
  console.log('\n🔧 Phase 3: Nettoyage des rites obsolètes...\n');
  
  const remainingRites = await Rite.find({}).lean();
  const validCodes = ritesData.map(r => r.code);
  
  for (const rite of remainingRites) {
    // Si le code n'est pas dans notre liste de codes valides
    if (!validCodes.includes(rite.code)) {
      const productCount = await Product.countDocuments({ rite_ids: rite._id });
      
      if (productCount === 0) {
        await Rite.deleteOne({ _id: rite._id });
        console.log(`   🗑️  Supprimé rite obsolète: "${rite.code}" (${rite.name})`);
      } else {
        // Migrer vers le rite le plus proche si possible
        console.log(`   ⚠️  Rite "${rite.code}" a ${productCount} produits - vérification manuelle requise`);
      }
    }
  }

  // Statistiques finales
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                    RAPPORT FINAL DES RITES');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const finalRites = await Rite.find({}).sort({ order: 1 }).lean();
  
  for (const rite of finalRites) {
    const productCount = await Product.countDocuments({ rite_ids: rite._id });
    const hasImage = rite.image_url ? '🖼️' : '❌';
    console.log(`   ${hasImage} ${rite.code?.padEnd(12)} | ${rite.name?.substring(0, 35).padEnd(35)} | ${productCount} produits`);
  }

  const totalProducts = await Product.countDocuments({});
  const productsWithRites = await Product.countDocuments({ rite_ids: { $exists: true, $ne: [] } });
  
  console.log('\n───────────────────────────────────────────────────────────────');
  console.log(`   Total rites: ${finalRites.length}`);
  console.log(`   Rites avec images: ${finalRites.filter(r => r.image_url).length}`);
  console.log(`   Produits totaux: ${totalProducts}`);
  console.log(`   Produits avec rites: ${productsWithRites}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  console.log('✅ Nettoyage et mise à jour terminés !');
}

cleanAndUpdateRites().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
