import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IObedience extends Document {
  name: string;
  code: string;
  description?: string;
  image_url?: string;
  order: number;
  is_active: boolean;
  legacy_id?: string;
  created_at: Date;
  updated_at: Date;
}

const ObedienceSchema = new Schema<IObedience>(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String },
    image_url: { type: String },
    order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    legacy_id: { type: String, index: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Obedience: Model<IObedience> =
  mongoose.models.Obedience || mongoose.model<IObedience>('Obedience', ObedienceSchema);

export default Obedience;
