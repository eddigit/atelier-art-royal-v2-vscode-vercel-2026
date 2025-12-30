import mongoose, { Schema, Document, Model } from 'mongoose';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';

export interface IInvoiceItem {
  product_id?: mongoose.Types.ObjectId;
  product_name: string;
  description?: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total: number;
}

export interface IPayment {
  date: Date;
  amount: number;
  method: 'card' | 'bank_transfer' | 'cash' | 'check';
  reference?: string;
  notes?: string;
}

export interface IInvoice extends Document {
  invoice_number: string;
  order_id?: mongoose.Types.ObjectId;
  quote_id?: mongoose.Types.ObjectId;
  customer_id?: mongoose.Types.ObjectId;
  customer_email: string;
  customer_name: string;
  customer_company?: string;
  
  // Adresse de facturation
  billing_address: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  
  status: InvoiceStatus;
  items: IInvoiceItem[];
  
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  
  // Paiements
  payments: IPayment[];
  amount_paid: number;
  amount_due: number;
  
  // Dates importantes
  issue_date: Date;
  due_date: Date;
  paid_at?: Date;
  
  // Notes
  notes?: string;
  internal_notes?: string;
  
  // PDF
  pdf_url?: string;
  
  created_at: Date;
  updated_at: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
  {
    product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
    product_name: { type: String, required: true },
    description: { type: String },
    sku: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unit_price: { type: Number, required: true, min: 0 },
    tax_rate: { type: Number, required: true, min: 0, default: 20 }, // TVA 20% par défaut
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const PaymentSchema = new Schema<IPayment>(
  {
    date: { type: Date, required: true, default: Date.now },
    amount: { type: Number, required: true, min: 0 },
    method: { 
      type: String, 
      enum: ['card', 'bank_transfer', 'cash', 'check'],
      required: true 
    },
    reference: { type: String },
    notes: { type: String },
  },
  { _id: true }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoice_number: { type: String, required: true, unique: true },
    order_id: { type: Schema.Types.ObjectId, ref: 'Order' },
    quote_id: { type: Schema.Types.ObjectId, ref: 'Quote' },
    customer_id: { type: Schema.Types.ObjectId, ref: 'User' },
    customer_email: { type: String, required: true },
    customer_name: { type: String, required: true },
    customer_company: { type: String },
    
    billing_address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      postal_code: { type: String, required: true },
      country: { type: String, required: true, default: 'France' },
    },
    
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'],
      default: 'draft',
      index: true
    },
    items: [InvoiceItemSchema],
    
    subtotal: { type: Number, required: true, min: 0 },
    tax_amount: { type: Number, required: true, min: 0 },
    discount_amount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    
    payments: [PaymentSchema],
    amount_paid: { type: Number, default: 0, min: 0 },
    amount_due: { type: Number, required: true, min: 0 },
    
    issue_date: { type: Date, required: true, default: Date.now },
    due_date: { type: Date, required: true },
    paid_at: { type: Date },
    
    notes: { type: String },
    internal_notes: { type: String },
    
    pdf_url: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Générer le numéro de facture
InvoiceSchema.pre('save', async function (next) {
  if (!this.invoice_number) {
    const date = new Date();
    const prefix = `FAC${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const count = await mongoose.models.Invoice?.countDocuments({
      invoice_number: new RegExp(`^${prefix}`)
    }) || 0;
    this.invoice_number = `${prefix}${String(count + 1).padStart(4, '0')}`;
  }
  
  // Calculer le montant dû
  this.amount_due = this.total - this.amount_paid;
  
  // Mettre à jour le statut en fonction des paiements
  if (this.amount_paid === 0 && this.status !== 'draft' && this.status !== 'cancelled') {
    const now = new Date();
    if (now > this.due_date) {
      this.status = 'overdue';
    }
  } else if (this.amount_paid >= this.total) {
    this.status = 'paid';
    if (!this.paid_at) {
      this.paid_at = new Date();
    }
  } else if (this.amount_paid > 0 && this.amount_paid < this.total) {
    this.status = 'partial';
  }
  
  next();
});

// Index pour recherche
InvoiceSchema.index({ customer_email: 1 });
InvoiceSchema.index({ order_id: 1 });
InvoiceSchema.index({ status: 1, due_date: 1 });
InvoiceSchema.index({ created_at: -1 });
InvoiceSchema.index({ invoice_number: 1 });

const Invoice: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
