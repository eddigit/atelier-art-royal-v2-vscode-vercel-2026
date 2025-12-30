/**
 * Script de migration des données Base44 vers MongoDB
 * 
 * Usage:
 *   1. Placer le fichier backup JSON dans ./data/backup.json
 *   2. Configurer MONGODB_URI dans .env.local
 *   3. Exécuter: node scripts/seed.js
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/artroyal';

// Schémas simplifiés pour le script
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

const OrderSchema = new mongoose.Schema({
  order_number: String,
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customer_email: String,
  customer_name: String,
  status: String,
  items: [{
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    product_name: String,
    quantity: Number,
    price: Number,
    total: Number,
  }],
  subtotal: Number,
  shipping_cost: Number,
  total: Number,
  shipping_address: {
    full_name: String,
    street: String,
    city: String,
    postal_code: String,
    country: String,
    phone: String,
  },
  billing_address: {
    full_name: String,
    street: String,
    city: String,
    postal_code: String,
    country: String,
    phone: String,
  },
  payment_status: String,
  payment_method: String,
  tracking_number: String,
  sales_channel: String,
  legacy_id: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const UserSchema = new mongoose.Schema({
  email: String,
  full_name: String,
  phone: String,
  role: { type: String, default: 'user' },
  loyalty_points: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  legacy_id: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Modèles
const Rite = mongoose.model('Rite', RiteSchema);
const Obedience = mongoose.model('Obedience', ObedienceSchema);
const DegreeOrder = mongoose.model('DegreeOrder', DegreeOrderSchema);
const Category = mongoose.model('Category', CategorySchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);
const User = mongoose.model('User', UserSchema);

// Maps pour convertir les anciens IDs en nouveaux ObjectId
const idMaps = {
  rites: new Map(),
  obediences: new Map(),
  degreeOrders: new Map(),
  categories: new Map(),
  products: new Map(),
  users: new Map(),
};

async function migrateRites(data) {
  console.log('\\n📦 Migration des Rites...');
  for (const item of data) {
    const doc = await Rite.create({
      name: item.name,
      code: item.code || item.name.substring(0, 4).toUpperCase(),
      description: item.description,
      image_url: item.image_url,
      order: item.order || 0,
      legacy_id: item.id,
    });
    idMaps.rites.set(item.id, doc._id);
  }
  console.log(`   ✅ ${data.length} rites importés`);
}

async function migrateObediences(data) {
  console.log('\\n📦 Migration des Obédiences...');
  for (const item of data) {
    const doc = await Obedience.create({
      name: item.name,
      code: item.code || item.name.substring(0, 4).toUpperCase(),
      description: item.description,
      image_url: item.image_url,
      order: item.order || 0,
      legacy_id: item.id,
    });
    idMaps.obediences.set(item.id, doc._id);
  }
  console.log(`   ✅ ${data.length} obédiences importées`);
}

async function migrateDegreeOrders(data) {
  console.log('\\n📦 Migration des Degrés...');
  for (const item of data) {
    const doc = await DegreeOrder.create({
      name: item.name,
      level: item.level || 1,
      loge_type: item.loge_type || 'Loge Symbolique',
      description: item.description,
      order: item.order || 0,
      legacy_id: item.id,
    });
    idMaps.degreeOrders.set(item.id, doc._id);
  }
  console.log(`   ✅ ${data.length} degrés importés`);
}

async function migrateCategories(data) {
  console.log('\\n📦 Migration des Catégories...');
  for (const item of data) {
    const slug = item.slug || item.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-');
    
    const doc = await Category.create({
      name: item.name,
      slug: slug,
      description: item.description,
      image_url: item.image_url,
      order: item.order || 0,
      legacy_id: item.id,
    });
    idMaps.categories.set(item.id, doc._id);
  }
  console.log(`   ✅ ${data.length} catégories importées`);
}

async function migrateUsers(data) {
  console.log('\\n📦 Migration des Utilisateurs...');
  for (const item of data) {
    const doc = await User.create({
      email: item.email,
      full_name: item.full_name,
      phone: item.phone,
      role: item.role || 'user',
      legacy_id: item.id,
    });
    idMaps.users.set(item.id, doc._id);
  }
  console.log(`   ✅ ${data.length} utilisateurs importés`);
}

async function migrateProducts(data) {
  console.log('\\n📦 Migration des Produits...');
  let success = 0;
  let errors = 0;
  
  for (const item of data) {
    try {
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
      
      const doc = await Product.create({
        name: item.name,
        slug: slug,
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
      
      idMaps.products.set(item.id, doc._id);
      success++;
    } catch (err) {
      console.error(`   ❌ Erreur produit "${item.name}":`, err.message);
      errors++;
    }
  }
  
  console.log(`   ✅ ${success} produits importés, ${errors} erreurs`);
}

async function migrateOrders(data) {
  console.log('\\n📦 Migration des Commandes...');
  let success = 0;
  let errors = 0;
  
  for (const item of data) {
    try {
      // Convertir les items de commande
      const items = (item.items || []).map(orderItem => ({
        product_id: idMaps.products.get(orderItem.product_id),
        product_name: orderItem.product_name,
        quantity: orderItem.quantity,
        price: orderItem.price,
        total: orderItem.total,
      }));
      
      await Order.create({
        order_number: item.order_number,
        customer_id: idMaps.users.get(item.customer_id),
        customer_email: item.customer_email || item.shipping_address?.email || 'unknown@example.com',
        customer_name: item.customer_name || item.shipping_address?.full_name || 'Client',
        status: item.status || 'pending',
        items: items,
        subtotal: item.subtotal || 0,
        shipping_cost: item.shipping_cost || 0,
        total: item.total || 0,
        shipping_address: {
          full_name: item.shipping_address?.full_name || '',
          street: item.shipping_address?.street || item.shipping_address?.address || '',
          city: item.shipping_address?.city || '',
          postal_code: item.shipping_address?.postal_code || '',
          country: item.shipping_address?.country || 'France',
          phone: item.shipping_address?.phone || '',
        },
        billing_address: {
          full_name: item.billing_address?.full_name || item.shipping_address?.full_name || '',
          street: item.billing_address?.street || item.billing_address?.address || item.shipping_address?.street || '',
          city: item.billing_address?.city || item.shipping_address?.city || '',
          postal_code: item.billing_address?.postal_code || item.shipping_address?.postal_code || '',
          country: item.billing_address?.country || 'France',
          phone: item.billing_address?.phone || '',
        },
        payment_status: item.payment_status || 'pending',
        payment_method: item.payment_method || 'card',
        tracking_number: item.tracking_number,
        sales_channel: item.sales_channel || 'website',
        legacy_id: item.id,
      });
      
      success++;
    } catch (err) {
      console.error(`   ❌ Erreur commande "${item.order_number}":`, err.message);
      errors++;
    }
  }
  
  console.log(`   ✅ ${success} commandes importées, ${errors} erreurs`);
}

async function main() {
  console.log('🚀 Démarrage de la migration Base44 → MongoDB');
  console.log('================================================\\n');
  
  // Charger le backup
  const backupPath = path.join(__dirname, '..', 'data', 'backup.json');
  
  if (!fs.existsSync(backupPath)) {
    console.error('❌ Fichier backup non trouvé!');
    console.log('   Placez votre fichier atelier-art-royal-backup-*.json dans ./data/backup.json');
    process.exit(1);
  }
  
  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  console.log(`📁 Backup chargé: ${backupData.app_name}`);
  console.log(`📅 Date export: ${backupData.export_date}`);
  
  const data = backupData.data;
  
  // Connexion MongoDB
  console.log('\\n🔌 Connexion à MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('   ✅ Connecté à MongoDB');
  
  // Nettoyer les collections existantes (optionnel - décommenter si besoin)
  console.log('\\n🧹 Nettoyage des collections existantes...');
  await Promise.all([
    Rite.deleteMany({}),
    Obedience.deleteMany({}),
    DegreeOrder.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    User.deleteMany({}),
  ]);
  console.log('   ✅ Collections nettoyées');
  
  // Migrer dans l'ordre (respecter les dépendances)
  if (data.Rite?.length) await migrateRites(data.Rite);
  if (data.Obedience?.length) await migrateObediences(data.Obedience);
  if (data.DegreeOrder?.length) await migrateDegreeOrders(data.DegreeOrder);
  if (data.Category?.length) await migrateCategories(data.Category);
  if (data.User?.length) await migrateUsers(data.User);
  if (data.Product?.length) await migrateProducts(data.Product);
  if (data.Order?.length) await migrateOrders(data.Order);
  
  // Résumé
  console.log('\\n================================================');
  console.log('✅ MIGRATION TERMINÉE');
  console.log('================================================');
  console.log(`   Rites: ${idMaps.rites.size}`);
  console.log(`   Obédiences: ${idMaps.obediences.size}`);
  console.log(`   Degrés: ${idMaps.degreeOrders.size}`);
  console.log(`   Catégories: ${idMaps.categories.size}`);
  console.log(`   Utilisateurs: ${idMaps.users.size}`);
  console.log(`   Produits: ${idMaps.products.size}`);
  
  await mongoose.disconnect();
  console.log('\\n🔌 Déconnecté de MongoDB');
}

main().catch(err => {
  console.error('❌ Erreur fatale:', err);
  process.exit(1);
});
