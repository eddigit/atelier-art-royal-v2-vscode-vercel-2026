import mongoose, { Schema, Document } from 'mongoose';

export type DealStage = 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'closing' | 'won' | 'lost';
export type DealPriority = 'low' | 'medium' | 'high' | 'critical';

export interface IDealActivity {
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  description: string;
  created_by: string;
  created_at: Date;
}

export interface IDeal extends Document {
  deal_number: string;
  title: string;
  description?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  lead_id?: mongoose.Types.ObjectId;
  stage: DealStage;
  priority: DealPriority;
  estimated_value: number;
  probability: number; // 0-100%
  expected_close_date?: Date;
  actual_close_date?: Date;
  assigned_to: mongoose.Types.ObjectId; // Commercial
  tags?: string[];
  products_interest?: string[];
  activities: IDealActivity[];
  next_action?: string;
  next_action_date?: Date;
  lost_reason?: string;
  commission_rate?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

const DealActivitySchema = new Schema({
  type: {
    type: String,
    enum: ['call', 'email', 'meeting', 'note', 'task'],
    required: true
  },
  description: { type: String, required: true },
  created_by: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
}, { _id: false });

const DealSchema: Schema = new Schema({
  deal_number: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  customer_name: { type: String },
  customer_email: { type: String },
  customer_phone: { type: String },
  lead_id: { type: Schema.Types.ObjectId, ref: 'Lead' },
  stage: {
    type: String,
    enum: ['lead', 'qualification', 'proposal', 'negotiation', 'closing', 'won', 'lost'],
    default: 'lead'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  estimated_value: { type: Number, required: true, default: 0 },
  probability: { type: Number, min: 0, max: 100, default: 50 },
  expected_close_date: { type: Date },
  actual_close_date: { type: Date },
  assigned_to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String }],
  products_interest: [{ type: String }],
  activities: [DealActivitySchema],
  next_action: { type: String },
  next_action_date: { type: Date },
  lost_reason: { type: String },
  commission_rate: { type: Number, min: 0, max: 100 },
  notes: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

DealSchema.pre('save', function(next) {
  this.updated_at = new Date();
  
  // Auto-générer le numéro d'affaire si nécessaire
  if (!this.deal_number) {
    const date = new Date();
    const year = date.getFullYear();
    this.deal_number = `DEAL${year}${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
  }
  
  next();
});

DealSchema.index({ deal_number: 1 });
DealSchema.index({ stage: 1 });
DealSchema.index({ assigned_to: 1 });
DealSchema.index({ expected_close_date: 1 });
DealSchema.index({ created_at: -1 });

export default mongoose.models.Deal || mongoose.model<IDeal>('Deal', DealSchema);
