/**
 * Utilitaires pour synchroniser les champs dénormalisés des produits
 * À utiliser dans les middlewares pre-save et post-update
 */

import mongoose from 'mongoose';

/**
 * Synchroniser les champs dénormalisés d'un produit
 * @param productId - ID du produit à synchroniser
 */
export async function syncProductDenormalizedFields(productId: mongoose.Types.ObjectId | string) {
  try {
    const Product = mongoose.model('Product');
    const Rite = mongoose.model('Rite');
    const Obedience = mongoose.model('Obedience');
    const DegreeOrder = mongoose.model('DegreeOrder');
    const Category = mongoose.model('Category');

    const product: any = await Product.findById(productId).lean();
    if (!product) return;

    // Récupérer les entités liées
    const [rites, obediences, degrees, categories] = await Promise.all([
      product.rite_ids?.length > 0 
        ? Rite.find({ _id: { $in: product.rite_ids } }).select('code abbreviation').lean() 
        : [],
      product.obedience_ids?.length > 0 
        ? Obedience.find({ _id: { $in: product.obedience_ids } }).select('code abbreviation').lean() 
        : [],
      product.degree_order_ids?.length > 0 
        ? DegreeOrder.find({ _id: { $in: product.degree_order_ids } }).select('loge_type').lean() 
        : [],
      product.category_ids?.length > 0 
        ? Category.find({ _id: { $in: product.category_ids } }).select('slug').lean() 
        : [],
    ]);

    // Extraire les valeurs uniques
    const logeTypes = Array.from(new Set(degrees.map((d: any) => d.loge_type).filter(Boolean)));
    const riteCodes = Array.from(new Set(rites.flatMap((r: any) => [r.code, r.abbreviation]).filter(Boolean)));
    const obedienceCodes = Array.from(new Set(obediences.flatMap((o: any) => [o.code, o.abbreviation]).filter(Boolean)));
    const categorySlugs = Array.from(new Set(categories.map((c: any) => c.slug).filter(Boolean)));

    // Mettre à jour le produit
    await Product.updateOne(
      { _id: productId },
      {
        $set: {
          loge_types: logeTypes,
          rite_codes: riteCodes,
          obedience_codes: obedienceCodes,
          category_slugs: categorySlugs,
        }
      }
    );

    return {
      loge_types: logeTypes,
      rite_codes: riteCodes,
      obedience_codes: obedienceCodes,
      category_slugs: categorySlugs,
    };
  } catch (error) {
    console.error('Erreur sync product denormalized fields:', error);
    throw error;
  }
}

/**
 * Synchroniser plusieurs produits en bulk
 * @param productIds - IDs des produits à synchroniser
 */
export async function syncManyProductsDenormalizedFields(productIds: (mongoose.Types.ObjectId | string)[]) {
  try {
    const results = await Promise.allSettled(
      productIds.map(id => syncProductDenormalizedFields(id))
    );

    const successes = results.filter(r => r.status === 'fulfilled').length;
    const failures = results.filter(r => r.status === 'rejected').length;

    return { successes, failures, total: productIds.length };
  } catch (error) {
    console.error('Erreur sync many products:', error);
    throw error;
  }
}

/**
 * Resynchroniser tous les produits liés à une entité modifiée
 * @param entityType - Type d'entité (rite, obedience, degree, category)
 * @param entityId - ID de l'entité modifiée
 */
export async function resyncProductsForEntity(
  entityType: 'rite' | 'obedience' | 'degree' | 'category',
  entityId: mongoose.Types.ObjectId | string
) {
  try {
    const Product = mongoose.model('Product');

    // Trouver tous les produits liés à cette entité
    const fieldMap = {
      rite: 'rite_ids',
      obedience: 'obedience_ids',
      degree: 'degree_order_ids',
      category: 'category_ids',
    };

    const field = fieldMap[entityType];
    const products = await Product.find({ [field]: entityId }).select('_id').lean();

    if (products.length === 0) {
      console.log(`Aucun produit trouvé pour ${entityType} ${entityId}`);
      return { updated: 0 };
    }

    console.log(`🔄 Resync de ${products.length} produits pour ${entityType} ${entityId}...`);

    // Synchroniser en parallèle (par lots de 10)
    const batchSize = 10;
    const productIds = products.map((p: any) => p._id);
    let updated = 0;

    for (let i = 0; i < productIds.length; i += batchSize) {
      const batch = productIds.slice(i, i + batchSize);
      const result = await syncManyProductsDenormalizedFields(batch as any[]);
      updated += result.successes;
    }

    console.log(`✅ ${updated}/${products.length} produits resynchronisés`);

    return { updated };
  } catch (error) {
    console.error('Erreur resync products for entity:', error);
    throw error;
  }
}

/**
 * Hook à ajouter dans les modèles pour auto-sync
 * À appeler dans post-save, post-update, post-delete
 */
export function setupAutoSyncHooks(schema: mongoose.Schema, entityType: 'rite' | 'obedience' | 'degree' | 'category') {
  // Post-save: resynchroniser les produits liés
  schema.post('save', async function(doc: any) {
    try {
      await resyncProductsForEntity(entityType, doc._id);
    } catch (error) {
      console.error(`Erreur auto-sync après save ${entityType}:`, error);
    }
  });

  // Post-update: resynchroniser les produits liés
  schema.post('findOneAndUpdate', async function(doc: any) {
    if (doc) {
      try {
        await resyncProductsForEntity(entityType, doc._id);
      } catch (error) {
        console.error(`Erreur auto-sync après update ${entityType}:`, error);
      }
    }
  });

  // Post-delete: resynchroniser les produits liés
  schema.post('findOneAndDelete', async function(doc: any) {
    if (doc) {
      try {
        await resyncProductsForEntity(entityType, doc._id);
      } catch (error) {
        console.error(`Erreur auto-sync après delete ${entityType}:`, error);
      }
    }
  });
}

export default {
  syncProductDenormalizedFields,
  syncManyProductsDenormalizedFields,
  resyncProductsForEntity,
  setupAutoSyncHooks,
};
