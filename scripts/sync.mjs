/**
 * Script de synchronisation intelligente Base44 → MongoDB
 * NE CRÉE PAS DE DOUBLONS - vérifie par legacy_id ou SKU/nom
 *
 * Usage: node scripts/sync.mjs
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/artroyal';

// Schémas simplifiés
const RiteSchema = new mongoose.Schema({
  name: String,
  code: String,
  description: String,
  image_url: String,
  order: Number,
  is_active: { type: Boolean, default: true },
  legacy_id: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const ObedienceSchema = new mongoose.Schema({
  name: String,
  code: String,
  description: String,
  image_url: String,
  order: Number,
  is_active: { type: Boolean, default: true },
  legacy_id: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const DegreeOrderSchema = new mongoose.Schema({
  name: String,
  level: Number,
  loge_type: String,
  description: String,
  order: Number,
  is_active: { type: Boolean, default: true },
  legacy_id: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  image_url: String,
  order: Number,
  is_active: { type: Boolean, default: true },
  legacy_id: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const ProductSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  short_description: String,
  price: Number,
  compare_at_price: Number,
  rite_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rite' }],
  obedience_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Obedience' }],
  degree_order_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DegreeOrder' }],
  category_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  images: [String],
  video_url: String,
  stock_quantity: Number,
  low_stock_threshold: Number,
  allow_backorders: Boolean,
  sku: String,
  is_active: Boolean,
  featured: Boolean,
  sizes: [String],
  colors: [String],
  materials: [String],
  tags: [String],
  weight: Number,
  enable_reviews: Boolean,
  legacy_id: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Modèles
const Rite = mongoose.model('Rite', RiteSchema);
const Obedience = mongoose.model('Obedience', ObedienceSchema);
const DegreeOrder = mongoose.model('DegreeOrder', DegreeOrderSchema);
const Category = mongoose.model('Category', CategorySchema);
const Product = mongoose.model('Product', ProductSchema);

// Maps pour convertir les anciens IDs en nouveaux ObjectId
const idMaps = {
  rites: new Map(),
  obediences: new Map(),
  degreeOrders: new Map(),
  categories: new Map(),
};

async function syncRites(data) {
  console.log('\n📦 Synchronisation des Rites...');
  let created = 0, skipped = 0, updated = 0;

  for (const item of data) {
    // Chercher par legacy_id OU par nom exact
    let existing = await Rite.findOne({
      $or: [
        { legacy_id: item.id },
        { name: item.name }
      ]
    });

    if (existing) {
      idMaps.rites.set(item.id, existing._id);
      skipped++;
    } else {
      const doc = await Rite.create({
        name: item.name,
        code: item.code || item.name.substring(0, 4).toUpperCase(),
        description: item.description,
        image_url: item.image_url,
        order: item.order || 0,
        legacy_id: item.id,
      });
      idMaps.rites.set(item.id, doc._id);
      created++;
    }
  }
  console.log(`   ✅ Rites: ${created} créés, ${skipped} existants`);
}

async function syncObediences(data) {
  console.log('\n📦 Synchronisation des Obédiences...');
  let created = 0, skipped = 0;

  for (const item of data) {
    let existing = await Obedience.findOne({
      $or: [
        { legacy_id: item.id },
        { name: item.name }
      ]
    });

    if (existing) {
      idMaps.obediences.set(item.id, existing._id);
      skipped++;
    } else {
      const doc = await Obedience.create({
        name: item.name,
        code: item.code || item.name.substring(0, 4).toUpperCase(),
        description: item.description,
        image_url: item.image_url,
        order: item.order || 0,
        legacy_id: item.id,
      });
      idMaps.obediences.set(item.id, doc._id);
      created++;
    }
  }
  console.log(`   ✅ Obédiences: ${created} créées, ${skipped} existantes`);
}

async function syncDegreeOrders(data) {
  console.log('\n📦 Synchronisation des Degrés...');
  let created = 0, skipped = 0;

  for (const item of data) {
    let existing = await DegreeOrder.findOne({
      $or: [
        { legacy_id: item.id },
        { name: item.name }
      ]
    });

    if (existing) {
      idMaps.degreeOrders.set(item.id, existing._id);
      skipped++;
    } else {
      const doc = await DegreeOrder.create({
        name: item.name,
        level: item.level || 1,
        loge_type: item.loge_type || 'Loge Symbolique',
        description: item.description,
        order: item.order || 0,
        legacy_id: item.id,
      });
      idMaps.degreeOrders.set(item.id, doc._id);
      created++;
    }
  }
  console.log(`   ✅ Degrés: ${created} créés, ${skipped} existants`);
}

async function syncCategories(data) {
  console.log('\n📦 Synchronisation des Catégories...');
  let created = 0, skipped = 0;

  // Dédupliquer par nom (il y a des doublons dans Base44)
  const uniqueCategories = [];
  const seenNames = new Set();
  for (const item of data) {
    if (!seenNames.has(item.name)) {
      seenNames.add(item.name);
      uniqueCategories.push(item);
    }
  }

  for (const item of uniqueCategories) {
    const slug = item.slug || item.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-');

    let existing = await Category.findOne({
      $or: [
        { legacy_id: item.id },
        { name: item.name },
        { slug: slug }
      ]
    });

    if (existing) {
      // Garder trace de TOUS les legacy_id qui pointent vers cette catégorie
      idMaps.categories.set(item.id, existing._id);
      skipped++;
    } else {
      const doc = await Category.create({
        name: item.name,
        slug: slug,
        description: item.description,
        image_url: item.image_url,
        order: item.order || 0,
        legacy_id: item.id,
      });
      idMaps.categories.set(item.id, doc._id);
      created++;
    }
  }

  // Mapper aussi les IDs dupliqués vers les catégories existantes
  for (const item of data) {
    if (!idMaps.categories.has(item.id)) {
      // Trouver la catégorie par nom
      const cat = await Category.findOne({ name: item.name });
      if (cat) {
        idMaps.categories.set(item.id, cat._id);
      }
    }
  }

  console.log(`   ✅ Catégories: ${created} créées, ${skipped} existantes (dédupliqué de ${data.length})`);
}

async function syncProducts(data) {
  console.log('\n📦 Synchronisation des Produits...');
  let created = 0, skipped = 0, errors = 0;

  for (const item of data) {
    try {
      // Chercher par SKU, legacy_id, ou nom+prix exact
      let existing = await Product.findOne({
        $or: [
          { legacy_id: item.id },
          { sku: item.sku },
          { name: item.name, price: item.price }
        ]
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Convertir les IDs de relations
      const riteIds = (item.rite_ids || [])
        .map(id => idMaps.rites.get(id))
        .filter(Boolean);

      const obedienceIds = (item.obedience_ids || [])
        .map(id => idMaps.obediences.get(id))
        .filter(Boolean);

      const degreeOrderIds = (item.degree_order_ids || [])
        .map(id => idMaps.degreeOrders.get(id))
        .filter(Boolean);

      const categoryIds = (item.category_ids || [])
        .map(id => idMaps.categories.get(id))
        .filter(Boolean);

      const slug = item.slug || item.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-');

      // Assurer l'unicité du slug
      let finalSlug = slug;
      let counter = 1;
      while (await Product.findOne({ slug: finalSlug })) {
        finalSlug = `${slug}-${counter++}`;
      }

      await Product.create({
        name: item.name,
        slug: finalSlug,
        description: item.description,
        short_description: item.short_description,
        price: item.price || 0,
        compare_at_price: item.compare_at_price,
        rite_ids: riteIds,
        obedience_ids: obedienceIds,
        degree_order_ids: degreeOrderIds,
        category_ids: categoryIds,
        images: item.images || [],
        video_url: item.video_url,
        stock_quantity: item.stock_quantity || 0,
        low_stock_threshold: item.low_stock_threshold || 5,
        allow_backorders: item.allow_backorders || false,
        sku: item.sku,
        is_active: item.is_active !== false,
        featured: item.featured || false,
        sizes: item.sizes || [],
        colors: item.colors || [],
        materials: item.materials || [],
        tags: item.tags || [],
        weight: item.weight,
        enable_reviews: item.enable_reviews !== false,
        legacy_id: item.id,
      });

      created++;
    } catch (err) {
      console.error(`   ❌ Erreur produit "${item.name}":`, err.message);
      errors++;
    }
  }

  console.log(`   ✅ Produits: ${created} créés, ${skipped} existants, ${errors} erreurs`);
}

async function main() {
  console.log('🔄 Synchronisation intelligente Base44 → MongoDB');
  console.log('================================================');
  console.log('⚠️  Mode sans doublons - les éléments existants sont ignorés\n');

  // Charger le backup
  const backupPath = path.join(__dirname, '..', 'data', 'backup.json');

  if (!fs.existsSync(backupPath)) {
    console.error('❌ Fichier backup non trouvé!');
    process.exit(1);
  }

  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  console.log(`📁 Backup: ${backupData.app_name}`);
  console.log(`📅 Export: ${backupData.export_date}`);

  const data = backupData.data;

  // Connexion MongoDB
  console.log('\n🔌 Connexion à MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('   ✅ Connecté');

  // Stats avant
  const beforeStats = {
    rites: await Rite.countDocuments(),
    obediences: await Obedience.countDocuments(),
    degrees: await DegreeOrder.countDocuments(),
    categories: await Category.countDocuments(),
    products: await Product.countDocuments(),
  };
  console.log('\n📊 État actuel de la base:');
  console.log(`   Rites: ${beforeStats.rites}`);
  console.log(`   Obédiences: ${beforeStats.obediences}`);
  console.log(`   Degrés: ${beforeStats.degrees}`);
  console.log(`   Catégories: ${beforeStats.categories}`);
  console.log(`   Produits: ${beforeStats.products}`);

  // Synchroniser dans l'ordre (respecter les dépendances)
  if (data.Rite?.length) await syncRites(data.Rite);
  if (data.Obedience?.length) await syncObediences(data.Obedience);
  if (data.DegreeOrder?.length) await syncDegreeOrders(data.DegreeOrder);
  if (data.Category?.length) await syncCategories(data.Category);
  if (data.Product?.length) await syncProducts(data.Product);

  // Stats après
  const afterStats = {
    rites: await Rite.countDocuments(),
    obediences: await Obedience.countDocuments(),
    degrees: await DegreeOrder.countDocuments(),
    categories: await Category.countDocuments(),
    products: await Product.countDocuments(),
  };

  console.log('\n================================================');
  console.log('✅ SYNCHRONISATION TERMINÉE');
  console.log('================================================');
  console.log('📊 Résumé:');
  console.log(`   Rites: ${beforeStats.rites} → ${afterStats.rites} (+${afterStats.rites - beforeStats.rites})`);
  console.log(`   Obédiences: ${beforeStats.obediences} → ${afterStats.obediences} (+${afterStats.obediences - beforeStats.obediences})`);
  console.log(`   Degrés: ${beforeStats.degrees} → ${afterStats.degrees} (+${afterStats.degrees - beforeStats.degrees})`);
  console.log(`   Catégories: ${beforeStats.categories} → ${afterStats.categories} (+${afterStats.categories - beforeStats.categories})`);
  console.log(`   Produits: ${beforeStats.products} → ${afterStats.products} (+${afterStats.products - beforeStats.products})`);

  await mongoose.disconnect();
  console.log('\n🔌 Déconnecté');
}

main().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
