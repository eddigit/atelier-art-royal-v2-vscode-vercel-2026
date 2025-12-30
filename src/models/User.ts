import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'user' | 'admin';

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  full_name?: string;
  phone?: string;
  role: UserRole;
  
  // Adresses
  billing_address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  shipping_address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  
  // Infos maçonniques (optionnel)
  lodge_name?: string;
  obedience_id?: mongoose.Types.ObjectId;
  degree?: number;
  
  // Fidélité
  loyalty_points: number;
  
  // NextAuth fields
  emailVerified?: Date;
  image?: string;
  
  // Migration
  legacy_id?: string;
  
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    name: { type: String },
    full_name: { type: String },
    phone: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    
    billing_address: {
      street: String,
      city: String,
      postal_code: String,
      country: { type: String, default: 'France' },
    },
    shipping_address: {
      street: String,
      city: String,
      postal_code: String,
      country: { type: String, default: 'France' },
    },
    
    lodge_name: { type: String },
    obedience_id: { type: Schema.Types.ObjectId, ref: 'Obedience' },
    degree: { type: Number, min: 1 },
    
    loyalty_points: { type: Number, default: 0 },
    
    emailVerified: { type: Date },
    image: { type: String },
    
    legacy_id: { type: String, index: true },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
