import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI non défini');
}

const ProductSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const Product = mongoose.model('Product', ProductSchema);

async function initializeStockManagement() {
  try {
    console.log('🔍 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const products = await Product.find({ is_active: true }).lean();
    console.log(`📦 ${products.length} produits actifs trouvés\n`);

    let updated = 0;
    let alreadyConfigured = 0;

    for (const product of products) {
      const updates = {};
      let needsUpdate = false;

      // Vérifier stock_quantity
      if (product.stock_quantity === undefined || product.stock_quantity === null) {
        updates.stock_quantity = 10; // Stock par défaut
        needsUpdate = true;
      }

      // Vérifier low_stock_threshold
      if (product.low_stock_threshold === undefined || product.low_stock_threshold === null) {
        updates.low_stock_threshold = 3;
        needsUpdate = true;
      }

      // Vérifier allow_backorders
      if (product.allow_backorders === undefined || product.allow_backorders === null) {
        updates.allow_backorders = true; // Autoriser par défaut
        needsUpdate = true;
      }

      // Vérifier stock_alert_threshold (alias)
      if (product.stock_alert_threshold === undefined || product.stock_alert_threshold === null) {
        updates.stock_alert_threshold = 3;
        needsUpdate = true;
      }

      // Vérifier manage_stock (nouveau champ pour toggle global)
      if (product.manage_stock === undefined || product.manage_stock === null) {
        updates.manage_stock = true; // Activer la gestion du stock par défaut
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Product.updateOne({ _id: product._id }, { $set: updates });
        updated++;
        console.log(`✅ ${product.name} - Stock initialisé:`, updates);
      } else {
        alreadyConfigured++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 RÉSUMÉ:\n');
    console.log(`   ✅ Produits mis à jour: ${updated}`);
    console.log(`   ⏭️  Produits déjà configurés: ${alreadyConfigured}`);
    console.log(`   📦 Total: ${products.length}`);
    console.log('\n✅ Initialisation de la gestion des stocks terminée!');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

initializeStockManagement();
