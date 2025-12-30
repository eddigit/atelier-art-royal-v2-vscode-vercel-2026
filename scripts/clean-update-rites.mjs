/**
 * Script pour nettoyer les rites en double et mettre à jour avec les images
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
    console.log(`   ID: ${rite._id} | Code: ${rite.code?.padEnd(12) || 'N/A'.padEnd(12)} | Nom: ${rite.name?.substring(0, 30) || 'N/A'} | Produits: ${productCount}`);
  }

  // Identifier les rites canoniques (ceux en majuscules généralement)
  // et les doublons
  console.log('\n🔧 Nettoyage et consolidation des rites...\n');

  // Mapping des codes en minuscule vers le rite principal
  const canonicalRites = new Map(); // code uppercase -> document principal

  // D'abord, identifier les rites principaux (en majuscules)
  for (const rite of existingRites) {
    const codeUpper = rite.code?.toUpperCase();
    if (codeUpper && rite.code === codeUpper) {
      canonicalRites.set(codeUpper, rite);
    }
  }

  // Ensuite, migrer les relations des doublons vers les rites principaux
  for (const rite of existingRites) {
    const codeUpper = rite.code?.toUpperCase();
    
    // Si c'est un doublon (code en minuscule ou différent du principal)
    if (codeUpper && rite.code !== codeUpper) {
      const canonical = canonicalRites.get(codeUpper);
      
      if (canonical) {
        // Migrer les produits de ce rite vers le rite canonique
        const productsToMigrate = await Product.find({ rite_ids: rite._id });
        
        if (productsToMigrate.length > 0) {
          console.log(`   🔄 Migrer ${productsToMigrate.length} produits de "${rite.code}" vers "${canonical.code}"`);
          
          for (const product of productsToMigrate) {
            // Ajouter l'ID canonique et retirer l'ancien
            await Product.updateOne(
              { _id: product._id },
              {
                $addToSet: { rite_ids: canonical._id },
                $pull: { rite_ids: rite._id }
              }
            );
          }
        }
        
        // Supprimer le doublon
        await Rite.deleteOne({ _id: rite._id });
        console.log(`   🗑️  Supprimé le doublon: "${rite.code}" (${rite.name})`);
      }
    }
  }

  // Vérifier s'il y a des rites avec noms incorrects (comme RER = "Rite Émulation")
  // Supprimer ceux qui n'ont pas de produits liés
  const remainingRites = await Rite.find({}).lean();
  
  for (const rite of remainingRites) {
    const productCount = await Product.countDocuments({ rite_ids: rite._id });
    
    // Si le rite n'a pas le bon nom pour son code
    const expectedData = ritesData.find(r => r.code === rite.code);
    if (expectedData && rite.name !== expectedData.name && productCount === 0) {
      await Rite.deleteOne({ _id: rite._id });
      console.log(`   🗑️  Supprimé rite mal nommé sans produits: "${rite.code}" (${rite.name})`);
    }
  }

  // Maintenant, mettre à jour ou créer les rites avec les bonnes données
  console.log('\n🔄 Mise à jour des rites avec images...\n');

  for (const riteData of ritesData) {
    const existing = await Rite.findOne({ code: riteData.code });

    if (existing) {
      // Mise à jour du rite existant
      await Rite.updateOne(
        { code: riteData.code },
        {
          $set: {
            name: riteData.name,
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

  // Statistiques finales
  console.log('\n📊 Vérification finale...');
  
  const finalRites = await Rite.find({}).sort({ order: 1 }).lean();
  console.log(`\n   Total rites: ${finalRites.length}`);
  
  console.log('\n📋 Rites finaux avec produits:');
  for (const rite of finalRites) {
    const productCount = await Product.countDocuments({ rite_ids: rite._id });
    const hasImage = rite.image_url ? '🖼️' : '❌';
    console.log(`   ${hasImage} ${rite.code?.padEnd(12)} | ${rite.name?.substring(0, 35).padEnd(35)} | ${productCount} produits`);
  }

  const totalProducts = await Product.countDocuments({});
  const productsWithRites = await Product.countDocuments({ rite_ids: { $exists: true, $ne: [] } });
  console.log(`\n   Produits totaux: ${totalProducts}`);
  console.log(`   Produits avec rites: ${productsWithRites}`);

  await mongoose.disconnect();
  console.log('\n✅ Nettoyage et mise à jour terminés !');
}

cleanAndUpdateRites().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
