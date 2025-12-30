import mongoose, { Schema, Document } from 'mongoose';

export type ProductionStatus = 'pending' | 'in_progress' | 'quality_check' | 'completed' | 'delivered' | 'cancelled';
export type ProductionPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface IProductionItem {
  product_id: mongoose.Types.ObjectId;
  product_name: string;
  quantity: number;
  customization?: {
    embroidery_text?: string;
    embroidery_position?: string;
    thread_color?: string;
    special_instructions?: string;
  };
  status: ProductionStatus;
  assigned_to?: string; // Artisan/brodeur
  started_at?: Date;
  completed_at?: Date;
}

export interface IProduction extends Document {
  order_id: mongoose.Types.ObjectId;
  order_number: string;
  customer_name: string;
  customer_email: string;
  items: IProductionItem[];
  status: ProductionStatus;
  priority: ProductionPriority;
  due_date?: Date;
  notes?: string;
  internal_notes?: string; // Notes atelier
  estimated_hours?: number;
  actual_hours?: number;
  created_at: Date;
  updated_at: Date;
}

const ProductionItemSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  product_name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  customization: {
    embroidery_text: { type: String },
    embroidery_position: { type: String },
    thread_color: { type: String },
    special_instructions: { type: String },
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'quality_check', 'completed', 'delivered', 'cancelled'],
    default: 'pending'
  },
  assigned_to: { type: String },
  started_at: { type: Date },
  completed_at: { type: Date },
}, { _id: false });

const ProductionSchema: Schema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  order_number: { type: String, required: true },
  customer_name: { type: String, required: true },
  customer_email: { type: String },
  items: [ProductionItemSchema],
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'quality_check', 'completed', 'delivered', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  due_date: { type: Date },
  notes: { type: String },
  internal_notes: { type: String },
  estimated_hours: { type: Number },
  actual_hours: { type: Number },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

ProductionSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

ProductionSchema.index({ order_id: 1 });
ProductionSchema.index({ status: 1 });
ProductionSchema.index({ priority: 1 });
ProductionSchema.index({ due_date: 1 });
ProductionSchema.index({ created_at: -1 });

export default mongoose.models.Production || mongoose.model<IProduction>('Production', ProductionSchema);
