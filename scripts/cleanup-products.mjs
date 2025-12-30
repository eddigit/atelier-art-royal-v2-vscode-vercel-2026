/**
 * Script pour nettoyer les relations des produits et supprimer le produit de test
 */
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI non défini');
  process.exit(1);
}

// Schémas simplifiés
const ProductSchema = new mongoose.Schema({
  name: String,
  sku: String,
  rite_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rite' }],
  obedience_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Obedience' }],
  degree_order_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DegreeOrder' }],
  category_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
}, { collection: 'products' });

const RiteSchema = new mongoose.Schema({ name: String, code: String }, { collection: 'rites' });
const ObedienceSchema = new mongoose.Schema({ name: String, code: String }, { collection: 'obediences' });
const DegreeOrderSchema = new mongoose.Schema({ name: String, loge_type: String }, { collection: 'degreeorders' });
const CategorySchema = new mongoose.Schema({ name: String, slug: String }, { collection: 'categories' });

const Product = mongoose.model('Product', ProductSchema);
const Rite = mongoose.model('Rite', RiteSchema);
const Obedience = mongoose.model('Obedience', ObedienceSchema);
const DegreeOrder = mongoose.model('DegreeOrder', DegreeOrderSchema);
const Category = mongoose.model('Category', CategorySchema);

async function cleanupProducts() {
  console.log('🔌 Connexion à MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connecté à MongoDB');

  // Récupérer les références
  const rites = await Rite.find({}).lean();
  const obediences = await Obedience.find({}).lean();
  const degrees = await DegreeOrder.find({}).lean();
  const categories = await Category.find({}).lean();

  console.log('\n📊 Références disponibles:');
  console.log(`   Rites: ${rites.length}`);
  console.log(`   Obédiences: ${obediences.length}`);
  console.log(`   Degrés: ${degrees.length}`);
  console.log(`   Catégories: ${categories.length}`);

  // Maps pour recherche rapide
  const riteByCode = new Map();
  const riteByName = new Map();
  rites.forEach(r => {
    riteByCode.set(r.code?.toUpperCase(), r._id);
    riteByName.set(r.name?.toLowerCase(), r._id);
  });

  const categoryBySlug = new Map();
  const categoryByName = new Map();
  categories.forEach(c => {
    categoryBySlug.set(c.slug?.toLowerCase(), c._id);
    categoryByName.set(c.name?.toLowerCase(), c._id);
  });

  const degreeByName = new Map();
  degrees.forEach(d => {
    degreeByName.set(d.name?.toLowerCase(), d._id);
  });

  // 1. Supprimer le produit de test
  console.log('\n🗑️  Suppression du produit de test...');
  const testProduct = await Product.findOneAndDelete({ name: 'Tablier Maçonnique Standard Test' });
  if (testProduct) {
    console.log('   ✅ Produit de test supprimé');
  } else {
    console.log('   ⚠️ Produit de test non trouvé');
  }

  // 2. Nettoyer les produits avec relations manquantes
  console.log('\n🔧 Nettoyage des relations manquantes...');

  // Produit #4 - Tablier Maître RF SKU: RF-TM-300-PE - manque degrés et catégories
  await updateProduct('RF-TM-300-PE', {
    degree: 'Maître',
    category: 'Tabliers'
  }, degreeByName, categoryBySlug);

  // Produit #21 - Tablier 4ème Ordre Diffusion SKU: RFM-4-ORD-409-DIFF-PE - manque rites et degrés
  await updateProduct('RFM-4-ORD-409-DIFF-PE', {
    rite: 'RF',
    degree: '4ème Ordre',
    category: 'Tabliers'
  }, degreeByName, categoryBySlug, riteByCode);

  // Produit #23 - Cordon 3° Ordre SKU: RFM-3-ORD-375-DIFF - manque rites, degrés, catégories
  await updateProduct('RFM-3-ORD-375-DIFF', {
    rite: 'RF',
    degree: '3ème Ordre',
    category: 'Cordons'
  }, degreeByName, categoryBySlug, riteByCode);

  // Produit #31 - Tapis Très Sage SKU: RFM-1-ORD-TAPIS - manque catégorie
  // Créer une catégorie "Décors de Loge" ou assigner à une existante
  const tapisProduct = await Product.findOne({ sku: 'RFM-1-ORD-TAPIS' });
  if (tapisProduct) {
    // Chercher ou créer une catégorie appropriée
    let decoCategory = await Category.findOne({ slug: 'decors-de-loge' });
    if (!decoCategory) {
      decoCategory = await Category.findOne({ slug: 'accessoires' });
    }
    if (decoCategory) {
      await Product.updateOne(
        { sku: 'RFM-1-ORD-TAPIS' },
        { $addToSet: { category_ids: decoCategory._id } }
      );
      console.log('   ✅ Tapis: catégorie ajoutée');
    } else {
      console.log('   ⚠️ Tapis: aucune catégorie appropriée trouvée');
    }
  }

  // Produit #49 - Bandeau SKU: BANDEAU - manque tout
  // C'est un accessoire universel, on peut lui assigner une catégorie "Accessoires"
  const bandeauProduct = await Product.findOne({ sku: 'BANDEAU' });
  if (bandeauProduct) {
    let accessCategory = await Category.findOne({ slug: 'accessoires' });
    if (!accessCategory) {
      // Créer la catégorie Accessoires
      accessCategory = await Category.create({
        name: 'Accessoires',
        slug: 'accessoires',
        description: 'Accessoires maçonniques divers',
        is_active: true
      });
      console.log('   ✅ Catégorie "Accessoires" créée');
    }
    
    await Product.updateOne(
      { sku: 'BANDEAU' },
      { $addToSet: { category_ids: accessCategory._id } }
    );
    console.log('   ✅ Bandeau: catégorie Accessoires ajoutée');
  }

  // Vérification finale
  console.log('\n📊 Vérification finale...');
  const productsWithMissingCat = await Product.countDocuments({ 
    $or: [
      { category_ids: { $exists: false } },
      { category_ids: { $size: 0 } }
    ]
  });
  console.log(`   Produits sans catégorie: ${productsWithMissingCat}`);

  const totalProducts = await Product.countDocuments({});
  console.log(`   Total produits: ${totalProducts}`);

  await mongoose.disconnect();
  console.log('\n✅ Nettoyage terminé !');
}

