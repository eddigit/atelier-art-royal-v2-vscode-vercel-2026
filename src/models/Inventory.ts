import mongoose, { Schema, Document } from 'mongoose';

export type InventoryStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type AdjustmentReason = 'damaged' | 'lost' | 'found' | 'correction' | 'return' | 'other';

export interface IInventoryItem {
  product_id: mongoose.Types.ObjectId;
  product_name: string;
  sku?: string;
  expected_quantity: number;
  actual_quantity: number;
  difference: number;
  adjustment_reason?: AdjustmentReason;
  notes?: string;
  checked_by?: string;
  checked_at?: Date;
}

export interface IInventory extends Document {
  inventory_number: string;
  title: string;
  description?: string;
  status: InventoryStatus;
  items: IInventoryItem[];
  total_items: number;
  items_checked: number;
  discrepancies_count: number;
  started_by: string;
  started_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const InventoryItemSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  product_name: { type: String, required: true },
  sku: { type: String },
  expected_quantity: { type: Number, required: true },
  actual_quantity: { type: Number, default: 0 },
  difference: { type: Number, default: 0 },
  adjustment_reason: {
    type: String,
    enum: ['damaged', 'lost', 'found', 'correction', 'return', 'other']
  },
  notes: { type: String },
  checked_by: { type: String },
  checked_at: { type: Date },
}, { _id: false });

const InventorySchema: Schema = new Schema({
  inventory_number: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  items: [InventoryItemSchema],
  total_items: { type: Number, default: 0 },
  items_checked: { type: Number, default: 0 },
  discrepancies_count: { type: Number, default: 0 },
  started_by: { type: String, required: true },
  started_at: { type: Date },
  completed_at: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

InventorySchema.pre('save', function(this: IInventory, next) {
  this.updated_at = new Date();
  
  // Auto-générer le numéro d'inventaire si nécessaire
  if (!this.inventory_number) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    this.inventory_number = `INV${year}${month}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
  }
  
  // Calculer les statistiques
  this.total_items = this.items.length;
  this.items_checked = this.items.filter(item => item.checked_at).length;
  this.discrepancies_count = this.items.filter(item => item.difference !== 0).length;
  
  next();
});

InventorySchema.index({ inventory_number: 1 });
InventorySchema.index({ status: 1 });
InventorySchema.index({ created_at: -1 });

export default mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', InventorySchema);
