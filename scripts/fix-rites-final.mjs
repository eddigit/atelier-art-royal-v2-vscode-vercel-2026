/**
 * Script final pour corriger les rites
 * Étape par étape pour éviter les conflits
 */
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

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
}, { collection: 'rites' });

const ProductSchema = new mongoose.Schema({
  name: String,
  sku: String,
  rite_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rite' }],
}, { collection: 'products' });

const Rite = mongoose.model('Rite', RiteSchema);
const Product = mongoose.model('Product', ProductSchema);

async function fixRites() {
  console.log('🔌 Connexion à MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connecté\n');

  // 1. Afficher l'état actuel
  console.log('📋 État actuel des rites:');
  const allRites = await Rite.find({}).lean();
  for (const r of allRites) {
    const count = await Product.countDocuments({ rite_ids: r._id });
    console.log(`   ${r._id} | ${r.code?.padEnd(12)} | ${r.name?.padEnd(35)} | ${count} produits`);
  }

  // 2. Le problème: RER existe 2 fois avec des noms différents
  // - "RER" avec nom "Rite Émulation" 
  // - "RER" avec nom "Rite Écossais Rectifié"
  // On doit garder "Rite Écossais Rectifié" pour RER
  // Et créer un nouveau rite EMULATION pour "Rite d'Émulation"

  console.log('\n🔧 Correction du rite RER mal nommé...');
  
  // Trouver le RER mal nommé (celui avec "Rite Émulation")
  const wrongRER = await Rite.findOne({ code: 'RER', name: 'Rite Émulation' });
  if (wrongRER) {
    // Migrer ses produits vers le vrai RER ou vers EMULATION
    const products = await Product.find({ rite_ids: wrongRER._id });
    
    // Pour l'instant, on considère que ces produits sont Émulation
    // On va créer le rite EMULATION d'abord
    let emulationRite = await Rite.findOne({ code: 'EMULATION' });
    if (!emulationRite) {
      emulationRite = await Rite.findOne({ code: 'emulation' });
    }
    
    if (emulationRite && products.length > 0) {
      console.log(`   Migrer ${products.length} produits de "RER (Rite Émulation)" vers le rite Émulation`);
      
      for (const prod of products) {
        const riteIds = prod.rite_ids.map(id => id.toString());
        const newRiteIds = riteIds.filter(id => id !== wrongRER._id.toString());
        if (!newRiteIds.includes(emulationRite._id.toString())) {
          newRiteIds.push(emulationRite._id);
        }
        await Product.updateOne({ _id: prod._id }, { $set: { rite_ids: newRiteIds } });
      }
    }
    
    // Supprimer le mauvais RER
    await Rite.deleteOne({ _id: wrongRER._id });
    console.log('   ✅ Supprimé le RER mal nommé');
  }

  // 3. Maintenant mettre à jour le vrai RER (Rite Écossais Rectifié)
  console.log('\n🔄 Mise à jour des rites avec les données Base44...');
  
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

  for (const data of ritesData) {
    // Chercher par code (majuscule ou minuscule)
    let rite = await Rite.findOne({ 
      $or: [{ code: data.code }, { code: data.code.toLowerCase() }]
    });
    
    if (rite) {
      await Rite.updateOne(
        { _id: rite._id },
        { 
          $set: {
            name: data.name,
            code: data.code,
            slug: data.slug,
            description: data.description,
            image_url: data.image_url,
            image_filename: data.image_filename,
            alternate_names: data.alternate_names,
            order: data.order,
            is_active: true
          }
        }
      );
      console.log(`   ✅ ${data.code.padEnd(12)} mis à jour`);
    } else {
      await Rite.create({
        name: data.name,
        code: data.code,
        slug: data.slug,
        description: data.description,
        image_url: data.image_url,
        image_filename: data.image_filename,
        alternate_names: data.alternate_names,
        order: data.order,
        is_active: true
      });
      console.log(`   ✨ ${data.code.padEnd(12)} créé`);
    }
  }

  // 4. Rapport final
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                    RAPPORT FINAL DES RITES');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const finalRites = await Rite.find({}).sort({ order: 1 }).lean();
  
  for (const rite of finalRites) {
    const count = await Product.countDocuments({ rite_ids: rite._id });
    const img = rite.image_url ? '🖼️' : '❌';
    console.log(`   ${img} ${rite.code?.padEnd(12)} | ${rite.name?.padEnd(35)} | ${count} produits`);
  }

  const total = await Product.countDocuments({});
  const withRites = await Product.countDocuments({ rite_ids: { $exists: true, $ne: [] } });
  
  console.log('\n───────────────────────────────────────────────────────────────');
  console.log(`   Total rites: ${finalRites.length}`);
  console.log(`   Avec images: ${finalRites.filter(r => r.image_url).length}`);
  console.log(`   Produits: ${total} (${withRites} avec rites)`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  console.log('✅ Terminé !');
}

fixRites().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
