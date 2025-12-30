/**
 * Script de création de données de démonstration
 * 
 * Usage:
 *   1. Configurer MONGODB_URI dans .env.local
 *   2. Exécuter: node scripts/seed-demo.mjs
 */

import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/artroyal';

// Schémas
const RiteSchema = new mongoose.Schema({
  name: String,
  code: String,
  description: String,
  image_url: String,
  order: Number,
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const ObedienceSchema = new mongoose.Schema({
  name: String,
  code: String,
  description: String,
  image_url: String,
  order: Number,
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const DegreeOrderSchema = new mongoose.Schema({
  name: String,
  level: Number,
  loge_type: { type: String, enum: ['Loge Symbolique', 'Loge Hauts Grades'] },
  description: String,
  order: Number,
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  image_url: String,
  order: Number,
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const ProductSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  short_description: String,
  price: Number,
  compare_at_price: Number,
  promo_start_date: Date,
  promo_end_date: Date,
  rite_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rite' }],
  obedience_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Obedience' }],
  degree_order_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DegreeOrder' }],
  category_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  images: [String],
  stock_quantity: Number,
  is_active: { type: Boolean, default: true },
  featured: Boolean,
  sizes: [String],
  colors: [String],
  materials: [String],
  tags: [String],
  allow_backorders: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Modèles
const Rite = mongoose.models.Rite || mongoose.model('Rite', RiteSchema);
const Obedience = mongoose.models.Obedience || mongoose.model('Obedience', ObedienceSchema);
const DegreeOrder = mongoose.models.DegreeOrder || mongoose.model('DegreeOrder', DegreeOrderSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// Données de démonstration
const RITES = [
  { name: 'Rite Écossais Ancien et Accepté', code: 'REAA', order: 1 },
  { name: 'Rite Émulation', code: 'REM', order: 2 },
  { name: 'Rite Français', code: 'RF', order: 3 },
  { name: 'Rite Écossais Rectifié', code: 'RER', order: 4 },
  { name: 'Memphis-Misraïm', code: 'MM', order: 5 },
];

const OBEDIENCES = [
  { name: 'Grande Loge de France', code: 'GLDF', order: 1 },
  { name: 'Grand Orient de France', code: 'GODF', order: 2 },
  { name: 'Grande Loge Nationale Française', code: 'GLNF', order: 3 },
  { name: 'Droit Humain', code: 'DH', order: 4 },
  { name: 'Grande Loge Féminine de France', code: 'GLFF', order: 5 },
];

const DEGREES = [
  // Loge Symbolique (degrés 1-3)
  { name: 'Apprenti', level: 1, loge_type: 'Loge Symbolique', order: 1 },
  { name: 'Compagnon', level: 2, loge_type: 'Loge Symbolique', order: 2 },
  { name: 'Maître', level: 3, loge_type: 'Loge Symbolique', order: 3 },
  // Hauts Grades REAA
  { name: '4ème degré - Maître Secret', level: 4, loge_type: 'Loge Hauts Grades', order: 4 },
  { name: '14ème degré - Grand Élu', level: 14, loge_type: 'Loge Hauts Grades', order: 14 },
  { name: '18ème degré - Chevalier Rose-Croix', level: 18, loge_type: 'Loge Hauts Grades', order: 18 },
  { name: '30ème degré - Chevalier Kadosh', level: 30, loge_type: 'Loge Hauts Grades', order: 30 },
  { name: '31ème degré - Grand Inspecteur Inquisiteur', level: 31, loge_type: 'Loge Hauts Grades', order: 31 },
  { name: '32ème degré - Sublime Prince du Royal Secret', level: 32, loge_type: 'Loge Hauts Grades', order: 32 },
  { name: '33ème degré - Souverain Grand Inspecteur Général', level: 33, loge_type: 'Loge Hauts Grades', order: 33 },
];

const CATEGORIES = [
  { name: 'Tabliers', slug: 'tabliers', order: 1 },
  { name: 'Sautoirs', slug: 'sautoirs', order: 2 },
  { name: 'Bijoux', slug: 'bijoux', order: 3 },
  { name: 'Gants', slug: 'gants', order: 4 },
  { name: 'Cordons', slug: 'cordons', order: 5 },
  { name: 'Accessoires', slug: 'accessoires', order: 6 },
  { name: 'Épées', slug: 'epees', order: 7 },
  { name: 'Maroquinerie', slug: 'maroquinerie', order: 8 },
];

// Fonction pour générer le slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Fonction pour obtenir un élément aléatoire
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Fonction pour obtenir plusieurs éléments aléatoires
function randomItems(arr, min = 1, max = 3) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
}

// Génération des produits
function generateProducts(rites, obediences, degrees, categories) {
  const products = [];
  
  const productTemplates = [
    {
      category: 'Tabliers',
      names: [
        'Tablier {rite} {degree}',
        'Tablier brodé {rite}',
        'Tablier de cérémonie {degree}',
      ],
      basePrice: 150,
      materials: ['Cuir', 'Soie', 'Satin', 'Coton'],
      colors: ['Blanc', 'Bleu', 'Rouge', 'Noir', 'Or'],
    },
    {
      category: 'Sautoirs',
      names: [
        'Sautoir {rite} {degree}',
        'Sautoir de Vénérable {rite}',
        'Sautoir brodé {degree}',
      ],
      basePrice: 80,
      materials: ['Moiré', 'Satin', 'Velours'],
      colors: ['Bleu', 'Rouge', 'Vert', 'Violet'],
    },
    {
      category: 'Bijoux',
      names: [
        'Bijou {degree} or',
        'Bijou de loge {rite}',
        'Bijou de Vénérable',
        'Médaille commémorative',
      ],
      basePrice: 120,
      materials: ['Argent', 'Plaqué or', 'Bronze', 'Vermeil'],
      colors: ['Argent', 'Or', 'Bronze'],
    },
    {
      category: 'Gants',
      names: [
        'Gants blancs coton',
        'Gants cérémonies {rite}',
        'Paire de gants brodés',
      ],
      basePrice: 25,
      materials: ['Coton', 'Cuir', 'Chevreau'],
      colors: ['Blanc'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    {
      category: 'Cordons',
      names: [
        'Cordon {rite} {degree}',
        'Cordon de cérémonie',
        'Cordon 31ème degré',
      ],
      basePrice: 60,
      materials: ['Moiré', 'Satin'],
      colors: ['Noir', 'Blanc', 'Rouge'],
    },
    {
      category: 'Accessoires',
      names: [
        'Maillet de Vénérable',
        'Chandelier 3 branches',
        'Plateau à tracé',
        'Compas et Équerre',
      ],
      basePrice: 45,
      materials: ['Bois', 'Métal', 'Laiton'],
      colors: ['Naturel', 'Noir', 'Doré'],
    },
    {
      category: 'Épées',
      names: [
        'Épée de cérémonie {degree}',
        'Épée flamboyante',
        'Dague rituelle',
      ],
      basePrice: 200,
      materials: ['Acier', 'Laiton'],
      colors: ['Argent', 'Or'],
    },
    {
      category: 'Maroquinerie',
      names: [
        'Porte-documents maçonnique',
        'Mallette de transport',
        'Étui pour tablier',
      ],
      basePrice: 90,
      materials: ['Cuir', 'Simili-cuir', 'Toile'],
      colors: ['Noir', 'Marron', 'Bordeaux'],
    },
  ];
  
  productTemplates.forEach(template => {
    const category = categories.find(c => c.name === template.category);
    if (!category) return;
    
    // Générer plusieurs produits par template
    for (let i = 0; i < 5; i++) {
      const selectedRites = randomItems(rites, 1, 2);
      const selectedObediences = randomItems(obediences, 1, 2);
      const selectedDegrees = randomItems(degrees, 1, 2);
      
      let name = randomItem(template.names);
      name = name
        .replace('{rite}', selectedRites[0]?.code || '')
        .replace('{degree}', selectedDegrees[0]?.name?.split(' ')[0] || '')
        .trim();
      
      // Variation de prix
      const priceVariation = (Math.random() - 0.5) * template.basePrice * 0.4;
      const price = Math.round((template.basePrice + priceVariation) * 100) / 100;
      
      // Promotion aléatoire (20% de chance)
      const isPromo = Math.random() < 0.2;
      const compareAtPrice = isPromo ? Math.round(price * 1.2 * 100) / 100 : undefined;
      
      // Stock aléatoire
      const stockQuantity = Math.floor(Math.random() * 50);
      
      // Featured aléatoire (10% de chance)
      const featured = Math.random() < 0.1;
      
      products.push({
        name,
        slug: generateSlug(name) + '-' + Date.now() + '-' + i,
        description: `Description détaillée du produit ${name}. Ce produit maçonnique de haute qualité est idéal pour les cérémonies.`,
        short_description: `${name} - Qualité supérieure`,
        price,
        compare_at_price: compareAtPrice,
        promo_start_date: isPromo ? new Date() : undefined,
        promo_end_date: isPromo ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
        rite_ids: selectedRites.map(r => r._id),
        obedience_ids: selectedObediences.map(o => o._id),
        degree_order_ids: selectedDegrees.map(d => d._id),
        category_ids: [category._id],
        images: [],
        stock_quantity: stockQuantity,
        is_active: true,
        featured,
        sizes: template.sizes || [],
        colors: randomItems(template.colors, 1, 3),
        materials: randomItems(template.materials, 1, 2),
        tags: [template.category.toLowerCase(), ...selectedRites.map(r => r.code.toLowerCase())],
        allow_backorders: Math.random() < 0.3,
      });
    }
  });
  
  return products;
}

async function seed() {
  console.log('🌱 Démarrage du seed de démonstration...');
  console.log(`📦 Connexion à MongoDB: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    // Demander confirmation avant de supprimer
    console.log('\n⚠️  ATTENTION: Ce script va supprimer toutes les données existantes!');
    console.log('   Appuyez sur Ctrl+C pour annuler...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Supprimer les données existantes
    console.log('🗑️  Suppression des données existantes...');
    await Promise.all([
      Rite.deleteMany({}),
      Obedience.deleteMany({}),
      DegreeOrder.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
    ]);
    
    // Créer les rites
    console.log('📝 Création des rites...');
    const rites = await Rite.insertMany(RITES.map(r => ({ ...r, is_active: true })));
    console.log(`   ✓ ${rites.length} rites créés`);
    
    // Créer les obédiences
    console.log('📝 Création des obédiences...');
    const obediences = await Obedience.insertMany(OBEDIENCES.map(o => ({ ...o, is_active: true })));
    console.log(`   ✓ ${obediences.length} obédiences créées`);
    
    // Créer les degrés
    console.log('📝 Création des degrés...');
    const degrees = await DegreeOrder.insertMany(DEGREES.map(d => ({ ...d, is_active: true })));
    console.log(`   ✓ ${degrees.length} degrés créés`);
    
    // Créer les catégories
    console.log('📝 Création des catégories...');
    const categories = await Category.insertMany(CATEGORIES.map(c => ({ ...c, is_active: true })));
    console.log(`   ✓ ${categories.length} catégories créées`);
    
    // Générer et créer les produits
    console.log('📝 Génération des produits...');
    const productsData = generateProducts(rites, obediences, degrees, categories);
    const products = await Product.insertMany(productsData);
    console.log(`   ✓ ${products.length} produits créés`);
    
    // Statistiques
    console.log('\n📊 Statistiques:');
    console.log(`   - Rites: ${rites.length}`);
    console.log(`   - Obédiences: ${obediences.length}`);
    console.log(`   - Degrés: ${degrees.length}`);
    console.log(`   - Catégories: ${categories.length}`);
    console.log(`   - Produits: ${products.length}`);
    console.log(`   - Produits en promo: ${products.filter(p => p.compare_at_price).length}`);
    console.log(`   - Produits vedettes: ${products.filter(p => p.featured).length}`);
    
    console.log('\n✅ Seed terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnecté de MongoDB');
  }
}

seed();