async function updateProduct(sku, updates, degreeByName, categoryBySlug, riteByCode = null) {
  const product = await Product.findOne({ sku });
  if (!product) {
    console.log(`   ⚠️ Produit ${sku} non trouvé`);
    return;
  }

  const updateObj = {};

  if (updates.degree) {
    const degreeId = degreeByName.get(updates.degree.toLowerCase());
    if (degreeId) {
      updateObj.$addToSet = updateObj.$addToSet || {};
      updateObj.$addToSet.degree_order_ids = degreeId;
    }
  }

  if (updates.category) {
    const categoryId = categoryBySlug.get(updates.category.toLowerCase());
    if (categoryId) {
      updateObj.$addToSet = updateObj.$addToSet || {};
      updateObj.$addToSet.category_ids = categoryId;
    }
  }

  if (updates.rite && riteByCode) {
    const riteId = riteByCode.get(updates.rite.toUpperCase());
    if (riteId) {
      updateObj.$addToSet = updateObj.$addToSet || {};
      updateObj.$addToSet.rite_ids = riteId;
    }
  }

  if (Object.keys(updateObj).length > 0) {
    await Product.updateOne({ sku }, updateObj);
    console.log(`   ✅ ${sku}: relations mises à jour`);
  } else {
    console.log(`   ⚠️ ${sku}: aucune mise à jour trouvée`);
  }
}

cleanupProducts().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
