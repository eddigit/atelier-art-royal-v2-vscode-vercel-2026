import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'user' | 'admin';
export type AccountType = 'personal' | 'lodge' | 'both';

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: UserRole;
  
  // Type de compte
  account_type: AccountType;
  
  // Adresse personnelle de facturation
  billing_address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  
  // Adresse personnelle de livraison
  shipping_address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
    use_billing_address?: boolean;
  };
  
  // Infos maçonniques (qualification client)
  lodge_name?: string;
  lodge_number?: string;
  lodge_address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  obedience_id?: mongoose.Types.ObjectId;
  rite_id?: mongoose.Types.ObjectId;
  degree?: number;
  lodge_role?: string; // Ex: "Vénérable Maître", "Secrétaire", "Trésorier", "Frère"
  
  // Préférences de commande
  default_shipping_type: 'personal' | 'lodge';
  preferred_categories?: mongoose.Types.ObjectId[];
  
  // Fidélité et statistiques
  loyalty_points: number;
  total_orders: number;
  total_spent: number;
  last_order_date?: Date;
  
  // Notifications
  newsletter_subscribed: boolean;
  order_notifications: boolean;
  promo_notifications: boolean;
  
  // NextAuth fields
  emailVerified?: Date;
  image?: string;
  
  // Onboarding
  onboarding_completed: boolean;
  onboarding_step: number;
  
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
    first_name: { type: String },
    last_name: { type: String },
    phone: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    
    account_type: { type: String, enum: ['personal', 'lodge', 'both'], default: 'personal' },
    
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
      use_billing_address: { type: Boolean, default: true },
    },
    
    lodge_name: { type: String },
    lodge_number: { type: String },
    lodge_address: {
      street: String,
      city: String,
      postal_code: String,
      country: { type: String, default: 'France' },
    },
    obedience_id: { type: Schema.Types.ObjectId, ref: 'Obedience' },
    rite_id: { type: Schema.Types.ObjectId, ref: 'Rite' },
    degree: { type: Number, min: 1 },
    lodge_role: { type: String },
    
    default_shipping_type: { type: String, enum: ['personal', 'lodge'], default: 'personal' },
    preferred_categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    
    loyalty_points: { type: Number, default: 0 },
    total_orders: { type: Number, default: 0 },
    total_spent: { type: Number, default: 0 },
    last_order_date: { type: Date },
    
    newsletter_subscribed: { type: Boolean, default: true },
    order_notifications: { type: Boolean, default: true },
    promo_notifications: { type: Boolean, default: true },
    
    emailVerified: { type: Date },
    image: { type: String },
    
    onboarding_completed: { type: Boolean, default: false },
    onboarding_step: { type: Number, default: 0 },
    
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
