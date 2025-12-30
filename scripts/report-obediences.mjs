/**
 * Script pour générer un rapport détaillé des obédiences
 */
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

const ObedienceSchema = new mongoose.Schema({
  name: String,
  code: String,
  slug: String,
  description: String,
  image_url: String,
  image_filename: String,
  order: Number,
  is_active: Boolean,
  created_at: Date,
  updated_at: Date
}, { collection: 'obediences' });

const ProductSchema = new mongoose.Schema({
  name: String,
  sku: String,
  obedience_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Obedience' }],
}, { collection: 'products' });

const Obedience = mongoose.model('Obedience', ObedienceSchema);
const Product = mongoose.model('Product', ProductSchema);

async function generateReport() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connecté à MongoDB\n');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('           RAPPORT DES OBÉDIENCES - ATELIER ART ROYAL');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const obediences = await Obedience.find({}).sort({ order: 1 }).lean();

  console.log(`📊 Total: ${obediences.length} obédiences\n`);

  for (const ob of obediences) {
    // Compter les produits
    const productCount = await Product.countDocuments({ obedience_ids: ob._id });

    console.log('───────────────────────────────────────────────────────────────');
    console.log(`🏛️  ${ob.name}`);
    console.log('───────────────────────────────────────────────────────────────');
    console.log(`   Code:         ${ob.code}`);
    console.log(`   Slug:         ${ob.slug}`);
    console.log(`   Ordre:        ${ob.order}`);
    console.log(`   Statut:       ${ob.is_active ? '✅ Active' : '❌ Inactive'}`);
    console.log(`   Image:        ${ob.image_filename || 'Aucune'}`);
    console.log(`   Produits:     ${productCount}`);
    
    if (ob.image_url) {
      console.log(`   URL Image:    ${ob.image_url.substring(0, 60)}...`);
    }
    
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                      STATISTIQUES GLOBALES');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const stats = {
    total: obediences.length,
    active: obediences.filter(o => o.is_active).length,
    withImages: obediences.filter(o => o.image_url).length,
    withSlugs: obediences.filter(o => o.slug).length
  };

  console.log(`   Obédiences totales:       ${stats.total}`);
  console.log(`   Obédiences actives:       ${stats.active}`);
  console.log(`   Avec images:              ${stats.withImages}`);
  console.log(`   Avec slugs:               ${stats.withSlugs}`);

  // Produits par obédience
  console.log('\n   Distribution des produits:');
  const totalProducts = await Product.countDocuments({});
  const productsWithOb = await Product.countDocuments({ 
    obedience_ids: { $exists: true, $ne: [] } 
  });
  
  console.log(`     Total produits:         ${totalProducts}`);
  console.log(`     Avec obédiences:        ${productsWithOb}`);
  console.log(`     Sans obédience:         ${totalProducts - productsWithOb}`);

  console.log('\n═══════════════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

generateReport().catch(console.error);
