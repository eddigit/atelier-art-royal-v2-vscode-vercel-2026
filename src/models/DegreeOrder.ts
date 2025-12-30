import mongoose, { Schema, Document, Model } from 'mongoose';

export type LobeType = 'Loge Symbolique' | 'Loge Hauts Grades';

export interface IDegreeOrder extends Document {
  name: string;
  level: number;
  loge_type: LobeType;
  description?: string;
  order: number;
  is_active: boolean;
  legacy_id?: string;
  created_at: Date;
  updated_at: Date;
}

const DegreeOrderSchema = new Schema<IDegreeOrder>(
  {
    name: { type: String, required: true },
    level: { type: Number, required: true },
    loge_type: { 
      type: String, 
      enum: ['Loge Symbolique', 'Loge Hauts Grades'],
      required: true 
    },
    description: { type: String },
    order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    legacy_id: { type: String, index: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Index composé pour trier par type de loge et niveau
DegreeOrderSchema.index({ loge_type: 1, level: 1 });

const DegreeOrder: Model<IDegreeOrder> =
  mongoose.models.DegreeOrder || mongoose.model<IDegreeOrder>('DegreeOrder', DegreeOrderSchema);

export default DegreeOrder;
