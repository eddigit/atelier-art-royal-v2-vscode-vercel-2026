import mongoose, { Schema, Document, Model } from 'mongoose';

export type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'converted';

export interface IQuoteItem {
  product_id?: mongoose.Types.ObjectId;
  product_name: string;
  description?: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  total: number;
  customization?: string;
}

export interface IQuote extends Document {
  quote_number: string;
  customer_id?: mongoose.Types.ObjectId;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  customer_company?: string;
  
  status: QuoteStatus;
  items: IQuoteItem[];
  
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  
  // Validité
  valid_until: Date;
  
  // Commercial
  sales_person: string;
  commission_rate?: number;
  
  // Notes
  notes?: string;
  internal_notes?: string;
  terms_and_conditions?: string;
  
  // Conversion
  converted_to_order?: mongoose.Types.ObjectId;
  converted_at?: Date;
  
  // Historique des vues et actions
  viewed_at?: Date;
  accepted_at?: Date;
  rejected_at?: Date;
  rejection_reason?: string;
  
  created_at: Date;
  updated_at: Date;
}

const QuoteItemSchema = new Schema<IQuoteItem>(
  {
    product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
    product_name: { type: String, required: true },
    description: { type: String },
    sku: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unit_price: { type: Number, required: true, min: 0 },
    discount_percent: { type: Number, min: 0, max: 100, default: 0 },
    total: { type: Number, required: true, min: 0 },
    customization: { type: String },
  },
  { _id: false }
);

const QuoteSchema = new Schema<IQuote>(
  {
    quote_number: { type: String, required: true, unique: true },
    customer_id: { type: Schema.Types.ObjectId, ref: 'User' },
    customer_email: { type: String, required: true },
    customer_name: { type: String, required: true },
    customer_phone: { type: String },
    customer_company: { type: String },
    
    status: {
      type: String,
      enum: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted'],
      default: 'draft',
      index: true
    },
    items: [QuoteItemSchema],
    
    subtotal: { type: Number, required: true, min: 0 },
    shipping_cost: { type: Number, default: 0, min: 0 },
    tax_amount: { type: Number, default: 0, min: 0 },
    discount_amount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    
    valid_until: { type: Date, required: true },
    
    sales_person: { type: String, required: true },
    commission_rate: { type: Number, min: 0, max: 100 },
    
    notes: { type: String },
    internal_notes: { type: String },
    terms_and_conditions: { type: String },
    
    converted_to_order: { type: Schema.Types.ObjectId, ref: 'Order' },
    converted_at: { type: Date },
    
    viewed_at: { type: Date },
    accepted_at: { type: Date },
    rejected_at: { type: Date },
    rejection_reason: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Générer le numéro de devis
QuoteSchema.pre('save', async function (next) {
  if (!this.quote_number) {
    const date = new Date();
    const prefix = `DEV${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const count = await mongoose.models.Quote?.countDocuments({
      quote_number: new RegExp(`^${prefix}`)
    }) || 0;
    this.quote_number = `${prefix}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Marquer comme expiré automatiquement
QuoteSchema.pre('find', function() {
  const now = new Date();
  this.model.updateMany(
    { 
      status: { $in: ['sent', 'viewed'] },
      valid_until: { $lt: now }
    },
    { $set: { status: 'expired' } }
  ).exec();
});

// Index pour recherche
QuoteSchema.index({ customer_email: 1 });
QuoteSchema.index({ sales_person: 1, created_at: -1 });
QuoteSchema.index({ status: 1, valid_until: 1 });
QuoteSchema.index({ created_at: -1 });

const Quote: Model<IQuote> =
  mongoose.models.Quote || mongoose.model<IQuote>('Quote', QuoteSchema);

export default Quote;
