/**
 * Script de migration pour peupler les champs dénormalisés des produits
 * À exécuter une seule fois après déploiement
 * 
 * Usage: node scripts/migrate-denormalize-products.mjs
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI non définie dans .env.local');
  process.exit(1);
}

// Schémas simplifiés pour la migration
const ProductSchema = new mongoose.Schema({
  name: String,
  rite_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rite' }],
  obedience_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Obedience' }],
  degree_order_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DegreeOrder' }],
  category_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  loge_types: [String],
  rite_codes: [String],
  obedience_codes: [String],
  category_slugs: [String],
}, { collection: 'products' });

const RiteSchema = new mongoose.Schema({
  code: String,
  abbreviation: String,
}, { collection: 'rites' });

const ObedienceSchema = new mongoose.Schema({
  code: String,
  abbreviation: String,
}, { collection: 'obediences' });

const DegreeOrderSchema = new mongoose.Schema({
  loge_type: String,
}, { collection: 'degreeorders' });

const CategorySchema = new mongoose.Schema({
  slug: String,
}, { collection: 'categories' });

async function migrateProducts() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const Product = mongoose.model('Product', ProductSchema);
    const Rite = mongoose.model('Rite', RiteSchema);
    const Obedience = mongoose.model('Obedience', ObedienceSchema);
    const DegreeOrder = mongoose.model('DegreeOrder', DegreeOrderSchema);
    const Category = mongoose.model('Category', CategorySchema);

    // Charger toutes les entités en mémoire pour performance
    console.log('📥 Chargement des entités de référence...');
    const [rites, obediences, degrees, categories] = await Promise.all([
      Rite.find({}).lean(),
      Obedience.find({}).lean(),
      DegreeOrder.find({}).lean(),
      Category.find({}).lean(),
    ]);

    // Créer des maps pour lookup rapide
    const riteMap = new Map(rites.map(r => [r._id.toString(), r]));
    const obedienceMap = new Map(obediences.map(o => [o._id.toString(), o]));
    const degreeMap = new Map(degrees.map(d => [d._id.toString(), d]));
    const categoryMap = new Map(categories.map(c => [c._id.toString(), c]));

    console.log(`  - ${rites.length} rites`);
    console.log(`  - ${obediences.length} obédiences`);
    console.log(`  - ${degrees.length} degrés`);
    console.log(`  - ${categories.length} catégories\n`);

    // Traiter les produits par lots
    const batchSize = 100;
    const totalProducts = await Product.countDocuments({});
    console.log(`🔧 Migration de ${totalProducts} produits...\n`);

    let processed = 0;
    let updated = 0;
    let errors = 0;

    for (let skip = 0; skip < totalProducts; skip += batchSize) {
      const products = await Product.find({})
        .skip(skip)
        .limit(batchSize)
        .lean();

      const bulkOps = [];

      for (const product of products) {
        try {
          // Extraire les loge_types depuis degree_order_ids
          const logeTypes = new Set();
          if (product.degree_order_ids && Array.isArray(product.degree_order_ids)) {
            for (const degreeId of product.degree_order_ids) {
              const degree = degreeMap.get(degreeId.toString());
              if (degree && degree.loge_type) {
                logeTypes.add(degree.loge_type);
              }
            }
          }

          // Extraire les rite_codes
          const riteCodes = new Set();
          if (product.rite_ids && Array.isArray(product.rite_ids)) {
            for (const riteId of product.rite_ids) {
              const rite = riteMap.get(riteId.toString());
              if (rite) {
                if (rite.code) riteCodes.add(rite.code);
                if (rite.abbreviation) riteCodes.add(rite.abbreviation);
              }
            }
          }

          // Extraire les obedience_codes
          const obedienceCodes = new Set();
          if (product.obedience_ids && Array.isArray(product.obedience_ids)) {
            for (const obedienceId of product.obedience_ids) {
              const obedience = obedienceMap.get(obedienceId.toString());
              if (obedience) {
                if (obedience.code) obedienceCodes.add(obedience.code);
                if (obedience.abbreviation) obedienceCodes.add(obedience.abbreviation);
              }
            }
          }

          // Extraire les category_slugs
          const categorySlugs = new Set();
          if (product.category_ids && Array.isArray(product.category_ids)) {
            for (const categoryId of product.category_ids) {
              const category = categoryMap.get(categoryId.toString());
              if (category && category.slug) {
                categorySlugs.add(category.slug);
              }
            }
          }

          // Ajouter l'opération de mise à jour au bulk
          bulkOps.push({
            updateOne: {
              filter: { _id: product._id },
              update: {
                $set: {
                  loge_types: Array.from(logeTypes),
                  rite_codes: Array.from(riteCodes),
                  obedience_codes: Array.from(obedienceCodes),
                  category_slugs: Array.from(categorySlugs),
                }
              }
            }
          });

        } catch (err) {
          console.error(`❌ Erreur produit ${product._id}:`, err.message);
          errors++;
        }
      }

      // Exécuter le bulk update
      if (bulkOps.length > 0) {
        const result = await Product.bulkWrite(bulkOps, { ordered: false });
        updated += result.modifiedCount;
      }

      processed += products.length;
      
      // Afficher la progression
      const progress = Math.round((processed / totalProducts) * 100);
      process.stdout.write(`\r⏳ Progression: ${processed}/${totalProducts} (${progress}%) - ${updated} mis à jour - ${errors} erreurs`);
    }

    console.log('\n\n✅ Migration terminée !');
    console.log(`  - Produits traités: ${processed}`);
    console.log(`  - Produits mis à jour: ${updated}`);
    console.log(`  - Erreurs: ${errors}`);

    // Vérification post-migration
    console.log('\n🔍 Vérification post-migration...');
    const withLogeTypes = await Product.countDocuments({ loge_types: { $exists: true, $ne: [] } });
    const withRiteCodes = await Product.countDocuments({ rite_codes: { $exists: true, $ne: [] } });
    const withObedienceCodes = await Product.countDocuments({ obedience_codes: { $exists: true, $ne: [] } });
    const withCategorySlugs = await Product.countDocuments({ category_slugs: { $exists: true, $ne: [] } });

    console.log(`  - Produits avec loge_types: ${withLogeTypes}`);
    console.log(`  - Produits avec rite_codes: ${withRiteCodes}`);
    console.log(`  - Produits avec obedience_codes: ${withObedienceCodes}`);
    console.log(`  - Produits avec category_slugs: ${withCategorySlugs}`);

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion MongoDB fermée');
  }
}

// Exécuter la migration
console.log('🚀 Démarrage de la migration des champs dénormalisés...\n');
migrateProducts().then(() => {
  console.log('\n✨ Migration terminée avec succès !');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Erreur fatale:', error);
  process.exit(1);
});
