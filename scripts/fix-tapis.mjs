/**
 * Script pour créer la catégorie Décors de Loge et assigner le Tapis
 */
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  is_active: Boolean
}, { collection: 'categories' });

const ProductSchema = new mongoose.Schema({
  name: String,
  sku: String,
  category_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
}, { collection: 'products' });

const Category = mongoose.model('Category', CategorySchema);
const Product = mongoose.model('Product', ProductSchema);

async function fixTapis() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connecté à MongoDB');

  // Créer la catégorie Décors de Loge
  let decoCategory = await Category.findOne({ slug: 'decors-de-loge' });
  if (!decoCategory) {
    decoCategory = await Category.create({
      name: 'Décors de Loge',
      slug: 'decors-de-loge',
      description: 'Tapis de loge, tableaux et décors de cérémonie',
      is_active: true
    });
    console.log('✅ Catégorie "Décors de Loge" créée');
  }

  // Assigner au Tapis
  const result = await Product.updateOne(
    { sku: 'RFM-1-ORD-TAPIS' },
    { $addToSet: { category_ids: decoCategory._id } }
  );
  
  if (result.modifiedCount > 0) {
    console.log('✅ Tapis: catégorie "Décors de Loge" assignée');
  } else {
    console.log('⚠️ Tapis déjà catégorisé ou non trouvé');
  }

  // Vérification
  const noCategory = await Product.countDocuments({
    $or: [
      { category_ids: { $exists: false } },
      { category_ids: { $size: 0 } }
    ]
  });
  console.log(`\n📊 Produits sans catégorie: ${noCategory}`);

  await mongoose.disconnect();
}

fixTapis().catch(console.error);
