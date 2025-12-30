import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_at_price?: number;
  promo_start_date?: Date;
  promo_end_date?: Date;
  
  // Relations (stockées comme ObjectId references)
  rite_ids: mongoose.Types.ObjectId[];
  obedience_ids: mongoose.Types.ObjectId[];
  degree_order_ids: mongoose.Types.ObjectId[];
  category_ids: mongoose.Types.ObjectId[];
  
  // Champs dénormalisés pour optimisation (remplis automatiquement via hook)
  loge_types?: string[]; // ['Loge Symbolique', 'Loge Hauts Grades']
  rite_codes?: string[]; // ['REAA', 'RER', 'RF']
  obedience_codes?: string[]; // ['GLDF', 'GODF']
  category_slugs?: string[]; // ['tabliers', 'sautoirs']
  
  product_type?: string;
  images: string[];
  video_url?: string;
  
  // Stock
  stock_quantity: number;
  low_stock_threshold: number;
  allow_backorders: boolean;
  sku?: string;
  
  // Status
  is_active: boolean;
  featured: boolean;
  sold_individually: boolean;
  
  // Variations
  sizes: string[];
  colors: string[];
  materials: string[];
  tags: string[];
  
  // Dimensions
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  
  // Shipping & Tax
  tax_status?: string;
  tax_class?: string;
  shipping_class?: string;
  
  // Related
  related_products: mongoose.Types.ObjectId[];
  cross_sell_products: mongoose.Types.ObjectId[];
  
  // Reviews
  enable_reviews: boolean;
  average_rating?: number;
  review_count: number;
  
  // Migration helper - ID original Base44
  legacy_id?: string;
  
  created_at: Date;
  updated_at: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, unique: true, sparse: true },
    description: { type: String },
    short_description: { type: String },
    price: { type: Number, required: true, min: 0 },
    compare_at_price: { type: Number, min: 0 },
    promo_start_date: { type: Date },
    promo_end_date: { type: Date },
    
    rite_ids: [{ type: Schema.Types.ObjectId, ref: 'Rite' }],
    obedience_ids: [{ type: Schema.Types.ObjectId, ref: 'Obedience' }],
    degree_order_ids: [{ type: Schema.Types.ObjectId, ref: 'DegreeOrder' }],
    category_ids: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    
    // Champs dénormalisés pour filtrage rapide
    loge_types: [{ type: String, index: true }],
    rite_codes: [{ type: String, index: true }],
    obedience_codes: [{ type: String, index: true }],
    category_slugs: [{ type: String, index: true }],
    
    product_type: { type: String },
    images: [{ type: String }],
    video_url: { type: String },
    
    stock_quantity: { type: Number, default: 0 },
    low_stock_threshold: { type: Number, default: 5 },
    allow_backorders: { type: Boolean, default: false },
    sku: { type: String, index: true },
    
    is_active: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false, index: true },
    sold_individually: { type: Boolean, default: false },
    
    sizes: [{ type: String }],
    colors: [{ type: String }],
    materials: [{ type: String }],
    tags: [{ type: String, index: true }],
    
    weight: { type: Number },
    length: { type: Number },
    width: { type: Number },
    height: { type: Number },
    
    tax_status: { type: String },
    tax_class: { type: String },
    shipping_class: { type: String },
    
    related_products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    cross_sell_products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    
    enable_reviews: { type: Boolean, default: true },
    average_rating: { type: Number, min: 0, max: 5 },
    review_count: { type: Number, default: 0 },
    
    legacy_id: { type: String, index: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Générer le slug automatiquement
ProductSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Index de recherche texte
ProductSchema.index({ 
  name: 'text', 
  description: 'text', 
  short_description: 'text',
  tags: 'text' 
}, {
  weights: {
    name: 10,
    tags: 5,
    short_description: 3,
    description: 1
  },
  name: 'product_text_search'
});

// Index composés pour le catalogue et filtrage OPTIMISÉS
ProductSchema.index({ is_active: 1, created_at: -1 });
ProductSchema.index({ is_active: 1, price: 1 });
ProductSchema.index({ is_active: 1, featured: -1, created_at: -1 });

// Index sur relations (many-to-many)
ProductSchema.index({ is_active: 1, category_ids: 1 });
ProductSchema.index({ is_active: 1, rite_ids: 1 });
ProductSchema.index({ is_active: 1, obedience_ids: 1 });
ProductSchema.index({ is_active: 1, degree_order_ids: 1 });

// Index sur champs dénormalisés pour filtrage ultra-rapide
ProductSchema.index({ is_active: 1, loge_types: 1 });
ProductSchema.index({ is_active: 1, rite_codes: 1 });
ProductSchema.index({ is_active: 1, obedience_codes: 1 });
ProductSchema.index({ is_active: 1, category_slugs: 1 });

// Index composites pour combinaisons fréquentes
ProductSchema.index({ is_active: 1, category_ids: 1, price: 1 });
ProductSchema.index({ is_active: 1, loge_types: 1, rite_codes: 1 });
ProductSchema.index({ is_active: 1, stock_quantity: 1, allow_backorders: 1 });

// Index pour les promotions
ProductSchema.index({ is_active: 1, compare_at_price: 1, promo_start_date: 1, promo_end_date: 1 });

// Index pour le stock
ProductSchema.index({ is_active: 1, stock_quantity: 1 });

// Méthode virtuelle pour vérifier si le produit est en promo
ProductSchema.virtual('is_on_sale').get(function() {
  if (!this.compare_at_price || this.compare_at_price <= this.price) return false;
  const now = new Date();
  if (this.promo_start_date && new Date(this.promo_start_date) > now) return false;
  if (this.promo_end_date && new Date(this.promo_end_date) < now) return false;
  return true;
});

// Méthode virtuelle pour le pourcentage de réduction
ProductSchema.virtual('discount_percentage').get(function() {
  if (!this.compare_at_price || this.compare_at_price <= this.price) return 0;
  return Math.round((1 - this.price / this.compare_at_price) * 100);
});

// Activer les virtuals lors de la conversion en JSON
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
