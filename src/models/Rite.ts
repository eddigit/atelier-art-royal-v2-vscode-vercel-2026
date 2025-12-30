import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRite extends Document {
  name: string;
  code: string;
  slug: string;
  description?: string;
  image_url?: string;
  image_filename?: string;
  alternate_names?: string[];
  order: number;
  is_active: boolean;
  legacy_id?: string;
  created_at: Date;
  updated_at: Date;
}

const RiteSchema = new Schema<IRite>(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    image_url: { type: String },
    image_filename: { type: String },
    alternate_names: [{ type: String }],
    order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    legacy_id: { type: String, index: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Rite: Model<IRite> =
  mongoose.models.Rite || mongoose.model<IRite>('Rite', RiteSchema);

export default Rite;
