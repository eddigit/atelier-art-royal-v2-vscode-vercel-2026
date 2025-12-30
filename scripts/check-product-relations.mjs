import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le .env.local depuis le répertoire parent
config({ path: join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI non défini');
}

// Schémas simplifiés
const ProductSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const ObedienceSchema = new mongoose.Schema({}, { strict: false, collection: 'obediences' });
const RiteSchema = new mongoose.Schema({}, { strict: false, collection: 'rites' });
const CategorySchema = new mongoose.Schema({}, { strict: false, collection: 'categories' });
const DegreeOrderSchema = new mongoose.Schema({}, { strict: false, collection: 'degreeorders' });

const Product = mongoose.model('Product', ProductSchema);
const Obedience = mongoose.model('Obedience', ObedienceSchema);
const Rite = mongoose.model('Rite', RiteSchema);
const Category = mongoose.model('Category', CategorySchema);
const DegreeOrder = mongoose.model('DegreeOrder', DegreeOrderSchema);

async function checkProductRelations() {
  try {
    console.log('🔍 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer tous les produits actifs
    const products = await Product.find({ is_active: true }).lean();
    console.log(`📦 ${products.length} produits actifs trouvés\n`);

    // Récupérer toutes les entités
    const [obediences, rites, categories, degrees] = await Promise.all([
      Obedience.find({ is_active: true }).lean(),
      Rite.find({ is_active: true }).lean(),
      Category.find({ is_active: true }).lean(),
      DegreeOrder.find({ is_active: true }).lean()
    ]);

    console.log(`🏛️  ${obediences.length} obédiences actives`);
    console.log(`📖 ${rites.length} rites actifs`);
    console.log(`📁 ${categories.length} catégories actives`);
    console.log(`🎖️  ${degrees.length} degrés actifs\n`);

    // Créer des maps pour compter les produits par entité
    const obedienceProductCount = {};
    const riteProductCount = {};
    const categoryProductCount = {};
    const degreeProductCount = {};

    obediences.forEach(ob => {
      obedienceProductCount[ob._id.toString()] = { name: ob.name, count: 0 };
    });
    rites.forEach(r => {
      riteProductCount[r._id.toString()] = { name: r.name, count: 0 };
    });
    categories.forEach(c => {
      categoryProductCount[c._id.toString()] = { name: c.name, count: 0 };
    });
    degrees.forEach(d => {
      degreeProductCount[d._id.toString()] = { name: d.name, count: 0 };
    });

    // Analyser chaque produit
    console.log('📊 ANALYSE DES RELATIONS PRODUITS:\n');
    console.log('='.repeat(80));

    let productsWithoutObedience = 0;
    let productsWithoutRite = 0;
    let productsWithoutCategory = 0;
    let productsWithoutDegree = 0;

    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name} (ID: ${product._id})`);
      console.log(`   SKU: ${product.sku || 'N/A'}`);

      // Vérifier les obédiences
      if (product.obedience_ids && product.obedience_ids.length > 0) {
        console.log(`   ✅ Obédiences (${product.obedience_ids.length}): ${product.obedience_ids.map(id => id.toString()).join(', ')}`);
        product.obedience_ids.forEach(id => {
          const idStr = id.toString();
          if (obedienceProductCount[idStr]) {
            obedienceProductCount[idStr].count++;
          }
        });
      } else {
        console.log('   ❌ Aucune obédience assignée');
        productsWithoutObedience++;
      }

      // Vérifier les rites
      if (product.rite_ids && product.rite_ids.length > 0) {
        console.log(`   ✅ Rites (${product.rite_ids.length}): ${product.rite_ids.map(id => id.toString()).join(', ')}`);
        product.rite_ids.forEach(id => {
          const idStr = id.toString();
          if (riteProductCount[idStr]) {
            riteProductCount[idStr].count++;
          }
        });
      } else {
        console.log('   ❌ Aucun rite assigné');
        productsWithoutRite++;
      }

      // Vérifier les catégories
      if (product.category_ids && product.category_ids.length > 0) {
        console.log(`   ✅ Catégories (${product.category_ids.length}): ${product.category_ids.map(id => id.toString()).join(', ')}`);
        product.category_ids.forEach(id => {
          const idStr = id.toString();
          if (categoryProductCount[idStr]) {
            categoryProductCount[idStr].count++;
          }
        });
      } else {
        console.log('   ❌ Aucune catégorie assignée');
        productsWithoutCategory++;
      }

      // Vérifier les degrés
      if (product.degree_order_ids && product.degree_order_ids.length > 0) {
        console.log(`   ✅ Degrés (${product.degree_order_ids.length}): ${product.degree_order_ids.map(id => id.toString()).join(', ')}`);
        product.degree_order_ids.forEach(id => {
          const idStr = id.toString();
          if (degreeProductCount[idStr]) {
            degreeProductCount[idStr].count++;
          }
        });
      } else {
        console.log('   ⚠️  Aucun degré assigné');
        productsWithoutDegree++;
      }
    });

    // Rapport final
    console.log('\n' + '='.repeat(80));
    console.log('\n📈 RAPPORT DE COMPTAGE PAR ENTITÉ:\n');

    console.log('🏛️  OBÉDIENCES:');
    Object.entries(obedienceProductCount).forEach(([id, data]) => {
      console.log(`   ${data.name}: ${data.count} produits`);
    });

    console.log('\n📖 RITES:');
    Object.entries(riteProductCount).forEach(([id, data]) => {
      console.log(`   ${data.name}: ${data.count} produits`);
    });

    console.log('\n📁 CATÉGORIES:');
    Object.entries(categoryProductCount).forEach(([id, data]) => {
      console.log(`   ${data.name}: ${data.count} produits`);
    });

    console.log('\n🎖️  DEGRÉS:');
    Object.entries(degreeProductCount).forEach(([id, data]) => {
      console.log(`   ${data.name}: ${data.count} produits`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n⚠️  STATISTIQUES DES PRODUITS MANQUANTS:\n');
    console.log(`   Produits sans obédience: ${productsWithoutObedience}/${products.length}`);
    console.log(`   Produits sans rite: ${productsWithoutRite}/${products.length}`);
    console.log(`   Produits sans catégorie: ${productsWithoutCategory}/${products.length}`);
    console.log(`   Produits sans degré: ${productsWithoutDegree}/${products.length}`);

    if (productsWithoutObedience === 0 && productsWithoutRite === 0 && productsWithoutCategory === 0) {
      console.log('\n✅ Toutes les relations essentielles sont présentes!');
    } else {
      console.log('\n❌ Des relations manquent! Un script de correction est nécessaire.');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

checkProductRelations();
