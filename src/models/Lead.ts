import mongoose, { Schema, Document } from 'mongoose';

export type LeadSource = 'website' | 'phone' | 'email' | 'referral' | 'social' | 'event' | 'other';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface ILead extends Document {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  obedience?: string;
  rite?: string;
  degree?: string;
  source: LeadSource;
  status: LeadStatus;
  interest?: string; // Type de produit intéressé
  estimated_value?: number;
  notes?: string;
  assigned_to?: mongoose.Types.ObjectId; // Commercial assigné
  last_contact?: Date;
  next_follow_up?: Date;
  converted_to_customer?: boolean;
  customer_id?: mongoose.Types.ObjectId;
  tags?: string[];
  created_at: Date;
  updated_at: Date;
}

const LeadSchema: Schema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  company: { type: String },
  obedience: { type: String },
  rite: { type: String },
  degree: { type: String },
  source: { 
    type: String, 
    enum: ['website', 'phone', 'email', 'referral', 'social', 'event', 'other'],
    default: 'website'
  },
  status: { 
    type: String, 
    enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
    default: 'new'
  },
  interest: { type: String },
  estimated_value: { type: Number, default: 0 },
  notes: { type: String },
  assigned_to: { type: Schema.Types.ObjectId, ref: 'User' },
  last_contact: { type: Date },
  next_follow_up: { type: Date },
  converted_to_customer: { type: Boolean, default: false },
  customer_id: { type: Schema.Types.ObjectId, ref: 'User' },
  tags: [{ type: String }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

LeadSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

LeadSchema.index({ email: 1 });
LeadSchema.index({ status: 1 });
LeadSchema.index({ assigned_to: 1 });
LeadSchema.index({ created_at: -1 });

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
