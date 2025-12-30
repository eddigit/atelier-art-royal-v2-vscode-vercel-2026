import mongoose, { Schema, Document, Model } from 'mongoose';

export type OrderStatus = 
  | 'pending' 
  | 'design' 
  | 'production' 
  | 'quality_control' 
  | 'packaging' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'bank_transfer' | 'cash' | 'check' | 'phone_validation';
export type OrderSource = 'web' | 'pos' | 'quote'; // 3 sources: web e-commerce, POS atelier, devis commercial

export interface IOrderItem {
  product_id: mongoose.Types.ObjectId;
  product_name: string;
  sku?: string;
  quantity: number;
  price: number;
  total: number;
  customization?: string;
}

export interface IAddress {
  full_name: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface IOrder extends Document {
  order_number: string;
  customer_id?: mongoose.Types.ObjectId;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  
  status: OrderStatus;
  items: IOrderItem[];
  
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  
  shipping_address: IAddress;
  billing_address: IAddress;
  
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_intent_id?: string;
  
  tracking_number?: string;
  carrier?: string;
  shipped_at?: Date;
  delivered_at?: Date;
  
  notes?: string;
  internal_notes?: string;
  
  // Source de la commande (web, POS, ou devis)
  source: OrderSource;
  quote_id?: mongoose.Types.ObjectId; // Si commande issue d'un devis
  
  // Info commerciale (si source = quote)
  sales_person?: string;
  commission_rate?: number;
  
  legacy_id?: string;
  created_at: Date;
  updated_at: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    product_name: { type: String, required: true },
    sku: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    customization: { type: String },
  },
  { _id: false }
);

const AddressSchema = new Schema<IAddress>(
  {
    full_name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    postal_code: { type: String, required: true },
    country: { type: String, default: 'France' },
    phone: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    order_number: { type: String, required: true, unique: true },
    customer_id: { type: Schema.Types.ObjectId, ref: 'User' },
    customer_email: { type: String, required: true },
    customer_name: { type: String, required: true },
    customer_phone: { type: String },
    
    status: { 
      type: String, 
      enum: ['pending', 'design', 'production', 'quality_control', 'packaging', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true
    },
    items: [OrderItemSchema],
    
    subtotal: { type: Number, required: true, min: 0 },
    shipping_cost: { type: Number, default: 0, min: 0 },
    tax_amount: { type: Number, default: 0, min: 0 },
    discount_amount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    
    shipping_address: { type: AddressSchema, required: true },
    billing_address: { type: AddressSchema, required: true },
    
    payment_status: { 
      type: String, 
      enum: ['pending', 'paid', 'partial', 'failed', 'refunded'],
      default: 'pending',
      index: true
    },
    payment_method: { 
      type: String, 
      enum: ['card', 'bank_transfer', 'cash', 'check', 'phone_validation'],
      default: 'card'
    },
    payment_intent_id: { type: String },
    
    tracking_number: { type: String },
    carrier: { type: String },
    shipped_at: { type: Date },
    delivered_at: { type: Date },
    
    notes: { type: String },
    internal_notes: { type: String },
    
    source: { 
      type: String, 
      enum: ['web', 'pos', 'quote'],
      default: 'web',
      index: true
    },
    quote_id: { type: Schema.Types.ObjectId, ref: 'Quote' },
    
    sales_person: { type: String },
    commission_rate: { type: Number, min: 0, max: 100 },
    
    legacy_id: { type: String, index: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Générer le numéro de commande
OrderSchema.pre('save', async function (next) {
  if (!this.order_number) {
    const date = new Date();
    const prefix = `AR${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const count = await mongoose.models.Order.countDocuments({
      order_number: new RegExp(`^${prefix}`)
    });
    this.order_number = `${prefix}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Index pour recherche et analytics
OrderSchema.index({ customer_email: 1 });
OrderSchema.index({ created_at: -1 });
OrderSchema.index({ status: 1, payment_status: 1 });
OrderSchema.index({ source: 1, created_at: -1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
